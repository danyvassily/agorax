-- Transactional integration test: all fixtures and changes roll back.
begin;
do $$
declare
  uid uuid := gen_random_uuid();
  guest_uid uuid := gen_random_uuid();
  online_sid uuid := gen_random_uuid();
  profile text;
  code text;
  token text := 'test-' || gen_random_uuid()::text;
  token_b text := 'test-' || gen_random_uuid()::text;
  sid uuid := gen_random_uuid();
  family text := 'test.' || gen_random_uuid()::text;
  candidate jsonb;
  selected jsonb;
  n integer;
begin
  insert into auth.users (id) values (uid);
  perform set_config('request.jwt.claims', jsonb_build_object('sub',uid,'is_anonymous',true,'role','authenticated')::text,true);
  candidate := jsonb_build_object('id','test-' || uid::text,'familyId',family,'knowledgeKey',family,
    'question','Integration test ' || uid::text,'answers',jsonb_build_array('A','B','C','D'),'correctAnswer',0,
    'category','culture-generale','subcategory','general','language','fr','difficulty','medium');
  select question into selected from public.reserve_unseen_questions(sid,array[token],null,jsonb_build_array(candidate),1,'[]');
  if selected is null then raise exception 'new player did not receive a question'; end if;
  -- A delivered deck stays excluded even if its display callback never arrives
  -- and the temporary reservation expires (closed tab / another device).
  delete from public.question_reservations where session_id = sid::text;
  select count(*) into n from public.reserve_unseen_questions(gen_random_uuid(),array[token],null,jsonb_build_array(candidate),1,'[]');
  if n <> 0 then raise exception 'abandoned delivery was reissued after reservation expiry'; end if;
  -- A second session must not receive a reserved family.
  select count(*) into n from public.reserve_unseen_questions(gen_random_uuid(),array[token,token_b],null,jsonb_build_array(candidate),1,'[]');
  if n <> 0 then raise exception 'overlapping group bypassed reservation'; end if;
  perform public.mark_question_seen(sid,array[token],null,selected->>'id',selected->>'familyId');
  candidate := candidate || jsonb_build_object('id','variant-' || uid::text,'language','en','question','English translation ' || uid::text);
  select count(*) into n from public.reserve_unseen_questions(gen_random_uuid(),array[token_b,token],null,jsonb_build_array(candidate),1,'[]');
  if n <> 0 then raise exception 'variant or multiplayer union bypassed history'; end if;
  -- Legacy local question IDs may no longer be in the catalog, but their families remain seen.
  select count(*) into n from public.reserve_unseen_questions(gen_random_uuid(),array[token_b],null,jsonb_build_array(candidate),1,
    jsonb_build_array(jsonb_build_object('profileId',token_b,'entries',jsonb_build_array(jsonb_build_object('familyId',selected->>'familyId','questionId','removed-legacy-id','answeredCorrectly',null)))));
  if n <> 0 then raise exception 'legacy history was lost'; end if;
  -- Freeze membership from preparation until the next lobby reset.
  select profile_id into profile from public.resolve_player_profiles(array[token]);
  code := upper(substr(uid::text,1,6));
  insert into public.game_sessions(id,room_code,host_id,phase) values (online_sid,code,uid,'lobby');
  insert into public.game_players(session_id,user_id,profile_id,is_host) values (online_sid,uid,profile,true);
  perform public.reserve_unseen_questions(online_sid,array[token],online_sid,jsonb_build_array(candidate),1,'[]');
  if not (select question_deck_locked from public.game_sessions where id=online_sid) then raise exception 'roster not locked'; end if;
  perform public.join_game_session(code,'Host reconnect');
  insert into auth.users(id) values(guest_uid);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',guest_uid,'is_anonymous',true)::text,true);
  begin
    perform public.join_game_session(code,'Late guest');
    raise exception 'late join allowed';
  exception when others then
    if sqlerrm <> 'round_already_prepared' then raise; end if;
  end;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'is_anonymous',true)::text,true);
  perform public.reset_online_round(online_sid,null);
  if (select question_deck_locked from public.game_sessions where id=online_sid) then raise exception 'roster did not unlock'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',guest_uid,'is_anonymous',true)::text,true);
  perform public.join_game_session(code,'Next round guest');
end;
$$;
rollback;
