alter table public.game_sessions add column if not exists question_deck_locked boolean not null default false;

-- Strict delivery policy: commit the entire transmitted deck before returning it.
-- Deliberately excludes undrawn questions from abandoned decks as well.
-- Existing profile merges already merge question_seen, so delivery history follows accounts.
create or replace function public.reserve_unseen_questions(
  p_session_id uuid,
  p_device_tokens text[],
  p_online_session_id uuid,
  p_candidates jsonb,
  p_count integer,
  p_local_history jsonb,
  p_ttl_seconds integer default 900
)
returns table (question jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate jsonb;
  v_profile text;
  v_token text;
  v_key text;
  v_family text;
  v_hash text;
  v_existing_family text;
  v_profiles text[];
  v_request_id uuid := gen_random_uuid();
  v_history_group jsonb;
  v_history_entry jsonb;
  v_history_profile text;
  v_history_family text;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if p_count < 1 or p_count > 60 then raise exception 'invalid_count'; end if;
  if jsonb_typeof(p_candidates) <> 'array' or jsonb_array_length(p_candidates) > 4000 then
    raise exception 'invalid_candidates';
  end if;

  -- Serialize device creation as well as requests sharing only some players.
  for v_token in select distinct token from unnest(p_device_tokens) token order by token loop
    perform pg_advisory_xact_lock(hashtextextended('device:' || v_token, 0));
  end loop;
  select array_agg(distinct resolved.profile_id) into v_profiles
  from public.resolve_player_profiles(p_device_tokens) resolved;

  if p_online_session_id is not null then
    perform 1 from public.game_sessions where id = p_online_session_id for update;
    if not exists (
      select 1 from public.game_players gp
      where gp.session_id = p_online_session_id and gp.user_id = auth.uid()
    ) then raise exception 'not_a_session_member'; end if;
    if exists (select 1 from public.game_players where session_id = p_online_session_id and profile_id is null) then
      raise exception 'participant_history_not_ready';
    end if;
    update public.game_sessions set question_deck_locked = true where id = p_online_session_id;
    select array_agg(distinct profile) into v_profiles
    from unnest(coalesce(v_profiles, '{}'::text[]) || coalesce((
      select array_agg(gp.profile_id) from public.game_players gp
      where gp.session_id = p_online_session_id and gp.profile_id is not null
    ), '{}'::text[])) profile;
  end if;
  if coalesce(array_length(v_profiles, 1), 0) = 0 then raise exception 'no_player_profile'; end if;

  for v_profile in select distinct profile from unnest(v_profiles) profile order by profile loop
    perform pg_advisory_xact_lock(hashtextextended('profile:' || v_profile, 0));
  end loop;
  delete from public.question_reservations
  where profile_id = any(v_profiles) and expires_at <= now();

  for v_candidate in select value from jsonb_array_elements(p_candidates) loop
    if length(coalesce(v_candidate ->> 'id', '')) < 3
       or length(coalesce(v_candidate ->> 'familyId', '')) < 2
       or length(coalesce(v_candidate ->> 'question', '')) < 10 then
      continue;
    end if;
    v_key := public.canonical_knowledge_key(coalesce(v_candidate ->> 'knowledgeKey', v_candidate ->> 'familyId'));
    if length(v_key) < 3 then continue; end if;
    v_family := v_candidate ->> 'familyId';
    select qf.id into v_existing_family from public.question_families qf where qf.knowledge_key = v_key;
    if v_existing_family is not null then
      v_family := v_existing_family;
    else
      insert into public.question_families
        (id, knowledge_key, category, topic, subcategory, needs_family_review)
      values (
        v_family, v_key, v_candidate ->> 'category', v_candidate ->> 'subcategory',
        v_candidate ->> 'subcategory', not (v_candidate ? 'knowledgeKey')
      )
      on conflict (id) do update set updated_at = now()
      returning id into v_family;
    end if;

    v_hash := encode(extensions.digest(trim(regexp_replace(lower(v_candidate ->> 'question'), '[^[:alnum:]]+', ' ', 'g')), 'sha256'), 'hex');
    select q.family_id into v_existing_family
    from public.questions q where q.id = v_candidate ->> 'id' or q.content_hash = v_hash
    order by (q.id = v_candidate ->> 'id') desc limit 1;
    if v_existing_family is not null then v_family := v_existing_family; end if;

    insert into public.question_concepts (id, label)
    values (coalesce(v_candidate ->> 'conceptId', v_family), v_candidate ->> 'question')
    on conflict do nothing;
    insert into public.questions (
      id, concept_id, family_id, type, question, answers, correct_answer,
      category, subcategory, difficulty, language, tags, source_provider,
      source_license, verification_status, confidence, quality_score, state,
      explanation, active, content_hash, needs_family_review
    ) values (
      v_candidate ->> 'id', coalesce(v_candidate ->> 'conceptId', v_family), v_family,
      coalesce(v_candidate ->> 'type', 'mcq'), v_candidate ->> 'question',
      coalesce(v_candidate -> 'answers', '[]'::jsonb), coalesce((v_candidate ->> 'correctAnswer')::integer, 0),
      coalesce(v_candidate ->> 'category', 'culture-generale'), coalesce(v_candidate ->> 'subcategory', 'general'),
      coalesce(v_candidate ->> 'difficulty', 'medium'), coalesce(v_candidate ->> 'language', 'fr'),
      coalesce((select array_agg(value #>> '{}') from jsonb_array_elements(coalesce(v_candidate -> 'tags', '[]'::jsonb))), '{}'::text[]),
      coalesce(v_candidate #>> '{source,provider}', 'database'), coalesce(v_candidate #>> '{source,license}', 'CC0'),
      coalesce(v_candidate #>> '{verification,status}', 'unverified'),
      coalesce((v_candidate ->> 'confidence')::numeric, 0.9), coalesce((v_candidate ->> 'qualityScore')::numeric, 0.9),
      case when coalesce(v_candidate #>> '{verification,status}', 'unverified') = 'verified' then 'verified' else 'review' end,
      v_candidate ->> 'explanation', true, v_hash, not (v_candidate ? 'knowledgeKey')
    )
    on conflict (id) do update set
      family_id = excluded.family_id,
      content_hash = coalesce(public.questions.content_hash, excluded.content_hash),
      updated_at = now();

    insert into public.question_selection_work
      (request_id, ordinal, question_id, family_id, payload, usage_count, category, topic)
    values (
      v_request_id,
      (select count(*) from public.question_selection_work where request_id = v_request_id),
      v_candidate ->> 'id', v_family,
      v_candidate || jsonb_build_object('familyId', v_family, 'knowledgeKey', v_key, 'contentHash', v_hash),
      coalesce((select usage_count from public.questions where id = v_candidate ->> 'id'), 0),
      v_candidate ->> 'category', v_candidate ->> 'subcategory'
    ) on conflict (request_id, family_id) do nothing;
  end loop;

  -- Reprise non destructive de l'historique local des versions précédentes.
  -- Elle se déroule après l'ingestion des familles afin de respecter les FK.
  if jsonb_typeof(p_local_history) = 'array' then
    for v_history_group in select value from jsonb_array_elements(p_local_history) loop
      select pd.profile_id into v_history_profile
      from public.player_devices pd
      where pd.device_token_hash = encode(extensions.digest(v_history_group ->> 'profileId', 'sha256'), 'hex')
      limit 1;
      if v_history_profile is null or not (v_history_profile = any(v_profiles)) or jsonb_typeof(v_history_group -> 'entries') <> 'array' then continue; end if;
      for v_history_entry in select value from jsonb_array_elements(v_history_group -> 'entries') loop
        select qf.id into v_history_family
        from public.question_families qf
        where qf.id = v_history_entry ->> 'familyId'
           or qf.knowledge_key = public.canonical_knowledge_key(v_history_entry ->> 'familyId')
        order by (qf.id = v_history_entry ->> 'familyId') desc
        limit 1;
        if v_history_family is null then continue; end if;
        insert into public.question_seen (id, profile_id, family_id, question_id, first_seen_at, answered_at, correct)
        values (
          'seen_' || encode(extensions.gen_random_bytes(12), 'hex'),
          v_history_profile,
          v_history_family,
          coalesce(v_history_entry ->> 'questionId', v_history_family),
          now(),
          case when (v_history_entry ->> 'answeredCorrectly') is null then null else now() end,
          case when (v_history_entry ->> 'answeredCorrectly') is null then null
            else (v_history_entry ->> 'answeredCorrectly')::boolean end
        )
        on conflict on constraint question_seen_profile_id_family_id_key do nothing;
      end loop;
    end loop;
  end if;

  return query
  with available as (
    select distinct on (c.family_id) c.*
    from public.question_selection_work c
    where c.request_id = v_request_id
    and not exists (
      select 1 from public.question_seen qs
      where qs.family_id = c.family_id and qs.profile_id = any(v_profiles)
    )
    and not exists (
      select 1 from public.question_reservations qr
      where qr.family_id = c.family_id and qr.profile_id = any(v_profiles) and qr.expires_at > now()
    )
    order by c.family_id, c.usage_count, c.ordinal
  ), chosen as (
    select a.* from available a
    order by a.usage_count,
      hashtextextended(a.family_id || p_session_id::text, 0),
      a.category, a.topic
    limit p_count
  ), reserved as (
    insert into public.question_reservations
      (id, session_id, profile_id, family_id, question_id, expires_at)
    select
      'res_' || encode(extensions.gen_random_bytes(12), 'hex'),
      p_session_id::text, profile, chosen.family_id, chosen.question_id,
      now() + make_interval(secs => greatest(60, least(p_ttl_seconds, 3600)))
    from chosen cross join unnest(v_profiles) profile
    on conflict (profile_id, family_id) do nothing
    returning family_id, profile_id, question_id, session_id
  ), delivered as (
    insert into public.question_seen (id, profile_id, family_id, question_id, session_id)
    select 'seen_' || encode(extensions.gen_random_bytes(12), 'hex'),
      reserved.profile_id, reserved.family_id, reserved.question_id, reserved.session_id
    from reserved
    on conflict (profile_id, family_id) do nothing
    returning family_id
  )
  select chosen.payload || jsonb_build_object('usageCount', chosen.usage_count)
  from chosen
  where (select count(*) from delivered where delivered.family_id = chosen.family_id) = cardinality(v_profiles)
  order by chosen.usage_count, hashtextextended(chosen.family_id || p_session_id::text, 0);

  delete from public.question_selection_work where request_id = v_request_id;
end;
$$;


revoke all on function public.reserve_unseen_questions(uuid,text[],uuid,jsonb,integer,jsonb,integer) from public, anon;
grant execute on function public.reserve_unseen_questions(uuid,text[],uuid,jsonb,integer,jsonb,integer) to authenticated;
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

  if target_session.phase = 'playing' or target_session.question_deck_locked then
    raise exception 'round_already_prepared';
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


create or replace function public.unlock_question_deck_on_reset()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.phase = 'lobby' and new.question_index = -1 and new.current_question is null then
    new.question_deck_locked := false;
  end if;
  return new;
end;
$$;
create trigger unlock_question_deck_on_reset
before update of current_question, question_index on public.game_sessions
for each row execute function public.unlock_question_deck_on_reset();
revoke all on function public.join_game_session(text,text) from public, anon;
grant execute on function public.join_game_session(text,text) to authenticated;
