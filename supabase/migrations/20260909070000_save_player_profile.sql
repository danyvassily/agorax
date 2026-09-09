-- Migration: save_player_profile RPC
-- Permet la persistance atomique et sécurisée du profil (pseudo, avatar, langue)
-- pour les comptes authentifiés (via auth.uid()) et les invités (via device_token).

create or replace function public.save_player_profile(
  p_profile_id text,
  p_nickname text,
  p_avatar_url text,
  p_language text,
  p_device_token text default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user uuid := auth.uid();
  v_is_account boolean := v_user is not null and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
  v_profile text;
  v_hash text;
  v_clean_nick text := trim(substring(coalesce(p_nickname, 'Joueur') from 1 for 24));
  v_lang text := case when p_language in ('fr', 'en') then p_language else 'fr' end;
begin
  if v_is_account then
    -- Utilisateur connecté : vérifie que le profil est associé à son user_id
    select pp.id into v_profile
    from public.player_profiles pp
    where pp.user_id = v_user and (pp.id = p_profile_id or p_profile_id is null)
    order by pp.created_at
    limit 1;

    -- Si aucun profil trouvé par ID, cherche le profil principal du compte
    if v_profile is null then
      select pp.id into v_profile
      from public.player_profiles pp
      where pp.user_id = v_user
      order by pp.created_at
      limit 1;
    end if;
  elsif p_device_token is not null and length(p_device_token) >= 12 then
    -- Invité : valide la possession du profil via le hash du device_token
    v_hash := encode(extensions.digest(p_device_token, 'sha256'), 'hex');
    select pd.profile_id into v_profile
    from public.player_devices pd
    where pd.device_token_hash = v_hash and (pd.profile_id = p_profile_id or p_profile_id is null)
    limit 1;
  end if;

  if v_profile is null then
    raise exception 'profile_not_authorized';
  end if;

  update public.player_profiles
  set
    nickname = case when length(v_clean_nick) > 0 then v_clean_nick else 'Joueur' end,
    avatar_url = p_avatar_url,
    language = v_lang,
    updated_at = now()
  where id = v_profile;

  return jsonb_build_object(
    'id', v_profile,
    'nickname', case when length(v_clean_nick) > 0 then v_clean_nick else 'Joueur' end,
    'avatar_url', p_avatar_url,
    'language', v_lang
  );
end;
$$;

grant execute on function public.save_player_profile to anon, authenticated;
