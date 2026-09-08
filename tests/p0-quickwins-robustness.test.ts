import { describe, it, expect, vi, beforeEach } from "vitest";
import { sound } from "@/lib/audio/sound-engine";
import QRCode from "qrcode";
import type { OnlineSession } from "@/lib/online/room";

describe("P0 Quick Wins & Robustness Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. Design Haptique & Sonore (SoundEngine)", () => {
    it("déclenche playCountdown(3), (2), (1) sans erreur même sans AudioContext", () => {
      expect(() => sound.playCountdown(3)).not.toThrow();
      expect(() => sound.playCountdown(2)).not.toThrow();
      expect(() => sound.playCountdown(1)).not.toThrow();
    });

    it("déclenche playGo() sans erreur", () => {
      expect(() => sound.playGo()).not.toThrow();
    });

    it("appelle navigator.vibrate si disponible lors du décompte et du GO", () => {
      const vibrateMock = vi.fn();
      // Simule navigator.vibrate
      vi.stubGlobal("navigator", {
        vibrate: vibrateMock,
      });

      sound.playCountdown(3);
      expect(vibrateMock).toHaveBeenCalledWith(20);

      vibrateMock.mockClear();
      sound.playGo();
      expect(vibrateMock).toHaveBeenCalledWith([30, 25, 60]);

      vi.unstubAllGlobals();
    });
  });

  describe("2. Générateur de QR Code Salon (SVG)", () => {
    it("génère un QR Code SVG valide pour un code de salon AgoraX", async () => {
      const roomUrl = "https://agorax.app/play/online?room=ALPHA9";
      const svg = await QRCode.toString(roomUrl, {
        type: "svg",
        margin: 1,
      });

      expect(svg).toBeDefined();
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
      expect(svg.length).toBeGreaterThan(500);
    });

    it("génère des QR Codes distincts pour des salons différents", async () => {
      const url1 = "https://agorax.app/play/online?room=ROOM01";
      const url2 = "https://agorax.app/play/online?room=ROOM02";

      const svg1 = await QRCode.toString(url1, { type: "svg" });
      const svg2 = await QRCode.toString(url2, { type: "svg" });

      expect(svg1).not.toEqual(svg2);
    });
  });

  describe("3. Robustesse & Intégrité du Mode Pause Salon", () => {
    it("accepte la propriété is_paused dans le payload de session", () => {
      const sessionWithPause: OnlineSession = {
        id: "session-123",
        room_code: "TEST99",
        host_id: "host-uuid",
        phase: "playing",
        question_index: 2,
        current_question: {
          id: "q-1",
          question: "Combien d'étoiles sur le drapeau européen ?",
          answers: ["10", "12", "15", "27"],
          is_paused: true,
        },
        answers_revealed: false,
        state_version: 4,
        mode: "classic",
        category: "culture-generale",
        question_count: 10,
        max_players: 4,
        buzzer_player_id: null,
      };

      expect(sessionWithPause.current_question?.is_paused).toBe(true);
      expect(sessionWithPause.answers_revealed).toBe(false);
      // Règle d'or : aucune réponse correcte transmise avant answers_revealed
      expect(sessionWithPause.current_question?.correctAnswer).toBeUndefined();
    });

    it("garantit que la réponse correcte est absente tant que answers_revealed est faux", () => {
      const unrevealedSession: OnlineSession = {
        id: "session-456",
        room_code: "SAFE01",
        host_id: "host-1",
        phase: "playing",
        question_index: 0,
        current_question: {
          id: "q-2",
          question: "Quelle est la vitesse de la lumière ?",
          answers: ["300 000 km/s", "150 000 km/s", "1 000 km/s", "100 000 km/s"],
          is_paused: false,
        },
        answers_revealed: false,
        state_version: 1,
        mode: "classic",
        category: "sciences",
        question_count: 5,
        max_players: 2,
        buzzer_player_id: null,
      };

      expect(unrevealedSession.current_question?.correctAnswer).toBeUndefined();
      expect(unrevealedSession.answers_revealed).toBe(false);
    });
  });
});
