"use client";

/**
 * Agorax — Salon persistant & Multijoueur connecté (Apple HIG Design)
 * Fonctionnalités :
 *   - Salon persistant (survit à la fin de partie, même code de salon)
 *   - Changement de mode en direct par l'hôte (Quiz, Rapid Fire, Vrai/Faux, etc.)
 *   - Système Prêt / Sitting Out / Spectateur
 *   - Système d'Amis & invitations en ligne
 *   - Écran Post-Game avec Rejouer, Changer de mode et Retour au salon
 *   - Intégration complète du moteur Anti-Répétition (historique unifié des participants)
 */
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useGameStore, MAX_PLAYERS } from "@/lib/store/game";
import { useHistoryStore } from "@/lib/store/history";
import {
  loadGameQuestions,
  markQuestionAnswered,
  markQuestionDisplayed,
} from "@/lib/questions/question-client";
import {
  createRoom,
  joinRoom,
  subscribeSession,
  subscribePlayers,
  subscribeAnswers,
  hostPushQuestion,
  hostMarkAnswers,
  hostSetPause,
  submitAnswer,
  claimRoomBuzzer,
  submitRoomBuzzerAnswer,
  resetOnlineRound,
  finishRoom,
  leaveRoom,
  refreshAnswers,
  setPlayerReady,
  type OnlineSession,
  type OnlinePlayer,
  type RoomAnswer,
} from "@/lib/online/room";
import { makePlayer } from "@/lib/store/game";
import { MODE_META, QUESTION_COUNT_OPTIONS, modeLabel, categoryLabel } from "@/lib/game/modes";
import { localizeQuestion } from "@/lib/questions/localize";
import { useLanguageStore } from "@/lib/store/language";
import { CATEGORIES, type QuestionCategory } from "@/lib/questions/schema";
import type { Question } from "@/lib/questions/schema";
import type { GameMode } from "@/lib/store/game";
import { TimerBar, Confetti, PlayerDot, SegmentControl, SectionTitle, PillBadge } from "@/components/ui/primitives";
import { KawaiiMascot } from "@/components/ui/kawaii-mascot";
import { RoundRoastPanel } from "@/components/game/round-roast-panel";
import { AppIcon } from "@/components/ui/icons";
import { AppNavigation } from "@/components/ui/app-navigation";
import { useWakeLock } from "@/lib/device/wake-lock";
import { RoomQRCode } from "@/components/game/room-qr-code";
import { PostGameCard } from "@/components/game/post-game-card";
import {
  Globe,
  Play,
  Pause,
  Eye,
  ArrowRight,
  ChevronLeft,
  Minus,
  Plus,
  Copy,
  Check,
  User,
  ShieldCheck,
  Zap,
  Share2,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/lib/auth/use-auth";
import { characterImage, CHARACTERS } from "@/lib/characters";
import { sound } from "@/lib/audio/sound-engine";
import { QuestionMedia } from "@/components/game/question-media";

type View = "entry" | "create" | "lobby" | "playing" | "results";

function elapsedSince(start: number) {
  return Math.max(0, Date.now() - start);
}

const AVAILABLE_ONLINE_MODES: GameMode[] = ["classic", "rapidfire", "truefalse", "teambattle", "agorax"];

export function OnlineRoom() {
  const router = useRouter();
  const { entries } = useHistoryStore();
  const savedPlayers = useGameStore((s) => s.players);
  const { user, isLoggedIn } = useAuth();
  const lang = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const searchParams = useSearchParams();
  const [view, setView] = useState<View>(() => searchParams.get("create") === "1" ? "create" : "entry");
  const [pseudoDraft, setPseudo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("Agorax-saved-nickname");
      } catch {
        return null;
      }
    }
    return null;
  });
  const storedPseudo = pseudoDraft ?? user?.name ?? savedPlayers[0]?.name ?? "";
  const pseudo = lang === "en"
    ? storedPseudo.replace(/^Joueur (\d+)$/, "Player $1")
    : storedPseudo;
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [answers, setAnswers] = useState<RoomAnswer[]>([]);
  const [myPlayer, setMyPlayer] = useState<OnlinePlayer | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const [presence, setPresence] = useState<Record<string, {ready:boolean;language:string;avatarUrl?:string}>>({});
  const [showModeModal, setShowModeModal] = useState(false);
  const roomFromUrl = searchParams.get("room");
  const sessionId = session?.id;
  const sessionPhase = session?.phase;
  const hasCurrentQuestion = Boolean(session?.current_question);

  // Options de création & configuration
  const [currentMode, setCurrentMode] = useState<GameMode>(() => {
    const mode = searchParams.get("mode") as GameMode;
    return AVAILABLE_ONLINE_MODES.includes(mode) ? mode : "classic";
  });
  const [createCategory, setCreateCategory] = useState<QuestionCategory | "mixed">("mixed");
  const [createCount, setCreateCount] = useState<number>(10);
  const [createMaxPlayers, setCreateMaxPlayers] = useState<number>(4);

  const [joinedMidGameIndex, setJoinedMidGameIndex] = useState<number | null>(null);

  const questionsRef = useRef<Question[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<OnlineSession | null>(null);
  const myPlayerRef = useRef<OnlinePlayer | null>(null);
  const startRef = useRef(0);
  const joiningRef = useRef(false);
  const autoJoinedRef = useRef(false);

  // Wake Lock : Empêche la mise en veille de l'écran en cours de partie ou dans le lobby
  useWakeLock(view === "playing" || view === "lobby");

  const handlePseudoChange = (val: string) => {
    setPseudo(val);
    try {
      if (val.trim()) {
        localStorage.setItem("Agorax-saved-nickname", val.trim());
      }
    } catch {
      // non bloquant
    }
  };

  const isHost = myPlayer?.is_host === true;
  const isBuzzerMode = currentMode === "agorax";
  const buzzerPlayer = players.find((player) => player.id === session?.buzzer_player_id);
  const iOwnBuzzer = Boolean(myPlayer && session?.buzzer_player_id === myPlayer.id);
  const currentQuestion: Question | null =
    questions[index()] ?? (session?.current_question as Question | null) ?? null;
  const revealed = session?.answers_revealed ?? false;
  const isPaused = Boolean(session?.current_question?.is_paused);
  const isSpectatingCurrent = joinedMidGameIndex !== null && joinedMidGameIndex === index();
  const questionCount = currentMode === "rapidfire" ? 20 : session?.question_count ?? questions.length ?? 10;
  const timePerQuestion = currentMode === "rapidfire" ? 6 : 15;

  function index() {
    return session?.question_index ?? 0;
  }

  async function togglePause() {
    if (!session || !isHost) return;
    try {
      await hostSetPause(session.id, !isPaused);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier la pause");
    }
  }

  // Abonnements Realtime quand un salon est actif
  useEffect(() => {
    if (!sessionId) return;
    const unsubSession = subscribeSession(sessionId, (s) => {
      sessionRef.current = s;
      setSession(s);
      if (s.mode) setCurrentMode(s.mode as GameMode);
    });
    const unsubPlayers = subscribePlayers(sessionId, (pl) => {
      setPlayers(pl);
      const cached = myPlayerRef.current;
      if (cached) {
        const updated = pl.find((p) => p.id === cached.id) ?? cached;
        myPlayerRef.current = updated;
        setMyPlayer(updated);
      }
    });
    const unsubAnswers = subscribeAnswers(sessionId, (freshAnswers) => {
      setAnswers(freshAnswers);
      // Récupération sans perte d'état si le joueur recharge en cours de question
      const currentIdx = sessionRef.current?.question_index ?? 0;
      const myAns = freshAnswers.find(
        (a) => a.player_id === myPlayerRef.current?.id && a.question_index === currentIdx
      );
      if (myAns && myAns.answer_index !== null) {
        setAnswered(true);
        setSelected(myAns.answer_index);
      }
    });
    return () => {
      unsubSession();
      unsubPlayers();
      unsubAnswers();
    };
  }, [sessionId]);

  // Synchronise la vue avec la phase serveur
  useEffect(() => {
    if (!sessionPhase) return;
    const phase = sessionPhase;
    const id = setTimeout(() => {
      if (phase === "playing") {
        setView((v) => (v === "lobby" || v === "create" ? "playing" : v));
      } else if (phase === "finished") {
        setView("results");
      } else if (phase === "lobby") {
        setView("lobby");
      }
    }, 0);
    return () => clearTimeout(id);
  }, [sessionPhase]);

  // Timer du joueur quand la question est poussée (suspendu si pause)
  useEffect(() => {
    if (view !== "playing" || revealed || !hasCurrentQuestion || isPaused) return;
    const id = setTimeout(() => {
      setAnswered(false);
      setSelected(null);
      setTimeLeft(timePerQuestion);
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft((tl) => {
          if (tl <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setAnswered(true);
            return 0;
          }
          return tl - 1;
        });
      }, 1000);
    }, 0);
    return () => {
      clearTimeout(id);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.state_version, view, revealed, hasCurrentQuestion, timePerQuestion, isPaused]);

  // Sons et micro-vibrations haptiques 3-2-1
  useEffect(() => {
    if (view === "playing" && !revealed && !isPaused) {
      if (timeLeft === 3) sound.playCountdown(3);
      else if (timeLeft === 2) sound.playCountdown(2);
      else if (timeLeft === 1) sound.playCountdown(1);
    }
  }, [timeLeft, view, revealed, isPaused]);

  // Son et vibration "GO" à l'arrivée d'une nouvelle question
  useEffect(() => {
    if (view === "playing" && hasCurrentQuestion && !revealed && !isPaused) {
      sound.playGo();
    }
  }, [view, session?.question_index, hasCurrentQuestion, revealed, isPaused]);

  const answeredCountForCurrent = answers.filter((answer) => answer.question_index === index()).length;
  const allAnsweredRef = useRef(false);
  useEffect(() => {
    const allAnswered = !isBuzzerMode && players.length > 0 && answeredCountForCurrent >= players.length;
    if (isHost && allAnswered && !allAnsweredRef.current && !revealed) sound.playAllAnswered();
    allAnsweredRef.current = allAnswered;
  }, [answeredCountForCurrent, isBuzzerMode, isHost, players.length, revealed]);

  async function create() {
    if (joiningRef.current) return;
    joiningRef.current = true;
    setBusy(true);
    setError(null);
    try {
      if (pseudo.trim()) localStorage.setItem("Agorax-saved-nickname", pseudo.trim());
      const res = await createRoom(pseudo, {
        mode: currentMode,
        category: createCategory,
        questionCount: createCount,
        maxPlayers: createMaxPlayers,
      });
      sessionRef.current = res.session;
      setSession(res.session);
      myPlayerRef.current = res.player;
      setMyPlayer(res.player);
      setPlayers([res.player]);
      setReady(true);
      localStorage.setItem("Agorax-last-room", JSON.stringify({ sessionId: res.session.id, playerId: res.player.id }));
      setView("lobby");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      joiningRef.current = false;
      setBusy(false);
    }
  }

  async function join(code?: string) {
    if (joiningRef.current) return;
    joiningRef.current = true;
    setBusy(true);
    setError(null);
    try {
      if (pseudo.trim()) localStorage.setItem("Agorax-saved-nickname", pseudo.trim());
      const res = await joinRoom((code ?? joinCode).trim().toUpperCase(), pseudo);
      if (res.session.mode === "discovery") {
        router.push(`/play/discovery?device=online&room=${encodeURIComponent(res.session.room_code)}`);
        return;
      }
      sessionRef.current = res.session;
      setSession(res.session);
      myPlayerRef.current = res.player;
      setMyPlayer(res.player);
      setReady(res.player.ready === true);
      localStorage.setItem("Agorax-last-room", JSON.stringify({ sessionId: res.session.id, playerId: res.player.id }));
      if (res.session.phase === "playing") {
        setJoinedMidGameIndex(res.session.question_index);
        setView("playing");
      } else {
        setView("lobby");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      joiningRef.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    if (view !== "entry" || !roomFromUrl || autoJoinedRef.current) return;
    autoJoinedRef.current = true;
    setJoinCode(roomFromUrl.toUpperCase());
  }, [view, roomFromUrl]);

  function clearRoundClientState() {
    questionsRef.current = [];
    setQuestions([]);
    setAnswers([]);
    setAnswered(false);
    setSelected(null);
    if (session) localStorage.removeItem(`Agorax-questions-${session.id}`);
  }

  async function startGame(nextMode: GameMode = currentMode) {
    if (!session || !isHost || players.length < 1) return;
    setError(null);
    setBusy(true);
    try {
      clearRoundClientState();
      let resetSession = session;
      try {
        resetSession = await resetOnlineRound(session.id, nextMode);
      } catch (roundErr) {
        console.warn("resetOnlineRound fallback direct update:", roundErr);
        const sb = getSupabaseBrowser();
        if (sb) {
          const { data: updated } = await sb
            .from("game_sessions")
            .update({
              phase: "lobby",
              mode: nextMode,
              question_index: -1,
              current_question: null,
              answers_revealed: false,
              buzzer_player_id: null,
              state_version: (session.state_version ?? 0) + 1,
            })
            .eq("id", session.id)
            .select("*")
            .single();
          if (updated) resetSession = updated as OnlineSession;
        }
      }

      sessionRef.current = resetSession;
      setSession(resetSession);
      setCurrentMode(nextMode);
      const requestedCount = nextMode === "rapidfire" ? 20 : resetSession.question_count ?? 10;
      const gameLanguage = useLanguageStore.getState().language === "en" ? "en" : "fr";
      const effectivePlayers = savedPlayers.length > 0
        ? savedPlayers.slice(0, 1)
        : [makePlayer(0, myPlayer?.name ?? pseudo)];

      const data = await loadGameQuestions({
        count: requestedCount,
        category: resetSession.category ?? undefined,
        players: effectivePlayers,
        history: entries,
        sessionId: resetSession.id,
        onlineSessionId: resetSession.id,
        ai: false,
        gameLanguage,
        languageMode: "shared",
        language: gameLanguage,
      });
      const qs = data.questions ?? [];
      questionsRef.current = qs;
      setQuestions(qs);
      try {
        localStorage.setItem(`Agorax-questions-${resetSession.id}`, JSON.stringify(qs));
      } catch {
        // localStorage non bloquant
      }

      if (qs.length === 0) throw new Error(en ? "No questions available" : "Aucune question disponible");
      await hostPushQuestion(resetSession.id, qs[0], 0, false, resetSession.state_version ?? 0);
      setView("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function buzz() {
    if (!session || !myPlayer || !isBuzzerMode || session.buzzer_player_id) return;
    try {
      const won = await claimRoomBuzzer(session.id, myPlayer.id);
      if (won) sound.playBuzzerPress();
      else sound.playWrong();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Buzzer indisponible");
    }
  }

  async function sendAnswer(i: number) {
    if (answered || revealed || !session || !myPlayer) return;
    if (isBuzzerMode && !iOwnBuzzer) return;
    setSelected(i);
    setAnswered(true);
    const elapsed = elapsedSince(startRef.current);
    try {
      const accepted = isBuzzerMode
        ? await submitRoomBuzzerAnswer(session.id, myPlayer.id, index(), i, elapsed)
        : (await submitAnswer(session.id, myPlayer.id, index(), i, elapsed), true);
      if (!accepted) throw new Error("Un autre joueur a pris le buzzer avant toi");
      sound.playAnswerLocked();
    } catch (cause) {
      setAnswered(false);
      setSelected(null);
      setError(cause instanceof Error ? cause.message : "La réponse n'a pas pu être enregistrée");
    }
      }

  useEffect(() => {
    const displayed = session?.current_question;
    if (view !== "playing" || !displayed?.id || !displayed.familyId || savedPlayers.length === 0 || !session) return;
    void markQuestionDisplayed({
      question: { id: displayed.id, familyId: displayed.familyId },
      players: savedPlayers.slice(0, 1),
      sessionId: session.id,
      onlineSessionId: session.id,
    });
  }, [view, session?.id, session?.state_version, session?.current_question, savedPlayers, session]);

  async function reveal() {
    if (!session || !isHost || !currentQuestion) return;
    const fresh = await refreshAnswers(session.id, index());
    if (answered && selected !== null && myPlayer) {
      const already = fresh.some((a) => a.player_id === myPlayer.id);
      if (!already) {
        fresh.push({
          id: `local-${myPlayer.id}-${index()}`,
          session_id: session.id,
          player_id: myPlayer.id,
          question_index: index(),
          answer_index: selected,
          correct: null,
          response_time_ms: null,
        } as RoomAnswer);
      }
    }
    await hostMarkAnswers(session.id, currentQuestion, fresh);
    await hostPushQuestion(session.id, currentQuestion, index(), true, session.state_version ?? 0);
    const mine = fresh.find((a) => a.player_id === myPlayer?.id);
    if (savedPlayers[0] && mine) {
      void markQuestionAnswered({
        question: currentQuestion,
        player: savedPlayers[0],
        sessionId: session.id,
        correct: mine.answer_index === currentQuestion.correctAnswer,
      });
    }
  }

  async function nextQuestion() {
    if (!session || !isHost) return;
    const qs = questionsRef.current;
    const nextIdx = index() + 1;
    if (nextIdx >= qs.length) {
      await finishRoom(session.id);
      setView("results");
      return;
    }
    await hostPushQuestion(session.id, qs[nextIdx], nextIdx, false, session.state_version ?? 0);
  }

  async function copyCode() {
    if (!session) return;
    try { await navigator.clipboard.writeText(session.room_code); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { setError(en ? "Select and copy the code above." : "Sélectionne et copie le code ci-dessus."); }
  }

  // Retour au salon persistant après match (sans recréer de salon !)
  async function handleReturnToLobby(nextMode: GameMode = currentMode) {
    clearRoundClientState();
    if (session && isHost) {
      const resetSession = await resetOnlineRound(session.id, nextMode);
      sessionRef.current = resetSession;
      setSession(resetSession);
      setCurrentMode(nextMode);
    }
    sound.playModeChanged();
    setView("lobby");
  }

  // Changement de mode par l'hôte dans le salon persistant
  async function handleChangeMode(newMode: GameMode) {
    if (!session || !isHost) return;
    setError(null);
    try {
      const sb = getSupabaseBrowser();
      if (!sb) throw new Error("Connexion indisponible");
      const { error } = await sb.from("game_sessions").update({ mode: newMode }).eq("id", session.id).select("id").single();
      if (error) throw error;
      setCurrentMode(newMode); setShowModeModal(false); sound.playModeChanged();
    } catch { setError(en ? "The mode could not be changed." : "Le mode n’a pas pu être modifié."); }
  }

  async function shareRoom() {
    if (!session) return;
    const url = `${window.location.origin}/play/online?room=${encodeURIComponent(session.room_code)}`;
    try {
      if (navigator.share) await navigator.share({ title: "AGORAX", text: en ? "Join my game!" : "Rejoins ma partie !", url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch (e) { if (!(e instanceof Error && e.name === "AbortError")) setError(en ? "Copy the room code to invite your friends." : "Copie le code du salon pour inviter tes amis."); }
  }

  async function leave() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (session && myPlayer && !isHost) {
      try {
        await leaveRoom(session.id, myPlayer.id);
      } catch {
        // best effort
      }
    }
    localStorage.removeItem("Agorax-last-room");
    localStorage.removeItem(`Agorax-questions-${session?.id ?? ""}`);
    router.push("/");
  }

  const q = session?.current_question;
  const effectiveSessionLang = session?.language_mode === "per-player" ? lang : ((q?.language as "fr" | "en") ?? "fr");
  const qLocal = q ? localizeQuestion(q, effectiveSessionLang) : null;
  const en = lang === "en";
  const correctAnswer = revealed ? q?.correctAnswer : undefined;
  const answeredCount = answeredCountForCurrent;
  const pseudoValid = pseudo.trim().length >= 2;

  const presenceChannel = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabaseBrowser>>["channel"]> | null>(null);
  const myId = myPlayer?.id;
  const presencePayload = useRef({ready, language:lang, avatarUrl:user?.avatarUrl ?? undefined});
  useEffect(() => { presencePayload.current = {ready, language:lang, avatarUrl:user?.avatarUrl ?? undefined}; }, [ready, lang, user?.avatarUrl]);
  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb || !sessionId || !myId) return;
    const channel = sb.channel(`jouxta-ready:${sessionId}`, { config: { presence: { key: myId } } });
    presenceChannel.current = channel;
    channel.on("presence", { event: "sync" }, () => {
      const next: Record<string, {ready:boolean;language:string;avatarUrl?:string}> = {};
      for (const [id, records] of Object.entries(channel.presenceState<{ready:boolean;language:string;avatarUrl?:string}>())) {
        const last = records[records.length - 1];
        if (last) next[id] = { ready: last.ready === true, language: last.language === "en" ? "EN" : "FR", avatarUrl: last.avatarUrl };
      }
      setPresence(next);
    }).subscribe(status => { if (status === "SUBSCRIBED") void channel.track(presencePayload.current); });
    return () => { presenceChannel.current = null; void sb.removeChannel(channel); };
  }, [sessionId, myId, user?.avatarUrl]);
  useEffect(() => { if (presenceChannel.current) void presenceChannel.current.track({ ready, language: lang, avatarUrl: user?.avatarUrl ?? undefined }); }, [ready, lang, user?.avatarUrl]);

  // Restauration de session active au chargement
  useEffect(() => {
    if (session || searchParams.get("create") === "1") return;
    try {
      const saved = localStorage.getItem("Agorax-last-room");
      if (!saved) return;
      const { sessionId: savedId, playerId: savedPid } = JSON.parse(saved);
      if (!savedId || !savedPid) return;
      const sb = getSupabaseBrowser();
      if (!sb) return;
      void Promise.all([
        sb.from("game_sessions").select("*").eq("id", savedId).maybeSingle(),
        sb.from("game_players").select("*").eq("id", savedPid).maybeSingle(),
      ]).then(([{ data: s }, { data: p }]) => {
        if (s && p && s.phase !== "finished") {
          sessionRef.current = s as OnlineSession;
          setSession(s as OnlineSession);
          myPlayerRef.current = p as OnlinePlayer;
          setMyPlayer(p as OnlinePlayer);
          setReady(p.ready === true);
          if (s.mode) setCurrentMode(s.mode as GameMode);
          if (p.is_host) {
            try {
              const cachedQs = localStorage.getItem(`Agorax-questions-${s.id}`);
              if (cachedQs) {
                const parsedQs = JSON.parse(cachedQs) as Question[];
                if (Array.isArray(parsedQs) && parsedQs.length > 0) {
                  questionsRef.current = parsedQs;
                  setQuestions(parsedQs);
                }
              }
            } catch {
              // non bloquant
            }
          }
          if (s.phase === "playing") setView("playing");
          else setView("lobby");
        }
      });
    } catch {
      // non bloquant
    }
  }, [session, searchParams]);

  async function toggleReady() {
    const nextReady = !ready;
    setReady(nextReady);
    if (myPlayer && sessionId) {
      setPresence((prev) => ({
        ...prev,
        [myPlayer.id]: {
          ...(prev[myPlayer.id] ?? {}),
          ready: nextReady,
          language: lang === "en" ? "EN" : "FR",
          avatarUrl: user?.avatarUrl ?? undefined,
        },
      }));
      void setPlayerReady(sessionId, myPlayer.id, nextReady);
    }
    if (presenceChannel.current) {
      void presenceChannel.current.track({
        ready: nextReady,
        language: lang,
        avatarUrl: user?.avatarUrl ?? undefined,
      });
    }
  }

  const isPlayerReady = (p: OnlinePlayer) => {
    if (p.id === myPlayer?.id) return ready;
    return p.ready === true || presence[p.id]?.ready === true;
  };

  const otherPlayers = players.filter((p) => p.id !== myPlayer?.id);
  const allOthersReady = otherPlayers.length === 0 || otherPlayers.every((p) => isPlayerReady(p));
  const canStart = isHost && players.length >= 1;

  // ---------- Vue 1 : Entrée ----------
  if (view === "entry") {
    return (
      <>
        <AppNavigation />
        <main className="fp-narrow-page animate-rise">
        <header className="pb-7">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-bold text-emerald-700">
            <Globe className="h-3.5 w-3.5" />
            {en ? "Online multiplayer" : "Multijoueur en ligne"}
          </div>
          <h1 className="mt-2 text-[30px] sm:text-[36px] font-bold leading-tight tracking-tight text-fp-text">
            {en ? "Online rooms" : "Salons en ligne"}
          </h1>
          <p className="mt-1 text-[15px] text-fp-text-dim">
            {en ? "Create a private room or join your friends with their code." : "Créez un salon privé ou rejoignez vos amis avec leur code."}
          </p>
        </header>

        {/* Bannière Compte / Connexion */}
        <div className="mb-4 fp-card p-3.5 flex items-center justify-between gap-3 border border-black/[0.04] bg-black/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isLoggedIn ? "bg-fp-success/15 text-fp-success" : "bg-fp-primary/10 text-fp-primary"}`}>
              {isLoggedIn ? <ShieldCheck className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
            </div>
            <div>
              <p className="text-[13px] font-bold text-fp-text">
                {isLoggedIn && user ? (en ? `Signed in: ${user.name}` : `Connecté : ${user.name}`) : (en ? "Guest player (no account)" : "Joueur invité (sans compte)")}
              </p>
              <p className="text-[11px] text-fp-text-dim">
                {isLoggedIn ? (en ? "History and stats saved to your profile" : "Historique et stats sauvegardés sur votre profil") : (en ? "Create an account to sync your history" : "Créez un compte pour synchroniser votre historique")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="fp-btn-secondary px-3 py-1.5 text-[12px] font-semibold shrink-0"
          >
            {isLoggedIn ? (en ? "My account" : "Mon compte") : (en ? "Create account" : "Créer un compte")}
          </button>
        </div>

        <SectionTitle>{en ? "Your nickname" : "Votre pseudo"}</SectionTitle>
        <div className="fp-card p-4 flex flex-col gap-3">
          {pseudo && !user?.name && (
            <div className="flex items-center justify-between rounded-xl bg-fp-primary/10 px-3.5 py-2 text-[12px] font-bold text-fp-primary border border-fp-primary/20">
              <span>{en ? `Playing as ${pseudo}` : `Continuer en tant que ${pseudo}`}</span>
              <button
                type="button"
                onClick={() => handlePseudoChange("")}
                className="text-[11px] font-semibold text-fp-text-dim hover:text-fp-text underline ml-2"
              >
                {en ? "Change" : "Modifier"}
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <PlayerDot name={pseudo || "?"} avatarUrl={user?.avatarUrl} colorIndex={0} size={38} />
            <input
              value={pseudo}
              onChange={(e) => handlePseudoChange(e.target.value)}
              maxLength={20}
              placeholder={en ? "E.g. Alex" : "Ex : Alex"}
              aria-label={en ? "Your nickname" : "Votre pseudo"}
              className="fp-input flex-1 px-4 py-3 text-[16px] font-medium"
            />
          </div>
        </div>

        <SectionTitle>{en ? "Question language" : "Langue des questions"}</SectionTitle>
        <div className="fp-card flex gap-2 p-2.5">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`flex-1 rounded-xl py-3 text-[14px] font-semibold transition-all active:scale-[0.98] ${
                lang === l
                  ? "bg-fp-primary text-white shadow-xs"
                  : "bg-black/[0.04] text-fp-text-dim hover:bg-black/[0.07]"
              }`}
            >
              {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
            </button>
          ))}
        </div>

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={() => setView("create")}
            disabled={!pseudoValid}
            className="fp-btn-primary flex w-full items-center justify-center gap-2 py-4 text-[16px]"
          >
            <Plus className="h-5 w-5" />
            <span>{en ? "Create a room" : "Créer un salon"}</span>
          </button>

          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/[0.06]" />
            </div>
            <span className="relative bg-white px-3 text-[12px] font-semibold uppercase tracking-wider text-fp-text-dim">
              {en ? "or join with a code" : "ou rejoindre avec un code"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="join-code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder={en ? "ROOM CODE" : "CODE PIN"}
              maxLength={6}
              className="fp-input flex-1 px-4 py-3.5 text-center font-mono text-[17px] font-bold uppercase tracking-widest"
              aria-label={en ? "Room code" : "Code du salon"}
            />
            <button
              type="button"
              onClick={() => join()}
              disabled={joinCode.trim().length < 4 || !pseudoValid || busy}
              className="fp-btn-secondary flex items-center justify-center py-3.5 px-6 text-[15px] shrink-0"
            >
              {en ? "Join" : "Rejoindre"}
            </button>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-fp-danger/10 px-4 py-3 text-[13px] text-fp-danger">{error}</p>}
        </main>
      </>
    );
  }

  // ---------- Vue 2 : Options de création de salon ----------
  if (view === "create") {
    return <main className="jx-page jx-setup-page"><button onClick={() => setView("entry")} className="fp-btn-ghost"><ChevronLeft size={20}/>{en?"Back":"Retour"}</button><header className="jx-page-title"><span className="jx-eyebrow">{en?"PRIVATE ROOM · INVITATION ONLY":"SALON PRIVÉ · SUR INVITATION"}</span><h1>{en?"Create a room":"Créer un salon"}</h1><p>{en?"Everyone plays on their own device.":"Chacun joue sur son appareil."}</p></header><div className="jx-setup-grid"><div><section className="jx-form-card"><div className="jx-section-heading"><h2>{en?"Number of players":"Nombre de joueurs"}</h2><div className="jx-stepper"><button aria-label={en?"Fewer players":"Moins de joueurs"} disabled={createMaxPlayers<=2} onClick={()=>setCreateMaxPlayers(n=>n-1)}><Minus size={18}/></button><strong>{createMaxPlayers}</strong><button aria-label={en?"More players":"Plus de joueurs"} disabled={createMaxPlayers>=MAX_PLAYERS} onClick={()=>setCreateMaxPlayers(n=>n+1)}><Plus size={18}/></button></div></div><h3>{en?"Game mode":"Mode de jeu"}</h3><div className="jx-topics">{AVAILABLE_ONLINE_MODES.map(m=><button key={m} aria-pressed={currentMode===m} onClick={()=>setCurrentMode(m)}>{m==='agorax'?'Buzzer':modeLabel(m,lang)}</button>)}</div><h3>{en?"Number of questions":"Nombre de questions"}</h3><SegmentControl value={String(createCount)} options={QUESTION_COUNT_OPTIONS.map(n=>({value:String(n),label:String(n)}))} onChange={v=>setCreateCount(Number(v))}/></section><section className="jx-form-card"><h2>{en?"Topics":"Thèmes"}</h2><div className="jx-topics">{(['mixed',...CATEGORIES] as const).map(c=><button key={c} aria-pressed={createCategory===c} onClick={()=>setCreateCategory(c)}>{categoryLabel(lang,c)}</button>)}</div></section></div><aside className="jx-form-card jx-summary"><KawaiiMascot theme="poppy" size={150}/><h2>{en?`${pseudo}’s room`:`Le salon de ${pseudo}`}</h2><p>{createMaxPlayers} {en?"players":"joueurs"} · {currentMode==='rapidfire'?20:createCount} questions</p><p>{en?"You’ll receive a code to invite your friends.":"Tu recevras un code pour inviter tes amis."}</p><button className="fp-btn-primary" onClick={()=>void create()} disabled={busy||!pseudoValid}>{busy?(en?"Creating…":"Création…"):(en?"Create room":"Créer le salon")}<ArrowRight size={18}/></button>{error&&<p role="alert" className="jx-error">{error}</p>}</aside></div></main>;
  }

  // ---------- Vue 3 : Lobby Persistant ----------
  if (view === "lobby" && session) {
    const host = players.find((p) => p.is_host);
    return (
      <main className="jx-page" style={{ maxWidth: 700 }}>
        <button className="fp-btn-ghost" onClick={() => void leave()}>
          <ChevronLeft size={20} />
          {en ? "Leave room" : "Quitter le salon"}
        </button>

        <header className="jx-page-title">
          <h1>{en ? `${host?.name ?? pseudo}’s room` : `Le salon de ${host?.name ?? pseudo}`}</h1>
        </header>

        <section className="jx-form-card jx-aqua text-center flex flex-col items-center">
          <span className="text-[11px] uppercase font-bold tracking-wider text-black/50">{en ? "Room code" : "Code du salon"}</span>
          <div className="my-1 font-mono text-4xl sm:text-5xl font-black tracking-widest text-fp-primary uppercase select-all">
            {session.room_code}
          </div>

          <div className="my-2.5">
            <RoomQRCode
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/play/online?room=${encodeURIComponent(session.room_code)}`}
              roomCode={session.room_code}
              size={140}
            />
          </div>

          <div className="jx-room-actions w-full flex gap-2 justify-center mt-1">
            <button className="fp-btn-secondary flex items-center justify-center gap-1.5 py-2.5 px-4" onClick={() => void copyCode()}>
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              {copied ? (en ? "Code copied!" : "Code copié !") : (en ? "Copy code" : "Copier le code")}
            </button>
            <button className="fp-btn-secondary flex items-center justify-center gap-1.5 py-2.5 px-4" onClick={() => void shareRoom()}>
              <Share2 size={18} />
              {en ? "Share link" : "Inviter (lien)"}
            </button>
          </div>
        </section>

        <div className="jx-section-heading">
          <h2>{en ? "Your team" : "Ton équipe"}</h2>
          <strong>{players.length} / {session.max_players}</strong>
        </div>

        <div className="space-y-3">
          {players.map((p, i) => {
            const readyStatus = isPlayerReady(p);
            return (
              <div className="jx-ready-row" key={p.id}>
                <PlayerDot
                  name={p.name}
                  avatarUrl={presence[p.id]?.avatarUrl ?? characterImage(CHARACTERS[i % 5].id)}
                  size={46}
                />
                <div>
                  <strong>{p.name}</strong> {p.is_host && <small>· {en ? "Host" : "Hôte"}</small>}
                  <br />
                  <small>
                    {presence[p.id]?.language ?? "—"} {p.id === myPlayer?.id ? (en ? "· You" : "· Toi") : ""}
                  </small>
                </div>
                <span className={`jx-ready-status ${readyStatus ? "" : "waiting"}`}>
                  {readyStatus ? (en ? "Ready ✓" : "Prêt ✓") : (en ? "Not ready" : "Pas encore prêt")}
                </span>
              </div>
            );
          })}
        </div>

        <p className="my-5 text-sm text-fp-text-dim">
          {en ? "Everyone receives the same question in their own language." : "Chacun reçoit la même question dans sa langue."}
        </p>

        <section className="jx-form-card">
          <div className="flex items-center justify-between gap-3">
            <strong>{currentMode === "agorax" ? "Quiz Party · Buzzer" : modeLabel(currentMode, lang)}</strong>
            <span>{session.question_count} questions</span>
          </div>
          {isHost && (
            <>
              <button className="fp-btn-ghost mt-2" onClick={() => setShowModeModal(!showModeModal)}>
                {en ? "Change mode" : "Modifier le mode"}
              </button>
              {showModeModal && (
                <div className="jx-topics">
                  {AVAILABLE_ONLINE_MODES.map((m) => (
                    <button key={m} aria-pressed={currentMode === m} onClick={() => void handleChangeMode(m)}>
                      {m === "agorax" ? "Buzzer" : modeLabel(m, lang)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <button
          className="fp-btn-secondary w-full"
          aria-pressed={ready}
          onClick={() => void toggleReady()}
        >
          {ready ? <Check size={18} /> : null}
          {ready ? (en ? "Ready! Tap to cancel" : "Je suis prêt ! Annuler") : (en ? "I’m ready" : "Je suis prêt")}
        </button>

        {isHost ? (
          <div className="mt-3 space-y-2">
            <button
              className="fp-btn-primary w-full py-4 text-[16px] font-bold flex items-center justify-center gap-2"
              disabled={!canStart || busy}
              onClick={() => void startGame()}
            >
              {busy
                ? (en ? "Preparing…" : "Préparation…")
                : players.length === 1
                  ? (en ? "Start game (solo / test)" : "Lancer la partie (solo / test)")
                  : allOthersReady
                    ? (en ? "Start game" : "Lancer la partie")
                    : (en ? "Start game" : "Lancer la partie")}
              <ArrowRight size={18} />
            </button>
            {players.length === 1 && (
              <p className="text-center text-xs text-fp-text-dim">
                {en
                  ? "💡 You can invite friends with the code above or play right away."
                  : "💡 Tu peux inviter tes amis avec le code ci-dessus ou lancer directement."}
              </p>
            )}
            {players.length > 1 && !allOthersReady && (
              <p className="text-center text-xs text-fp-text-dim">
                {en
                  ? `Waiting for ${otherPlayers.filter((p) => !isPlayerReady(p)).length} player(s) to be ready, but you can start anytime.`
                  : `En attente de ${otherPlayers.filter((p) => !isPlayerReady(p)).length} joueur(s), mais tu peux lancer à tout moment.`}
              </p>
            )}
          </div>
        ) : (
          <p role="status" className="text-center mt-5 text-sm text-fp-text-dim">
            {isPlayerReady(myPlayer ?? ({} as OnlinePlayer))
              ? (en ? "You’re ready! The host will start when everyone is set." : "Tu es prêt ! L’hôte va lancer la partie.")
              : (en ? "The host will start when everyone is ready." : "L’hôte lancera la partie quand tout le monde sera prêt.")}
          </p>
        )}

        {error && <p role="alert" className="jx-error mt-4">{error}</p>}
      </main>
    );
  }

  // ---------- Vue 4 : En Jeu ----------
  if (view === "playing" && session) {
    const qIndex = index();
    const myAnswer = selected;
    const isOnlineCorrect = revealed && myAnswer === correctAnswer;
    const isOnlineWrong = revealed && myAnswer !== null && myAnswer !== correctAnswer;

    return (
      <main className="jx-game mx-auto flex min-h-dvh w-full flex-col px-4 sm:px-6 pb-12 pt-3 animate-rise">
        {/* Navigation & Question Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={leave}
              className="fp-btn-ghost inline-flex items-center gap-1 px-2 py-1 text-[15px]"
              aria-label={en ? "Leave" : "Quitter"}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>{en ? "Leave" : "Quitter"}</span>
            </button>
            {isHost && (
              <button
                type="button"
                onClick={() => void togglePause()}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[13px] font-bold transition active:scale-95 ${
                  isPaused
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-black/[0.05] text-fp-text-dim hover:bg-black/[0.1] hover:text-fp-text"
                }`}
                title={isPaused ? (en ? "Resume" : "Reprendre") : (en ? "Pause" : "Mettre en pause")}
              >
                {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
                <span>{isPaused ? (en ? "Resume" : "Reprendre") : "Pause"}</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1.5" aria-label={`Question ${qIndex + 1}`}>
            {Array.from({ length: Math.min(questionCount, 20) }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < qIndex ? "w-3 bg-fp-success" : i === qIndex ? "w-6 bg-fp-primary" : "w-1.5 bg-black/[0.1]"
                }`}
              />
            ))}
          </div>

          <span className="text-[14px] font-semibold text-fp-text-dim tabular-nums">
            {qIndex + 1}/{questionCount}
          </span>
        </div>

        <div className="jx-online-score">{players.map((p,i)=><div key={p.id}><PlayerDot name={p.name} avatarUrl={presence[p.id]?.avatarUrl??characterImage(CHARACTERS[i%5].id)} size={34}/><span>{p.name}</span><strong>{p.score}</strong></div>)}</div>
        {/* Timer Bar */}
        {!revealed && (
          <div className="mt-4">
            <TimerBar seconds={timeLeft} total={timePerQuestion} />
          </div>
        )}

        {q ? (
          <section className="mt-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <PillBadge colorClass="bg-fp-primary/10 text-fp-primary">
                  {isHost ? (en ? "Host · Answer!" : "Hôte · Répondez !") : (en ? "Your turn!" : "À vous de jouer !")}
                </PillBadge>
                <span className="text-[13px] font-medium text-fp-text-dim tabular-nums">
                  {answeredCount}/{players.length} ont répondu
                </span>
              </div>

              {/* Bandeau Spectateur Actif si arrivée en cours de partie */}
              {isSpectatingCurrent && (
                <div className="mb-4 mt-4 flex items-center gap-2.5 rounded-2xl bg-amber-500/10 px-4 py-3 text-xs sm:text-sm font-bold text-amber-800 border border-amber-500/20 animate-in fade-in">
                  <span className="text-xl">🍿</span>
                  <span>
                    {en
                      ? "You joined mid-game! You're observing this round and will play on the next question."
                      : "Tu as rejoint en cours de manche ! Tu observes ce tour et tu joueras dès la question suivante."}
                  </span>
                </div>
              )}

              {/* Mascotte interactive temps réel */}
              <div className="jx-feedback mt-4 flex items-center gap-3.5 rounded-2xl bg-white p-3.5 border border-black/[0.04] shadow-xs">
                {!answered && !revealed && (
                  <>
                    <KawaiiMascot theme="thinking" size={62} animation="float" />
                    <div>
                      <p className="text-[14px] font-bold text-fp-text">À toi de réfléchir 🤔</p>
                      <p className="text-[12px] text-fp-text-dim">Sélectionne vite ta réponse avant la fin du chrono !</p>
                    </div>
                  </>
                )}
                {answered && !revealed && (
                  <>
                    <KawaiiMascot theme="waiting" size={62} animation="wobble" />
                    <div>
                      <p className="text-[14px] font-bold text-fp-primary">Réponse validée ! 📱</p>
                      <p className="text-[12px] text-fp-text-dim">Patiente pendant que les autres joueurs répondent.</p>
                    </div>
                  </>
                )}
                {isOnlineCorrect && (
                  <>
                    <KawaiiMascot theme="happy" size={62} animation="celebrate" />
                    <div>
                      <p className="text-[14px] font-bold text-fp-success">Bravo ! Bonne réponse 🎉</p>
                      <p className="text-[12px] text-fp-text-dim">Tu marques des points pour le classement !</p>
                    </div>
                  </>
                )}
                {isOnlineWrong && (
                  <>
                    <KawaiiMascot theme="sad" size={62} animation="shake" />
                    <div>
                      <p className="text-[14px] font-bold text-fp-danger">{en?"Not quite…":"Aïe… Mauvaise réponse 😢"}</p>
                      <p className="text-[12px] text-fp-text-dim">{en?"The correct answer is marked in green.":"La bonne réponse est indiquée en vert."}</p>
                    </div>
                  </>
                )}
              </div>

              <h1
                key={qLocal!.question}
                className="animate-rise mt-4 text-[22px] sm:text-[28px] font-bold leading-snug text-fp-text"
              >
                {qLocal!.question}
              </h1>
              {q?.media && <QuestionMedia media={q.media} />}

              {isBuzzerMode && !session.buzzer_player_id && !revealed && (
                <div className="mt-7 rounded-3xl border border-fp-primary/20 bg-fp-primary/5 p-5 text-center">
                  <KawaiiMascot theme="buzzer-energy" size={112} animation="bounce" className="mx-auto mb-2" />
                  <p className="text-sm font-bold text-fp-text">{en?"Know the answer?":"Tu connais la réponse ?"}</p>
                  <p className="mt-1 text-xs text-fp-text-dim">{en?"The first player to buzz gets to answer.":"Le premier appui est verrouillé pour tout le salon."}</p>
                  <button
                    type="button"
                    onClick={() => void buzz()}
                    className="jx-buzzer mx-auto mt-4 flex min-h-28 w-full max-w-sm items-center justify-center gap-3 rounded-[2rem] bg-fp-danger px-6 text-2xl font-black tracking-wide text-white shadow-xl shadow-fp-danger/25 transition active:scale-95"
                  >
                    <Zap className="h-8 w-8 fill-current" />
                    BUZZER
                  </button>
                </div>
              )}

              {isBuzzerMode && session.buzzer_player_id && !iOwnBuzzer && !revealed && (
                <div className="mt-7 rounded-3xl border border-fp-warning/30 bg-fp-warning/10 p-6 text-center">
                  <KawaiiMascot theme="waiting" size={70} animation="bounce" />
                  <p className="mt-3 text-base font-black text-fp-text">{buzzerPlayer?.name ?? "Un joueur"} a buzzé en premier</p>
                  <p className="mt-1 text-sm text-fp-text-dim">Sa réponse est en cours. Prépare-toi pour la prochaine question.</p>
                </div>
              )}

              {/* 4 Cartes de réponses : tout le monde, ou seulement le gagnant du buzzer */}
              {(!isBuzzerMode || iOwnBuzzer || revealed) && <div className="mt-6 grid grid-cols-1 gap-3">
                {qLocal!.answers.map((answer, i) => {
                  let cls = "text-fp-text";
                  if (revealed) {
                    if (i === correctAnswer) {
                      cls = "border-2 border-fp-success bg-fp-success/10 text-fp-text font-semibold shadow-xs";
                    } else if (i === selected && i !== correctAnswer) {
                      cls = "border-2 border-fp-danger bg-fp-danger/10 text-fp-text";
                    } else {
                      cls = "opacity-35";
                    }
                  } else if (answered || isSpectatingCurrent) {
                    if (i === selected) {
                      cls = "border-2 border-fp-primary bg-fp-primary/10 text-fp-primary font-semibold shadow-xs";
                    } else {
                      cls = "opacity-45";
                    }
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={revealed || answered || isSpectatingCurrent}
                      onClick={() => sendAnswer(i)}
                      className={`fp-answer flex min-h-[64px] items-center gap-3.5 px-5 py-4 text-left text-[16px] font-medium ${cls}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[14px] font-bold text-fp-text-dim">
                        {["A", "B", "C", "D"][i]}
                      </span>
                      <span className="flex-1 leading-snug">
                        {answer}
                        {isSpectatingCurrent && !revealed && (
                          <span className="ml-2 text-xs text-fp-text-dim font-normal">
                            ({en ? "Observing" : "En observation"})
                          </span>
                        )}
                      </span>
                      {revealed && i === correctAnswer && <Check size={18} aria-label={en ? "Correct answer" : "Bonne réponse"} />}
                    </button>
                  );
                })}
              </div>}

              {/* Explication */}
              {revealed && qLocal?.explanation && (
                <div className="animate-rise mt-5 rounded-2xl bg-black/[0.03] p-4 text-[14px] leading-relaxed text-fp-text-dim">
                  <strong className="block text-[12px] font-semibold uppercase tracking-wider text-fp-text mb-1">
                    Explication
                  </strong>
                  {qLocal.explanation}
                </div>
              )}
            </div>

            {/* Contrôles de l'hôte */}
            {isHost && (
              <div className="mt-8 flex gap-3">
                {!revealed ? (
                  <button
                    type="button"
                    onClick={reveal}
                    disabled={!q || (isBuzzerMode && answeredCount === 0 && timeLeft > 0)}
                    className="fp-btn-primary flex flex-1 items-center justify-center gap-2 py-4 text-[16px]"
                  >
                    <Eye className="h-5 w-5" />
                    <span>{en ? "Reveal answer" : "Révéler la réponse"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="fp-btn-primary flex flex-1 items-center justify-center gap-2 py-4 text-[16px]"
                  >
                    <span>{index() >= questions.length - 1 ? (en ? "See final ranking" : "Voir le classement final") : (en ? "Next question" : "Question suivante")}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {answered && !revealed && (
              <p className="mt-6 text-center text-[14px] font-medium text-fp-text-dim animate-pulse">
                {isHost ? "Votre réponse est enregistrée — révélez dès que tout le monde est prêt" : "Réponse envoyée — en attente des autres joueurs…"}
              </p>
            )}
          </section>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-black/10 border-t-fp-primary" />
            <p className="mt-4 text-[14px] text-fp-text-dim">Préparation des questions…</p>
          </div>
        )}

        {/* Overlay Pause Mode Soirée */}
        {isPaused && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="flex max-w-sm w-full flex-col items-center rounded-3xl bg-white p-6 text-center shadow-2xl">
              <KawaiiMascot theme="neo" size={120} />
              <h2 className="mt-3 text-2xl font-black text-black">
                {en ? "Game Paused" : "Partie en pause"}
              </h2>
              <p className="mt-2 text-sm text-black/65">
                {isHost
                  ? (en ? "Take a break! Click Resume when all players are ready." : "Prenez un verre ou respirez ! Clique sur Reprendre quand tout le monde est prêt.")
                  : (en ? "The host paused the game. We’ll resume shortly!" : "L'hôte a mis la partie en pause. On reprend dans un instant !")}
              </p>
              {isHost && (
                <button
                  type="button"
                  onClick={() => void togglePause()}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-[15px] font-bold text-white transition hover:bg-black/90 active:scale-95 shadow-md"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>{en ? "Resume game" : "Reprendre la partie"}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    );
  }

  // ---------- Vue 5 : Résultats / Podium Persistant ----------
  if (view === "results") {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl sm:max-w-2xl flex-col px-4 sm:px-6 pb-24 pt-10 animate-rise">
        <Confetti />
        
        <div className="text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <KawaiiMascot theme="party-dance" size={88} animation="celebrate" className="border border-black/[0.05] shadow-sm" />
          </div>
          <h1 className="mt-3 text-[28px] sm:text-[34px] font-bold text-fp-text">Partie terminée</h1>
          {winner && (
            <p className="mt-1 text-[16px] text-fp-text-dim">
              🎉 <strong>{winner.name}</strong> remporte la victoire avec {winner.score} points !
            </p>
          )}
        </div>

        {/* Classement */}
        <div className="fp-list mt-8">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3.5 px-4 py-3.5">
              <span className="w-6 text-center text-[16px] font-bold text-fp-text-dim tabular-nums">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
              </span>
              <PlayerDot name={p.name} colorIndex={players.indexOf(p)} size={36} />
              <span className="flex-1 text-[16px] font-semibold text-fp-text">
                {p.name}
                {p.user_id === myPlayer?.user_id && (
                  <span className="ml-1.5 text-[13px] font-normal text-fp-primary">(vous)</span>
                )}
              </span>
              <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[15px] font-bold text-fp-text tabular-nums">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        <RoundRoastPanel
          seed={`${session?.id ?? "online-round"}-${session?.state_version ?? 0}`}
          players={sorted.map((player) => ({
            id: player.id,
            name: player.name,
            score: player.score,
            colorIndex: players.indexOf(player),
          }))}
        />

        {/* Carte de score finale partageable en 1 tap */}
        <PostGameCard
          players={sorted.map((p) => ({
            id: p.id,
            name: p.name,
            score: p.score,
            avatarUrl: presence[p.id]?.avatarUrl,
          }))}
          winner={winner ? { id: winner.id, name: winner.name, score: winner.score, avatarUrl: presence[winner.id]?.avatarUrl } : null}
          roomCode={session?.room_code ?? ""}
          mode={currentMode}
          lang={lang}
        />

        {/* Contrôles Post-Game : Rejouer, Changer de mode, Retour au salon */}
        <div className="mt-8 space-y-3">
          {isHost ? (
            <>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void startGame(currentMode)}
                  disabled={busy}
                  className="fp-btn-primary flex-1 py-4 text-[16px] flex items-center justify-center gap-2"
                >
                  <Play className="h-5 w-5 fill-white" />
                  <span>{busy ? "Nouvelles questions…" : `Rejouer · ${MODE_META[currentMode]?.name ?? currentMode}`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModeModal(true)}
                  className="fp-btn-secondary flex-1 py-4 text-[16px] flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4.5 w-4.5" />
                  <span>Changer de mode</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {AVAILABLE_ONLINE_MODES.map((mode) => {
                  const option = MODE_META[mode];
                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={busy}
                      onClick={() => void startGame(mode)}
                      className={`rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                        mode === currentMode ? "border-fp-primary bg-fp-primary/10" : "border-fp-border bg-white"
                      }`}
                    >
                      <AppIcon name={option.icon} className="h-5 w-5 text-fp-primary" />
                      <span className="mt-2 block text-xs font-extrabold text-fp-text">Jouer à {option.name}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => void handleReturnToLobby()}
                className="fp-btn-ghost w-full py-3 text-[15px] text-fp-primary font-semibold"
              >
                Retour au salon
              </button>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="fp-card p-4">
                <p className="text-[14px] font-bold text-fp-text">Le groupe reste ensemble !</p>
                <p className="text-[12px] text-fp-text-dim">En attente du prochain choix de l&apos;hôte…</p>
              </div>
              <p className="text-[12px] text-fp-text-dim">
                Le salon se rouvrira automatiquement dès que l&apos;hôte choisira le prochain mode.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={leave}
            className="w-full text-center text-[14px] font-medium text-fp-danger pt-2"
          >
            {en ? "Leave the room permanently" : "Quitter définitivement le salon"}
          </button>
        </div>

        {/* Modal de changement de mode post-game */}
        {showModeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
            <div className="fp-card w-full max-w-md p-5 animate-rise shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <h3 className="text-[17px] font-bold text-fp-text">Choisir le nouveau mode</h3>
                <button
                  type="button"
                  onClick={() => setShowModeModal(false)}
                  className="text-fp-text-dim hover:text-fp-text text-[14px] font-medium"
                >
                  Fermer
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-[60vh] overflow-y-auto">
                {AVAILABLE_ONLINE_MODES.map((m) => {
                  const mMeta = MODE_META[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => void handleReturnToLobby(m)}
                      className={`flex w-full items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        currentMode === m ? "bg-fp-primary/10 border border-fp-primary/30" : "hover:bg-black/[0.03]"
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${mMeta.iconBg}`}>
                        <AppIcon name={mMeta.icon} className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-fp-text">{mMeta.name}</p>
                        <p className="text-[12px] text-fp-text-dim truncate">{mMeta.subtitle}</p>
                      </div>
                      {currentMode === m && <Check className="h-4.5 w-4.5 text-fp-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return null;
}
