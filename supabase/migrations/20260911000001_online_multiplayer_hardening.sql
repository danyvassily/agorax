alter table public.game_sessions
  add column if not exists game_language text not null default 'fr',
  add column if not exists language_mode text not null default 'per-player',
  add column if not exists question_started_at timestamptz,
  add column if not exists question_duration_seconds integer,
  add column if not exists paused_remaining_ms integer;

alter table public.game_sessions drop constraint if exists game_sessions_game_language_check;
alter table public.game_sessions add constraint game_sessions_game_language_check check (game_language in ('fr','en'));
alter table public.game_sessions drop constraint if exists game_sessions_language_mode_check;
alter table public.game_sessions add constraint game_sessions_language_mode_check check (language_mode in ('shared','per-player'));
alter table public.game_sessions drop constraint if exists game_sessions_question_duration_seconds_check;
alter table public.game_sessions add constraint game_sessions_question_duration_seconds_check check (question_duration_seconds is null or question_duration_seconds between 1 and 600);
alter table public.game_sessions drop constraint if exists game_sessions_paused_remaining_ms_check;
alter table public.game_sessions add constraint game_sessions_paused_remaining_ms_check check (paused_remaining_ms is null or paused_remaining_ms between 0 and 600000);

alter table public.room_answers add column if not exists scored_at timestamptz;

create or replace function public.join_game_session(p_room_code text, p_player_name text)
returns table(session_id uuid, player_id uuid)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  target_session public.game_sessions%rowtype;
  existing_player_id uuid;
  created_player_id uuid;
  current_user_id uuid := auth.uid();
  safe_name text := left(nullif(trim(p_player_name), ''), 20);
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select gs.* into target_session
  from public.game_sessions gs
  where gs.room_code = upper(trim(p_room_code))
  for update;

  if not found or target_session.phase not in ('lobby','playing') or target_session.host_id is null then
    raise exception using errcode = 'P0002', message = 'room_not_found';
  end if;

  select gp.id into existing_player_id
  from public.game_players gp
  where gp.session_id = target_session.id and gp.user_id = current_user_id
  limit 1;

  if existing_player_id is not null then
    return query select target_session.id, existing_player_id;
    return;
  end if;

  if (select count(*) from public.game_players gp where gp.session_id = target_session.id) >= target_session.max_players then
    raise exception using errcode = 'P0001', message = 'room_capacity_reached';
  end if;

  insert into public.game_players (session_id, user_id, name, is_host, ready, is_spectator)
  values (target_session.id, current_user_id, coalesce(safe_name, 'Joueur'), false, false, target_session.phase = 'playing')
  returning id into created_player_id;

  return query select target_session.id, created_player_id;
end;
$function$;

create or replace function public.claim_room_buzzer(p_session_id uuid, p_player_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare target public.game_sessions%rowtype;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into target from public.game_sessions where id = p_session_id for update;
  if not found or target.phase <> 'playing' or target.answers_revealed or target.mode <> 'agorax' or target.current_question is null then return false; end if;
  if not exists (
    select 1 from public.game_players
    where id = p_player_id and session_id = p_session_id and user_id = auth.uid() and coalesce(is_spectator, false) = false
  ) then raise exception 'not_room_player'; end if;
  if target.buzzer_player_id is not null then return target.buzzer_player_id = p_player_id; end if;

  update public.game_sessions
  set buzzer_player_id = p_player_id,
      state_version = state_version + 1
  where id = p_session_id;
  return true;
end;
$function$;

create or replace function public.submit_room_buzzer_answer(
  p_session_id uuid,
  p_player_id uuid,
  p_question_index integer,
  p_answer_index integer,
  p_response_time_ms integer
)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  target public.game_sessions%rowtype;
  inserted_count integer;
  answer_count integer;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into target from public.game_sessions where id = p_session_id for update;
  if not found
     or target.phase <> 'playing'
     or target.answers_revealed
     or target.mode <> 'agorax'
     or target.buzzer_player_id <> p_player_id
     or target.question_index <> p_question_index
     or target.current_question is null then return false; end if;

  answer_count := coalesce(jsonb_array_length(target.current_question -> 'answers'), 0);
  if p_answer_index < 0 or p_answer_index >= answer_count then raise exception 'invalid_answer'; end if;

  if not exists (
    select 1 from public.game_players
    where id = p_player_id and session_id = p_session_id and user_id = auth.uid() and coalesce(is_spectator, false) = false
  ) then raise exception 'not_room_player'; end if;

  insert into public.room_answers (session_id, player_id, question_index, answer_index, response_time_ms)
  values (p_session_id, p_player_id, p_question_index, p_answer_index, greatest(0, p_response_time_ms))
  on conflict (session_id, player_id, question_index) do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$function$;

create or replace function public.increment_player_score(p_player_id uuid, p_points integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  target_session_id uuid;
  target_question_index integer;
  marked_count integer;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_points < 0 or p_points > 1000 then raise exception 'invalid_points'; end if;

  select gs.id, gs.question_index
  into target_session_id, target_question_index
  from public.game_players gp
  join public.game_sessions gs on gs.id = gp.session_id
  where gp.id = p_player_id and gs.host_id = auth.uid()
  for update of gs;

  if target_session_id is null then raise exception 'not_room_host'; end if;

  update public.room_answers
  set scored_at = now()
  where session_id = target_session_id
    and player_id = p_player_id
    and question_index = target_question_index
    and correct is true
    and scored_at is null;
  get diagnostics marked_count = row_count;

  if marked_count > 0 then
    update public.game_players
    set score = score + (p_points * marked_count)
    where id = p_player_id and session_id = target_session_id;
  end if;
end;
$function$;

create or replace function public.reset_online_round(p_session_id uuid, p_mode text default null)
returns public.game_sessions
language plpgsql
security definer
set search_path to 'public'
as $function$
declare target public.game_sessions%rowtype;
begin
  select * into target from public.game_sessions where id = p_session_id for update;
  if not found then raise exception 'room_not_found'; end if;
  if target.host_id <> auth.uid() then raise exception 'not_room_host'; end if;
  if p_mode is not null and p_mode not in ('classic', 'rapidfire', 'truefalse', 'teambattle', 'agorax') then
    raise exception 'invalid_game_mode';
  end if;

  delete from public.room_answers where session_id = p_session_id;
  update public.game_players set score = 0, is_spectator = false where session_id = p_session_id;
  update public.game_sessions
  set phase = 'lobby',
      mode = coalesce(nullif(p_mode, ''), mode),
      question_index = -1,
      current_question = null,
      answers_revealed = false,
      buzzer_player_id = null,
      question_started_at = null,
      question_duration_seconds = null,
      paused_remaining_ms = null,
      state_version = state_version + 1
  where id = p_session_id
  returning * into target;
  return target;
end;
$function$;

create or replace function public.ensure_game_session_state_version()
returns trigger
language plpgsql
security invoker
set search_path to 'public'
as $function$
begin
  if new.state_version is null or new.state_version <= old.state_version then
    new.state_version := old.state_version + 1;
  end if;
  return new;
end;
$function$;

drop trigger if exists game_sessions_state_version_monotonic on public.game_sessions;
create trigger game_sessions_state_version_monotonic
before update on public.game_sessions
for each row execute function public.ensure_game_session_state_version();

create or replace function public.activate_midgame_spectators()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.phase = 'playing' and new.question_index > old.question_index then
    update public.game_players
    set is_spectator = false
    where session_id = new.id and coalesce(is_spectator, false) = true;
  end if;
  return new;
end;
$function$;

drop trigger if exists game_sessions_activate_midgame_spectators on public.game_sessions;
create trigger game_sessions_activate_midgame_spectators
after update of question_index on public.game_sessions
for each row execute function public.activate_midgame_spectators();

create or replace function public.handle_online_host_departure()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  next_player public.game_players%rowtype;
begin
  if old.is_host is not true then return old; end if;

  select * into next_player
  from public.game_players
  where session_id = old.session_id and id <> old.id
  order by created_at asc
  limit 1;

  if found then
    update public.game_players set is_host = true, ready = true where id = next_player.id;
    update public.game_sessions
    set host_id = next_player.user_id,
        phase = 'lobby',
        question_index = -1,
        current_question = null,
        answers_revealed = false,
        buzzer_player_id = null,
        question_started_at = null,
        question_duration_seconds = null,
        paused_remaining_ms = null,
        state_version = state_version + 1
    where id = old.session_id;
  else
    update public.game_sessions
    set host_id = null,
        phase = 'finished',
        current_question = null,
        answers_revealed = false,
        buzzer_player_id = null,
        question_started_at = null,
        question_duration_seconds = null,
        paused_remaining_ms = null,
        state_version = state_version + 1
    where id = old.session_id;
  end if;
  return old;
end;
$function$;

drop trigger if exists game_players_host_departure on public.game_players;
create trigger game_players_host_departure
after delete on public.game_players
for each row execute function public.handle_online_host_departure();

drop policy if exists room_answers_insert_member on public.room_answers;
create policy room_answers_insert_member on public.room_answers
for insert to authenticated
with check (
  exists (
    select 1
    from public.game_sessions gs
    join public.game_players gp on gp.session_id = gs.id
    where gs.id = room_answers.session_id
      and gp.id = room_answers.player_id
      and gp.user_id = (select auth.uid())
      and coalesce(gp.is_spectator, false) = false
      and gs.phase = 'playing'
      and gs.answers_revealed = false
      and gs.question_index = room_answers.question_index
      and room_answers.answer_index >= 0
      and room_answers.answer_index < coalesce(jsonb_array_length(gs.current_question -> 'answers'), 0)
      and (
        gs.question_started_at is null
        or gs.question_duration_seconds is null
        or now() <= gs.question_started_at + make_interval(secs => gs.question_duration_seconds + 2)
      )
  )
);

revoke execute on function public.claim_room_buzzer(uuid, uuid) from anon;
revoke execute on function public.submit_room_buzzer_answer(uuid, uuid, integer, integer, integer) from anon;
revoke execute on function public.increment_player_score(uuid, integer) from anon;
revoke execute on function public.reset_online_round(uuid, text) from anon;
revoke execute on function public.join_game_session(text, text) from anon;
grant execute on function public.claim_room_buzzer(uuid, uuid) to authenticated;
grant execute on function public.submit_room_buzzer_answer(uuid, uuid, integer, integer, integer) to authenticated;
grant execute on function public.increment_player_score(uuid, integer) to authenticated;
grant execute on function public.reset_online_round(uuid, text) to authenticated;
grant execute on function public.join_game_session(text, text) to authenticated;
