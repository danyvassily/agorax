"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppNavigation } from "@/components/ui/app-navigation";
import { KawaiiMascot } from "@/components/ui/kawaii-mascot";
import { useLanguageStore } from "@/lib/store/language";
import { DISCOVERY_PACKS, discoveryDeck, discoveryStateSchema, type DiscoveryState } from "@/lib/game/discovery";
import { createRoom, joinRoom, leaveRoom, subscribePlayers, subscribeSession, type OnlinePlayer, type OnlineSession } from "@/lib/online/room";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function consumeDiscoveryHandoff(roomCode: string): { session: OnlineSession; player: OnlinePlayer } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("Agorax-discovery-handoff");
    sessionStorage.removeItem("Agorax-discovery-handoff");
    if (!raw) return null;
    const handoff = JSON.parse(raw) as { session?: OnlineSession; player?: OnlinePlayer };
    if (handoff.session?.mode === "discovery" && handoff.player?.id && (!roomCode || handoff.session.room_code === roomCode)) {
      return { session: handoff.session, player: handoff.player };
    }
  } catch { /* A malformed handoff is ignored and the normal join form remains. */ }
  return null;
}

/** Only card IDs and progression are shared. No personal answers are collected. */
export function DiscoveryGame() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = useLanguageStore(s => s.language);
  const en = lang === "en";
  const language = en ? "en" : "fr";
  const online = params.get("device") === "online";
  const initialRoomCode = params.get("room") ?? "";
  const initialCount = params.get("solo") === "1" ? 1 : Math.max(2, Math.min(8, Number(params.get("players")) || 2));
  const [names, setNames] = useState<string[]>(Array.from({ length: initialCount }, () => ""));
  const [packId, setPackId] = useState(DISCOVERY_PACKS.some(p => p.id === params.get("pack")) ? params.get("pack")! : DISCOVERY_PACKS[0].id);
  const [localState, setLocalState] = useState<DiscoveryState | null>(null);
  const [localIndex, setLocalIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [visibleKey, setVisibleKey] = useState("");
  const [revealKey, setRevealKey] = useState("");
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [me, setMe] = useState<OnlinePlayer | null>(null);
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [code, setCode] = useState(initialRoomCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exhausted, setExhausted] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(localStorage.getItem("Agorax-discovery-seen-v1") ?? "[]");
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
    } catch { return []; }
  });
  const lock = useRef(false);
  const sessionId = session?.id;

  useEffect(() => {
    if (!online || session) return;
    const timer = window.setTimeout(() => {
      const handoff = consumeDiscoveryHandoff(initialRoomCode);
      if (handoff) { setSession(handoff.session); setMe(handoff.player); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialRoomCode, online, session]);

  useEffect(() => {
    if (!sessionId) return;
    const stopSession = subscribeSession(sessionId, next => setSession(previous => !previous || next.state_version >= previous.state_version ? next : previous));
    const stopPlayers = subscribePlayers(sessionId, setPlayers);
    return () => { stopSession(); stopPlayers(); };
  }, [sessionId]);

  const parsed = discoveryStateSchema.safeParse((session?.current_question as unknown as { discovery?: unknown } | null)?.discovery);
  const state = online ? (parsed.success ? parsed.data : null) : localState;
  const index = online ? session?.question_index ?? 0 : localIndex;
  const pack = DISCOVERY_PACKS.find(p => p.id === (state?.packId ?? packId))!;
  const card = pack.cards.find(c => c.id === state?.deck[index]);
  const host = Boolean(me && session?.host_id === me.user_id);
  const finished = online ? session?.phase === "finished" : Boolean(state && index >= state.deck.length);
  const personNames = online ? [me?.name ?? ""] : names.map((name, i) => name.trim() || `${en ? "Player" : "Joueur"} ${i + 1}`);
  const key = `${state?.roundId}:${index}:${turn}`;
  const consentKeys = personNames.map((_, i) => `${state?.roundId}:${i}`);
  const consent = !pack.adult || consentKeys.every(id => accepted.includes(id));
  const shown = visibleKey === key && consent;

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await action(); } catch { setError(en ? "Unable to sync. Check your connection and try again." : "Synchronisation impossible. Vérifie ta connexion et réessaie."); }
    finally { lock.current = false; setBusy(false); }
  }

  async function enter(join: boolean) {
    await run(async () => {
      const name = names[0].trim() || (en ? "Player" : "Joueur");
      const result = join ? await joinRoom(code, name) : await createRoom(name, { mode: "discovery", category: "mixed", questionCount: 6, maxPlayers: 8 });
      if (result.session.mode !== "discovery") {
        router.push(`/play/online?room=${encodeURIComponent(result.session.room_code)}`);
        return;
      }
      setSession(result.session); setMe(result.player);
    });
  }

  async function update(patch: Partial<OnlineSession>) {
    const sb = getSupabaseBrowser();
    if (!sb || !session || !host) throw new Error("Host required");
    const { data, error: failure } = await sb.from("game_sessions")
      .update({ ...patch, state_version: session.state_version + 1 })
      .eq("id", session.id).eq("host_id", me!.user_id!).eq("state_version", session.state_version)
      .select("*").single();
    if (failure || !data) throw failure ?? new Error("Stale room");
    setSession(data as OnlineSession);
  }

  async function start(replay = false) {
    const deck = discoveryDeck(packId, replay ? [] : seenIds);
    if (!deck.length) { setExhausted(true); return; }
    const next: DiscoveryState = { packId, deck, roundId: crypto.randomUUID() };
    if (online) {
      await run(async () => update({ phase: "playing", question_index: 0, current_question: { question: "Discovery", answers: [], discovery: next } as OnlineSession["current_question"] }));
    } else { setLocalState(next); setLocalIndex(0); }
    setExhausted(false); setTurn(0); setAccepted([]); setVisibleKey("");
  }

  function show() {
    if (!card || !consent) return;
    if (!seenIds.includes(card.id)) {
      const next = [...seenIds, card.id];
      setSeenIds(next);
      try { localStorage.setItem("Agorax-discovery-seen-v1", JSON.stringify(next)); } catch { /* Memory state still works. */ }
    }
    setVisibleKey(key);
  }
  async function next() {
    if (!state) return;
    if (online) { await run(async () => update(index + 1 >= state.deck.length ? { phase: "finished" } : { question_index: index + 1 })); }
    else if (turn + 1 < names.length) setTurn(turn + 1);
    else { setTurn(0); setLocalIndex(index + 1); }
  }
  async function menu() {
    if (online) await run(async () => update({ phase: "lobby", current_question: null, question_index: -1 }));
    else setLocalState(null);
    setAccepted([]); setVisibleKey(""); setExhausted(false);
  }
  const setup = !state && (!online || session?.phase === "lobby");

  return <><AppNavigation /><main className="jx-page max-w-3xl space-y-6">
    <header className="jx-page-title"><span className="jx-eyebrow">{en ? "CONNECT · REFLECT · IMAGINE" : "ÉCHANGER · SE POSER · IMAGINER"}</span><h1>{en ? "A moment for you" : "Un moment pour vous"}</h1>
      <p>{en ? "No personal answers are saved. You can skip, stay silent or stop at any time. No ELO, diagnosis or teasing." : "Aucune réponse personnelle enregistrée. Tu peux passer, rester silencieux·se ou arrêter à tout moment. Ni ELO, ni diagnostic, ni vannes."}</p>
    </header>
    <div className="flex flex-wrap gap-3"><button className="fp-btn-secondary" onClick={() => useLanguageStore.getState().setLanguage(en ? "fr" : "en")}>{en ? "Français" : "English"}</button><Link className="fp-btn-ghost" href="/play/local">{en ? "Other games" : "Autres jeux"}</Link>
      {session && <button disabled={busy} className="fp-btn-ghost" onClick={() => void run(async () => { await leaveRoom(session.id, me!.id); setSession(null); setMe(null); })}>{en ? "Leave room" : "Quitter le salon"}</button>}
    </div>
    {error && <p role="alert" className="jx-error">{error}</p>}
    {online && !session && <section className="jx-form-card space-y-4"><h2>{en ? "Private discovery room" : "Salon découverte privé"}</h2>
      <label className="block">{en ? "Nickname" : "Pseudo"}<input className="fp-input" maxLength={20} value={names[0]} onChange={e => setNames([e.target.value])} /></label>
      <button className="fp-btn-primary" disabled={busy} onClick={() => void enter(false)}>{en ? "Create room" : "Créer le salon"}</button>
      <label className="block">{en ? "Room code" : "Code du salon"}<input className="fp-input" maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase())} /></label>
      <button className="fp-btn-secondary" disabled={busy || code.trim().length !== 6} onClick={() => void enter(true)}>{en ? "Join" : "Rejoindre"}</button>
    </section>}
    {session && <section className="jx-form-card"><h2>{en ? "Room" : "Salon"} : {session.room_code}</h2><p>{players.map(p => p.name).join(" · ")}</p><p>{en ? "Talk using your usual voice call. The host controls the cards; your answers are never sent to this room." : "Discutez avec votre appel vocal habituel. L’hôte pilote les cartes ; vos réponses ne sont jamais envoyées dans ce salon."}</p><button className="fp-btn-secondary mt-3" disabled={busy} onClick={() => void run(async () => { await navigator.clipboard.writeText(`${window.location.origin}/play/discovery?device=online&room=${encodeURIComponent(session.room_code)}`); })}>{en ? "Copy invitation link" : "Copier le lien d’invitation"}</button>{!session.host_id && <p role="alert">{en ? "The host has left. Leave the room to start a new one." : "L’hôte est parti. Quitte le salon pour en créer un nouveau."}</p>}</section>}
    {setup && (!online || host) && <section className="space-y-4">
      {!online && <div className="jx-form-card space-y-3"><label>{en ? "Players" : "Joueurs"}<select className="fp-input" value={names.length} onChange={e => setNames(Array.from({ length: Number(e.target.value) }, (_, i) => names[i] ?? ""))}>{Array.from({ length: 8 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>{names.map((name, i) => <label className="block" key={i}>{en ? "Player" : "Joueur"} {i + 1}<input className="fp-input" maxLength={20} value={name} onChange={e => setNames(names.map((n, j) => i === j ? e.target.value : n))} /></label>)}</div>}
      <div className="jx-game-grid">{DISCOVERY_PACKS.map(p => <button className={`jx-form-card text-left ${packId === p.id ? "ring-2 ring-fp-primary" : ""}`} aria-pressed={packId === p.id} key={p.id} onClick={() => { setPackId(p.id); setExhausted(false); }}><KawaiiMascot theme={p.mascot} size={88} animation="float"/><h2>{p.title[language]}</h2><p>{p.description[language]}</p><small>{p.cards.length} {en ? "cards · solo or together" : "cartes · solo ou ensemble"}</small></button>)}</div>
      {exhausted ? <div role="status"><p>{en ? "All cards in this pack have already been shown on this device. Choose another pack or explicitly replay." : "Toutes les cartes de ce thème ont déjà été affichées sur cet appareil. Choisis un autre thème ou rejoue explicitement."}</p><button className="fp-btn-secondary" onClick={() => void start(true)} disabled={busy}>{en ? "Replay these cards" : "Rejouer ces cartes"}</button></div> : <button className="fp-btn-primary" disabled={busy} onClick={() => void start()}>{en ? "Start" : "Commencer"}</button>}
    </section>}
    {online && session && !host && !state && <p role="status">{en ? "Waiting for the host to choose a pack." : "En attente du choix de l’hôte."}</p>}
    {state && !finished && <section className="jx-form-card space-y-5"><p>{pack.title[language]} · {index + 1}/{state.deck.length}</p><KawaiiMascot theme={pack.mascot} size={130} animation={shown ? "wobble" : "float"} />
      {!consent ? <div className="space-y-4"><h2>{en ? "Adults only · voluntary participation" : "Adultes uniquement · participation volontaire"}</h2><p>{en ? "Each person must freely agree. Nobody owes an answer or a physical action. Consent can be withdrawn at any time." : "Chaque personne doit accepter librement. Personne ne doit une réponse ni un geste. Le consentement peut être retiré à tout moment."}</p>{personNames.map((name, i) => <label className="flex gap-3" key={i}><input type="checkbox" checked={accepted.includes(consentKeys[i])} onChange={e => setAccepted(e.target.checked ? [...accepted, consentKeys[i]] : accepted.filter(k => k !== consentKeys[i]))} />{name} — {en ? "I am 18 or over and I want to participate." : "J’ai 18 ans ou plus et je souhaite participer."}</label>)}</div> : !shown ? <div><h2>{online ? (en ? "Your private turn" : "Ton tour privé") : personNames[turn]}</h2><p>{en ? "Show the card only when you are comfortable. Sharing is optional." : "Affiche la carte seulement si tu le souhaites. Le partage est facultatif."}</p><button className="fp-btn-primary mt-4" onClick={show}>{en ? "Show card" : "Afficher la carte"}</button></div> : <div className="space-y-4"><h2 className="text-2xl">{card?.text[language]}</h2>{card?.reveal && <><button className="fp-btn-secondary" onClick={() => setRevealKey(key)}>{en ? "Show answer" : "Voir la réponse"}</button>{revealKey === key && <p>{card.reveal[language]}</p>}</>}<button className="fp-btn-ghost" onClick={() => setVisibleKey("")}>{en ? "Hide / keep private" : "Masquer / garder pour moi"}</button></div>}
      {(!online || host) && <button className="fp-btn-secondary" disabled={busy} onClick={() => void next()}>{en ? "Skip / next" : "Passer / suite"}</button>}
      {online && !host && <p>{en ? "The host advances after checking that everyone is comfortable." : "L’hôte avance après avoir vérifié que chacun est à l’aise."}</p>}
      {pack.adult && <button className="fp-btn-ghost" onClick={() => { setAccepted([]); setVisibleKey(""); }}>{en ? "Withdraw my consent / hide" : "Retirer mon consentement / masquer"}</button>}
      {(!online || host) && <button className="fp-btn-ghost" disabled={busy} onClick={() => void menu()}>{en ? "Stop / change pack" : "Arrêter / changer de thème"}</button>}
    </section>}
    {finished && <section className="jx-form-card space-y-4"><h2>{en ? "Thank you for this moment" : "Merci pour ce moment"}</h2><p>{en ? "Keep one idea that matters to you. There is no profile to judge and nothing to compare. Your personal reflections have not been recorded." : "Garde une idée qui compte pour toi. Aucun profil à juger, rien à comparer. Tes réflexions personnelles n’ont pas été enregistrées."}</p>{(!online || host) && <button disabled={busy} className="fp-btn-primary" onClick={() => void menu()}>{en ? "Another pack · same group" : "Autre thème · même groupe"}</button>}</section>}
    <footer className="jx-form-card space-y-2 text-sm"><p>{en ? "Well-being: original reflection tools, not clinically validated questionnaires, treatment or professional care. If distress persists, contact a qualified professional. If you are in immediate danger, contact local emergency services." : "Bien-être : outils de réflexion originaux, pas des questionnaires validés cliniquement, un traitement ou un suivi professionnel. Si une souffrance persiste, contacte un professionnel qualifié. En cas de danger immédiat, contacte les urgences locales."}</p><a className="underline" href="https://www.who.int/publications-detail-redirect/9789240003927" target="_blank" rel="noreferrer">{en ? "Further reading: WHO stress-management guide" : "Pour aller plus loin : guide de l’OMS sur le stress"}</a><p>{en ? "Astrology is entertainment, not a scientific measure of personality or relationship compatibility." : "L’astrologie est un divertissement, pas une mesure scientifique de la personnalité ou de la compatibilité amoureuse."}</p></footer>
  </main></>;
}
