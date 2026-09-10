from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one match in {path}, found {count}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1))


# src/lib/online/room.ts
replace_once(
    "src/lib/online/room.ts",
    '  language_mode?: "shared" | "per-player";\n}',
    '  language_mode?: "shared" | "per-player";\n  question_started_at?: string | null;\n  question_duration_seconds?: number | null;\n  paused_remaining_ms?: number | null;\n}',
)
replace_once(
    "src/lib/online/room.ts",
    '  ready?: boolean;\n}',
    '  ready?: boolean;\n  is_spectator?: boolean;\n}',
)
replace_once(
    "src/lib/online/room.ts",
    '        question_count: opts.questionCount,\n        max_players: Math.max(2, Math.min(MAX_PLAYERS, opts.maxPlayers)),',
    '        question_count: opts.mode === "rapidfire" ? 20 : opts.questionCount,\n        max_players: Math.max(2, Math.min(MAX_PLAYERS, opts.maxPlayers)),\n        game_language: opts.gameLanguage ?? "fr",\n        language_mode: opts.languageMode ?? "per-player",',
)
replace_once(
    "src/lib/online/room.ts",
    '  currentStateVersion: number = 0,\n): Promise<void> {',
    '  currentStateVersion: number = 0,\n  durationSeconds: number = 15,\n): Promise<void> {',
)
replace_once(
    "src/lib/online/room.ts",
    '      state_version: currentStateVersion + 1,\n      ...(!revealed ? { buzzer_player_id: null } : {}),',
    '      state_version: currentStateVersion + 1,\n      ...(!revealed\n        ? {\n            buzzer_player_id: null,\n            question_started_at: new Date().toISOString(),\n            question_duration_seconds: durationSeconds,\n            paused_remaining_ms: null,\n          }\n        : {}),',
)

old_pause = '''export async function hostSetPause(sessionId: string, paused: boolean): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  const { data: session, error: fetchErr } = await sb
    .from("game_sessions")
    .select("current_question, state_version")
    .eq("id", sessionId)
    .single();
  if (fetchErr || !session) return;
  const current = (session.current_question ?? {}) as Record<string, unknown>;
  const { error } = await sb
    .from("game_sessions")
    .update({
      current_question: { ...current, is_paused: paused },
      state_version: (session.state_version ?? 0) + 1,
    })
    .eq("id", sessionId);
  if (error) throw new Error(`Pause salon: ${error.message}`);
}'''
new_pause = '''export async function hostSetPause(sessionId: string, paused: boolean): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  const { data: session, error: fetchErr } = await sb
    .from("game_sessions")
    .select("current_question, state_version, question_started_at, question_duration_seconds, paused_remaining_ms")
    .eq("id", sessionId)
    .single();
  if (fetchErr) throw new Error(`Pause salon: ${fetchErr.message}`);
  if (!session?.current_question) return;

  const current = session.current_question as Record<string, unknown>;
  const durationMs = Math.max(1000, Number(session.question_duration_seconds ?? 15) * 1000);
  const startedAt = session.question_started_at ? Date.parse(session.question_started_at) : Date.now();
  const remainingMs = paused
    ? Math.max(0, startedAt + durationMs - Date.now())
    : Math.max(0, Number(session.paused_remaining_ms ?? durationMs));

  const { error } = await sb
    .from("game_sessions")
    .update({
      current_question: { ...current, is_paused: paused },
      state_version: (session.state_version ?? 0) + 1,
      question_started_at: paused ? null : new Date().toISOString(),
      question_duration_seconds: paused ? session.question_duration_seconds : Math.max(1, Math.ceil(remainingMs / 1000)),
      paused_remaining_ms: paused ? remainingMs : null,
    })
    .eq("id", sessionId);
  if (error) throw new Error(`Pause salon: ${error.message}`);
}'''
replace_once("src/lib/online/room.ts", old_pause, new_pause)

old_ready = '''export async function setPlayerReady(sessionId: string, playerId: string, ready: boolean): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  try {
    await sb.from("game_players").update({ ready }).eq("id", playerId).eq("session_id", sessionId);
  } catch (error) {
    console.warn("[room] setPlayerReady non bloquant:", error);
  }
}'''
new_ready = '''export async function setPlayerReady(sessionId: string, playerId: string, ready: boolean): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  const { error } = await sb
    .from("game_players")
    .update({ ready })
    .eq("id", playerId)
    .eq("session_id", sessionId);
  if (error) throw new Error(`État prêt: ${error.message}`);
}'''
replace_once("src/lib/online/room.ts", old_ready, new_ready)

old_mark = '''  await Promise.all(
    answers.map(async (a) => {
      const correct = a.answer_index === question.correctAnswer;
      await sb.from("room_answers").update({ correct }).eq("id", a.id);
      if (correct) {
        await sb.rpc("increment_player_score", { p_player_id: a.player_id, p_points: 10 });
      }
    }),
  );'''
new_mark = '''  await Promise.all(
    answers.map(async (a) => {
      if (a.id.startsWith("local-")) return;
      const correct = a.answer_index === question.correctAnswer;
      const { error: answerError } = await sb.from("room_answers").update({ correct }).eq("id", a.id);
      if (answerError) throw new Error(`Correction réponse: ${answerError.message}`);
      if (correct) {
        const { error: scoreError } = await sb.rpc("increment_player_score", { p_player_id: a.player_id, p_points: 10 });
        if (scoreError) throw new Error(`Score: ${scoreError.message}`);
      }
    }),
  );'''
replace_once("src/lib/online/room.ts", old_mark, new_mark)

# src/components/game/online-room.tsx
replace_once(
    "src/components/game/online-room.tsx",
    '''function elapsedSince(start: number) {
  return Math.max(0, Date.now() - start);
}
''',
    '''function elapsedSince(start: number) {
  return Math.max(0, Date.now() - start);
}

function remainingSeconds(session: OnlineSession | null, fallbackSeconds: number): number {
  if (!session) return fallbackSeconds;
  if (session.paused_remaining_ms != null) {
    return Math.max(0, Math.ceil(session.paused_remaining_ms / 1000));
  }
  const started = session.question_started_at ? Date.parse(session.question_started_at) : NaN;
  if (!Number.isFinite(started)) return fallbackSeconds;
  const duration = Math.max(1, session.question_duration_seconds ?? fallbackSeconds) * 1000;
  return Math.max(0, Math.ceil((started + duration - Date.now()) / 1000));
}
''',
)
replace_once(
    "src/components/game/online-room.tsx",
    '  const isSpectatingCurrent = joinedMidGameIndex !== null && joinedMidGameIndex === index();',
    '  const isSpectatingCurrent = myPlayer?.is_spectator === true || (joinedMidGameIndex !== null && joinedMidGameIndex === index());',
)

old_timer = '''  // Timer du joueur quand la question est poussée (suspendu si pause)
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
  }, [session?.state_version, view, revealed, hasCurrentQuestion, timePerQuestion, isPaused]);'''
new_timer = '''  // Timer synchronisé sur l'horloge serveur de la question.
  useEffect(() => {
    if (view !== "playing" || revealed || !hasCurrentQuestion) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const sync = () => {
      const left = remainingSeconds(sessionRef.current, timePerQuestion);
      setTimeLeft(left);
      if (left <= 0) {
        setAnswered(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    if (isPaused) {
      setTimeLeft(remainingSeconds(session, timePerQuestion));
      return;
    }

    setAnswered(false);
    setSelected(null);
    const serverStart = session?.question_started_at ? Date.parse(session.question_started_at) : NaN;
    startRef.current = Number.isFinite(serverStart) ? serverStart : Date.now();
    sync();
    timerRef.current = setInterval(sync, 250);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    session?.question_index,
    session?.question_started_at,
    session?.question_duration_seconds,
    session?.paused_remaining_ms,
    view,
    revealed,
    hasCurrentQuestion,
    timePerQuestion,
    isPaused,
  ]);'''
replace_once("src/components/game/online-room.tsx", old_timer, new_timer)

replace_once(
    "src/components/game/online-room.tsx",
    '''        questionCount: createCount,
        maxPlayers: createMaxPlayers,
      });''',
    '''        questionCount: currentMode === "rapidfire" ? 20 : createCount,
        maxPlayers: createMaxPlayers,
        gameLanguage: lang,
        languageMode: "per-player",
      });''',
)
replace_once(
    "src/components/game/online-room.tsx",
    '      const gameLanguage = useLanguageStore.getState().language === "en" ? "en" : "fr";',
    '      const gameLanguage = resetSession.game_language ?? (useLanguageStore.getState().language === "en" ? "en" : "fr");\n      const languageMode = resetSession.language_mode ?? "per-player";',
)
replace_once(
    "src/components/game/online-room.tsx",
    '        languageMode: "per-player",\n        language: gameLanguage,',
    '        languageMode,\n        language: gameLanguage,',
)
replace_once(
    "src/components/game/online-room.tsx",
    '      await hostPushQuestion(resetSession.id, qs[0], 0, false, resetSession.state_version ?? 0);',
    '      await hostPushQuestion(resetSession.id, qs[0], 0, false, resetSession.state_version ?? 0, nextMode === "rapidfire" ? 6 : 15);',
)
replace_once(
    "src/components/game/online-room.tsx",
    '    await hostPushQuestion(session.id, qs[nextIdx], nextIdx, false, session.state_version ?? 0);',
    '    await hostPushQuestion(session.id, qs[nextIdx], nextIdx, false, session.state_version ?? 0, timePerQuestion);',
)
replace_once(
    "src/components/game/online-room.tsx",
    '''  const answeredCountForCurrent = answers.filter((answer) => answer.question_index === index()).length;
  const allAnsweredRef = useRef(false);
  useEffect(() => {
    const allAnswered = !isBuzzerMode && players.length > 0 && answeredCountForCurrent >= players.length;''',
    '''  const activePlayers = players.filter((player) => !player.is_spectator);
  const answeredCountForCurrent = answers.filter((answer) => answer.question_index === index()).length;
  const allAnsweredRef = useRef(false);
  useEffect(() => {
    const allAnswered = !isBuzzerMode && activePlayers.length > 0 && answeredCountForCurrent >= activePlayers.length;''',
)
replace_once(
    "src/components/game/online-room.tsx",
    '  }, [answeredCountForCurrent, isBuzzerMode, isHost, players.length, revealed]);',
    '  }, [answeredCountForCurrent, isBuzzerMode, isHost, activePlayers.length, revealed]);',
)
replace_once(
    "src/components/game/online-room.tsx",
    '''    if (session && myPlayer && !isHost) {
      try {
        await leaveRoom(session.id, myPlayer.id);
      } catch {
        // best effort
      }
    }''',
    '''    if (session && myPlayer) {
      try {
        await leaveRoom(session.id, myPlayer.id);
      } catch {
        // La navigation locale ne doit pas rester bloquée si le réseau tombe.
      }
    }''',
)
replace_once(
    "src/components/game/online-room.tsx",
    '  const effectiveSessionLang = lang;',
    '  const effectiveSessionLang = session?.language_mode === "shared" ? (session.game_language ?? lang) : lang;',
)
replace_once(
    "src/components/game/online-room.tsx",
    '{answeredCount}/{players.length} {en ? "answered" : "ont répondu"}',
    '{answeredCount}/{activePlayers.length} {en ? "answered" : "ont répondu"}',
)
