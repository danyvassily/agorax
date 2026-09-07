/* eslint-disable @next/next/no-img-element */
import type { MediaMetadata } from "@/lib/questions/schema";

interface QuestionMediaProps {
  media: MediaMetadata;
}

export function QuestionMedia({ media }: QuestionMediaProps) {
  if (media.type === "image" || media.type === "svg") {
    return (
      <div className="relative mt-4 w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm bg-black/[0.02]">
        {/* We use an img tag instead of next/image to allow external domains without next.config.js modification overhead for SVG/flags, though next/image is better for performance. We'll use unoptimized or a standard img for now to prevent Hostname not configured errors */}
        <img
          src={media.url}
          alt={media.alt || "Question media"}
          className="w-full h-auto max-h-64 object-contain"
        />
        {media.attribution && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white/90 text-[10px] px-2 py-0.5 rounded-full">
            {media.attribution}
          </div>
        )}
      </div>
    );
  }

  if (media.type === "audio") {
    return (
      <div className="mt-4 w-full rounded-2xl bg-fp-primary/10 p-4 border border-fp-primary/20">
        <audio controls src={media.url} className="w-full h-10 outline-none">
          Your browser does not support audio playback.
        </audio>
        {media.attribution && (
          <p className="mt-2 text-center text-xs text-fp-text-dim">
            Source: {media.attribution}
          </p>
        )}
      </div>
    );
  }

  return null;
}
