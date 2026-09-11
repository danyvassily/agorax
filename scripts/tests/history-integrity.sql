-- Transactional integration test: all fixtures and changes roll back.
begin;
do $$
declare
  uid uuid := gen_random_uuid();
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
end;
$$;
rollback;
