/** Test local des garanties SQL ajoutées aux salons et au quota IA. */
import { createClient } from "@supabase/supabase-js";

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const envFile = join(root, ".env.local");
const localEnv = existsSync(envFile)
  ? Object.fromEntries(
      readFileSync(envFile, "utf8")
        .split("\n")
        .filter((l) => l.includes("=") && !l.startsWith("#"))
        .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
    )
  : {};

const url = process.env.LOCAL_SUPABASE_URL || localEnv.LOCAL_SUPABASE_URL;
const key = process.env.LOCAL_SUPABASE_KEY || localEnv.LOCAL_SUPABASE_KEY;
if (!url || !key) {
  console.warn("⚠️  LOCAL_SUPABASE_URL ou LOCAL_SUPABASE_KEY non défini — test fumée SQL local ignoré.");
  process.exit(0);
}

function client(name) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: `jouxta-smoke-${name}` },
  });
}

async function anonymous(sb, name) {
  const { data, error } = await sb.auth.signInAnonymously({ options: { data: { username: name } } });
  if (error || !data.user) throw error ?? new Error(`Connexion impossible pour ${name}`);
  return data.user;
}

const host = client("host");
const second = client("second");
const overflow = client("overflow");
const [hostUser, secondUser] = await Promise.all([
  anonymous(host, "Host"),
  anonymous(second, "Second"),
  anonymous(overflow, "Overflow"),
]);

const roomCode = `T${Date.now().toString(36).slice(-5)}`.toUpperCase();
const { data: room, error: roomError } = await host
  .from("game_sessions")
  .insert({ room_code: roomCode, host_id: hostUser.id, phase: "lobby", max_players: 2 })
  .select()
  .single();
if (roomError) throw roomError;

const { error: hostPlayerError } = await host.from("game_players").insert({
  session_id: room.id,
  user_id: hostUser.id,
  name: "Host",
  is_host: true,
});
if (hostPlayerError) throw hostPlayerError;

const { error: joinError } = await second.rpc("join_game_session", {
  p_room_code: roomCode,
  p_player_name: "Second",
});
if (joinError) throw joinError;

const { error: overflowError } = await overflow.rpc("join_game_session", {
  p_room_code: roomCode,
  p_player_name: "Overflow",
});
if (!overflowError?.message.includes("room_capacity_reached")) {
  throw new Error("Le dépassement de capacité n'a pas été bloqué");
}

const quotaResults = [];
for (let attempt = 0; attempt < 4; attempt += 1) {
  const { data, error } = await host.rpc("consume_ai_question_quota", {
    p_limit: 3,
    p_window_minutes: 10,
  });
  if (error) throw error;
  quotaResults.push(data);
}
if (quotaResults.join(",") !== "true,true,true,false") {
  throw new Error(`Quota IA inattendu : ${quotaResults.join(",")}`);
}

const { data: secondPlayer, error: secondPlayerError } = await second
  .from("game_players")
  .select("id")
  .eq("session_id", room.id)
  .eq("user_id", secondUser.id)
  .single();
if (secondPlayerError) throw secondPlayerError;
const { error: leaveError } = await second.from("game_players").delete().eq("id", secondPlayer.id);
if (leaveError) throw leaveError;

const { count, error: countError } = await host
  .from("game_players")
  .select("id", { count: "exact", head: true })
  .eq("session_id", room.id);
if (countError) throw countError;
if (count !== 1) throw new Error(`Départ non appliqué : ${count} joueurs restants`);

console.log("Salon atomique, capacité, départ et quota IA : OK");
