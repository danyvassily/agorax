-- ============================================================
-- AgoraX — Rejoindre en cours de partie (Spectateur Actif)
-- Permet à un joueur d'entrer dans un salon même si la phase est 'playing'
-- (devient spectateur sur la question en cours, joueur actif à la suivante).
-- ============================================================

create or replace function public.join_game_session(
  p_room_code text,
  p_player_name text
)
returns table (session_id uuid, player_id uuid)
language plpgsql
security definer
set search_path = public
as $$
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

  select gs.*
    into target_session
    from public.game_sessions gs
    where gs.room_code = upper(trim(p_room_code))
    for update;

  -- Permet de rejoindre en phase 'lobby' OU en phase 'playing' (spectateur actif)
  if not found or target_session.phase not in ('lobby', 'playing') or target_session.host_id is null then
    raise exception using errcode = 'P0002', message = 'room_not_found';
  end if;

  select gp.id
    into existing_player_id
    from public.game_players gp
    where gp.session_id = target_session.id
      and gp.user_id = current_user_id
    limit 1;

  if existing_player_id is not null then
    return query select target_session.id, existing_player_id;
    return;
  end if;

  if (
    select count(*)
    from public.game_players gp
    where gp.session_id = target_session.id
  ) >= target_session.max_players then
    raise exception using errcode = 'P0001', message = 'room_capacity_reached';
  end if;

  insert into public.game_players (session_id, user_id, name, is_host)
  values (target_session.id, current_user_id, coalesce(safe_name, 'Joueur'), false)
  returning id into created_player_id;

  return query select target_session.id, created_player_id;
end;
$$;

revoke all on function public.join_game_session(text, text) from public;
grant execute on function public.join_game_session(text, text) to authenticated;
