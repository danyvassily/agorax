-- ============================================================
-- Agorax — Player Profile language & preference
-- ============================================================

alter table public.player_profiles
  add column if not exists language text not null default 'fr'
    check (language in ('fr','en','es','de','it','pt'));

comment on column public.player_profiles.language is 'Langue préférée du joueur pour l''interface et les quiz (fr, en, ...)';
