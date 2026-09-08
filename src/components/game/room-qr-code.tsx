"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, QrCode as QrIcon, X } from "lucide-react";
import { sound } from "@/lib/audio/sound-engine";

interface RoomQRCodeProps {
  url: string;
  roomCode: string;
  size?: number;
  inline?: boolean;
}

export function RoomQRCode({ url, roomCode, size = 160, inline = true }: RoomQRCodeProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toString(
      url,
      {
        type: "svg",
        margin: 1,
        color: {
          dark: "#0a0a0c",
          light: "#ffffff",
        },
      },
      (err, svg) => {
        if (!err && active && svg) {
          setSvgContent(svg);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [url]);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      sound.playAnswerLocked(); // Micro-feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col items-center">
      {inline && svgContent && (
        <div
          onClick={() => setShowModal(true)}
          className="group relative cursor-pointer rounded-2xl bg-white p-3 shadow-md transition-all hover:scale-105 active:scale-95 border border-black/5"
          style={{ width: size + 24, height: size + 24 }}
          title="Clique pour agrandir le QR Code"
        >
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full rounded-xl overflow-hidden"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-black shadow">
              <QrIcon size={14} /> Agrandir
            </span>
          </div>
        </div>
      )}

      {/* Modal Agrandissement (Pour projection ou scan facile depuis le fond de la pièce) */}
      {showModal && svgContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative flex flex-col items-center rounded-3xl bg-white p-6 shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-black/50 hover:bg-black/5"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-black/50">
              Scannez pour rejoindre
            </span>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-black">
              Salon {roomCode}
            </h3>

            <div
              className="my-4 aspect-square w-64 rounded-2xl bg-white p-2 border border-black/10 shadow-inner [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />

            <p className="text-xs text-black/60 mb-4">
              Ouvrez l&apos;appareil photo de votre smartphone pour rejoindre sans inscription
            </p>

            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-black/90 active:scale-[0.98]"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              {copied ? "Lien copié !" : "Copier le lien d'invitation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
