"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A statement that lights word by word as the reader scrolls through it. Words wrapped in *asterisks*
 * are set in the italic spot. Real text throughout; with reduced motion it is simply there.
 */
export function ScrollFill({ text, as: Tag = "p", className }: { text: string; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || document.documentElement.dataset.motion !== "on") return;
      const words = el.querySelectorAll(".fill-word");
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: 0.5 },
        },
      );
    },
    { scope: ref },
  );

  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => {
        const accent = word.startsWith("*");
        const clean = word.replace(/\*/g, "");
        // keep trailing punctuation outside the accent
        const match = accent ? clean.match(/^(.*?)([.,;:!?]*)$/) : null;
        return (
          <span key={i}>
            <span className="fill-word">
              {match ? (
                <>
                  <em className="font-[family-name:var(--font-serif)] italic text-[var(--spot)]">{match[1]}</em>
                  {match[2]}
                </>
              ) : (
                clean
              )}
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}
