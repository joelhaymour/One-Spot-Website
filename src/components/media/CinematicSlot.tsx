"use client";

import { useEffect, useRef } from "react";
import { MEDIA, type CinematicSlotId } from "@/content/media";
import { useExperience } from "@/state/experience";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

interface CinematicSlotProps {
  slot: CinematicSlotId;
  className?: string;
  /** 0..1. Footage is atmosphere: it sits well under the interface. */
  opacity?: number;
}

/**
 * Optional generated footage behind a scene. Poster-first, never load-bearing:
 * - renders nothing until the slot is filled in content/media.ts
 * - fetches nothing until it is near the viewport (preload="none")
 * - only ever decodes while on screen, and releases the decoder when far away
 * - full tier only; reduced-motion, paused and lite visitors keep the still poster
 * - edges are feathered into the void so differing browser black levels never show a rectangle
 */
export function CinematicSlot({ slot, className, opacity = 0.35 }: CinematicSlotProps) {
  const asset = MEDIA[slot] ?? null;
  const video = useRef<HTMLVideoElement>(null);
  const tier = useExperience((s) => s.tier);
  const paused = useExperience((s) => s.paused);
  const reduce = useReducedMotion();
  const play = tier === "full" && !paused && !reduce;

  useEffect(() => {
    const el = video.current;
    if (!el || !asset) return;
    if (!play) {
      el.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Low Power Mode and some autoplay policies reject play(): the poster simply stays.
          el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.pause();
    };
  }, [asset, play]);

  if (!asset) return null;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        opacity,
        maskImage: "radial-gradient(ellipse 75% 70% at 50% 50%, #000 35%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 50%, #000 35%, transparent 100%)",
      }}
    >
      <video ref={video} className="h-full w-full object-cover" poster={asset.poster} preload="none" muted loop playsInline disablePictureInPicture>
        {asset.sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
    </div>
  );
}
