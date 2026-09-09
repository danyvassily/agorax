import { ImageResponse } from "next/og";

export const alt = "Agorax — Le Jeu de Soirée & Quiz Ultime";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090814",
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(108, 92, 231, 0.45) 0%, rgba(9, 8, 20, 0.95) 75%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Border frame */}
        <div
          style={{
            position: "absolute",
            top: 24,
            bottom: 24,
            left: 24,
            right: 24,
            border: "1px solid rgba(108, 92, 231, 0.3)",
            borderRadius: 24,
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 24px",
            borderRadius: 9999,
            background: "rgba(108, 92, 231, 0.25)",
            border: "1px solid rgba(142, 126, 255, 0.5)",
            color: "#A29BFE",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          ⚡ Le Jeu de Soirée Ultime
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            background: "linear-gradient(to bottom, #FFFFFF, #DED9FF)",
            backgroundClip: "text",
            color: "transparent",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          AGORAX
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#B4B0C7",
            textAlign: "center",
            maxWidth: "850px",
            lineHeight: 1.4,
            marginBottom: 44,
          }}
        >
          Quiz de culture générale, dilemmes psychologiques, défis de couple et ambiance garantie entre amis.
        </div>

        {/* Features Row */}
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "10px 22px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.07)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: 18,
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            🔥 10+ Modes de jeu
          </div>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.07)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: 18,
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            📱 100% Gratuit & Sans Pub
          </div>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.07)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: 18,
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            🌐 Multijoueur & Solo
          </div>
        </div>

        {/* Domain footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "#7E79A0",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          agorax.online
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
