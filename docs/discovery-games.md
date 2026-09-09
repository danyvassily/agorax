# Discovery games

Seven original French/English packs (42 cards): couple connection, deeper
conversations, opt-in adult intimacy, well-being check-in, optional exercises,
astrology traditions quiz and imaginary portraits/compatibility discussion.

Entry points: solo and local multiplayer catalogues, or `/play/discovery`.
The device selector links to a discovery room for remote play.

## Privacy and product limits

- No text answers, questionnaire results, psychological profiles, ELO or roasts
  are collected. Players reflect privately or talk using their own voice call.
- Adult cards are hidden until each local participant, or each remote device's
  player, confirms adulthood and voluntary participation. This is self-declaration,
  not identity/age verification. Withdrawal hides content immediately.
- Remote host progression is manual. The host must ask whether everyone is
  comfortable; this is not a server-enforced unanimous-consent protocol.
- Well-being content is not a validated clinical questionnaire or professional
  treatment. Original prompts link to the WHO guide as further reading; they do
  not reproduce the guide or imply its endorsement.
- Astrology is explicitly entertainment, not scientific assessment or prediction.
- Seen card IDs are persisted on the current device, never personal responses.
  Exhaustion requires an explicit replay. This is not
  account-wide or cross-device history; remote selection currently uses the
  host's displayed-card history, not an aggregation of every participant.

## Rooms

Reuses existing Supabase identity, room creation/membership, subscriptions and
host-only RLS on `game_sessions`. No migration or production change performed.
`mode = discovery`; `current_question.discovery` contains only validated pack,
deck and round IDs. Language rendering is local to each device. Updates include
the expected `state_version`, preventing stale host writes from overwriting a
newer state. Switching packs retains the same discovery room code and players.
The existing quiz entry redirects discovery codes to the dedicated experience.
Quiz and discovery rounds have separate UIs; switching from a quiz room to a
discovery room is not implemented as an in-place mode change.

## Validation

- `npm test`: catalogue, bilingual completeness, adult-pack isolation, exhaustion,
  malformed remote decks, unknown packs and shared payload privacy tests.
- `npm run typecheck`, `npm run lint`, `npm run build`.
- `TEST_BASE_URL=http://localhost:3001 PLAYWRIGHT_CHANNEL=chrome node scripts/tests/smoke-discovery-ui.mjs`
  tests mobile consent gating/withdrawal, private handoff, English rendering and
  remote catalogue links. Omit `PLAYWRIGHT_CHANNEL` for installed Playwright Chromium.
- Real multi-device Supabase validation requires a non-production test project.
  No local Supabase test credentials were available during implementation.
