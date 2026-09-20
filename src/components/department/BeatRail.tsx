"use client";

import { useMemo, useRef } from "react";
import type { StoryStep } from "@/content/departments";
import { useStory, useStoryProgress } from "@/components/motion/ScrollStory";
import { cn } from "@/lib/cn";
import { beatSpans, pad2, railProgress } from "./story";
import styles from "./stage.module.css";

/**
 * The loop every agent runs, as wayfinding. After one department a visitor can read all seven.
 * Five real buttons; the line between them follows scroll by writing one CSS variable, so the
 * rail never re-renders at scroll rate and CSS decides whether it runs across or down.
 */
export function BeatRail({ story }: { story: StoryStep[] }) {
  const { step, goTo } = useStory();
  const rail = useRef<HTMLElement>(null);
  const spans = useMemo(() => beatSpans(story), [story]);
  const activeBeat = story[Math.min(step, story.length - 1)].beat;

  useStoryProgress((_, stepProgress, s) => {
    rail.current?.style.setProperty("--p", railProgress(spans, s, stepProgress).toFixed(4));
  });

  return (
    <nav ref={rail} aria-label="The agent's loop" className={styles.rail}>
      <span aria-hidden className={styles.railTrack}>
        <span className={styles.railFill} />
      </span>
      <ol className={styles.railList}>
        {spans.map((span, i) => {
          const active = span.id === activeBeat;
          const reached = span.count > 0 && step >= span.first;
          const last = span.first + span.count;
          return (
            <li key={span.id} className="min-w-0">
              <button
                type="button"
                disabled={span.count === 0}
                aria-current={active ? "step" : undefined}
                onClick={() => goTo(span.first)}
                className={cn(
                  styles.beat,
                  "font-mono text-[0.625rem] uppercase leading-none tracking-[0.09em] transition-colors duration-300 ease-[var(--ease-out)] hover:text-[var(--text-0)] disabled:pointer-events-none disabled:opacity-40 sm:text-[0.6875rem]",
                  active ? "text-[var(--text-0)]" : reached ? "text-[var(--text-1)]" : "text-[var(--text-2)]",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-[7px] w-[7px] shrink-0 rounded-full border transition-colors duration-300 ease-[var(--ease-out)]",
                    active
                      ? "border-[rgb(var(--accent-rgb))] bg-[rgb(var(--accent-rgb))] shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.16)]"
                      : reached
                        ? "border-[var(--text-1)] bg-[var(--text-1)]"
                        : "border-[var(--line-strong)] bg-[var(--void)]",
                  )}
                />
                <span aria-hidden className={cn(styles.beatIndex, "t-num text-[var(--text-2)]")}>
                  {pad2(i + 1)}
                </span>
                <span>{span.label}</span>
                {span.count > 0 && (
                  <span className="sr-only">
                    {span.count === 1 ? `, step ${last}` : `, steps ${span.first + 1} to ${last}`}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
