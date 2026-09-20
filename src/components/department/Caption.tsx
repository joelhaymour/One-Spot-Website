"use client";

import type { StoryStep } from "@/content/departments";
import { useStory } from "@/components/motion/ScrollStory";
import { cn } from "@/lib/cn";
import { pad2 } from "./story";
import styles from "./stage.module.css";

function Chevron({ back }: { back?: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className={back ? "rotate-180" : undefined}>
      <path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepButton({ label, back, enabled, onClick }: { label: string; back?: boolean; enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      // aria-disabled, not disabled: a button that disables itself under the finger drops keyboard focus.
      aria-disabled={!enabled}
      onClick={enabled ? onClick : undefined}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] text-[var(--text-1)] transition-[color,border-color,opacity] duration-200 ease-[var(--ease-out)]",
        enabled ? "hover:border-[var(--line-strong)] hover:text-[var(--text-0)]" : "cursor-default opacity-35",
      )}
    >
      <Chevron back={back} />
    </button>
  );
}

/**
 * What the agent is doing, in words. Every step's caption is in the DOM and in the accessibility
 * tree all the time (search engines and screen readers get the whole shift); the inactive ones are
 * only transparent. They share one grid cell, so the block is always as tall as its tallest caption
 * and nothing around it moves when the step changes.
 */
export function Caption({ story }: { story: StoryStep[] }) {
  const { step, steps, goTo } = useStory();
  const current = story[Math.min(step, story.length - 1)];

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      <div className="flex items-center justify-between gap-4">
        <p aria-hidden className="t-label t-num">
          <span className="text-[var(--text-0)]!">{pad2(step + 1)}</span> / {pad2(steps)}
        </p>
        <div className="flex items-center gap-1.5">
          <StepButton label="Previous step" back enabled={step > 0} onClick={() => goTo(step - 1)} />
          <StepButton label="Next step" enabled={step < steps - 1} onClick={() => goTo(step + 1)} />
        </div>
      </div>

      <ol className="grid" aria-label="The shift, step by step">
        {story.map((s, i) => {
          const active = i === step;
          return (
            <li
              key={s.id}
              aria-current={active ? "step" : undefined}
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,transform] ease-[var(--ease-out)]",
                active
                  ? "translate-y-0 opacity-100 delay-[140ms] duration-[420ms]"
                  : "pointer-events-none select-none opacity-0 duration-200",
                // Finished steps leave upward, coming steps wait below: the text travels with the scroll.
                !active && (i < step ? "-translate-y-2" : "translate-y-2"),
              )}
            >
              {/* Caption scale: a step title is one line of a running story, not a section heading. */}
              <h3 className="t-title" style={{ fontSize: "clamp(1.2rem, 1.75vw, 1.8rem)", lineHeight: 1.1 }}>
                {s.title}
              </h3>
              <p className="t-body mt-2 lg:mt-3" style={{ textWrap: "pretty" }}>
                {s.body}
              </p>
              <p
                className={cn(
                  styles.tallOnly,
                  "mt-3 border-t border-[var(--line)] pt-3 font-mono text-[0.6875rem] leading-[1.5] text-[var(--text-2)] lg:mt-4",
                )}
              >
                <span className="sr-only">Agent log: </span>
                {s.log}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Step ${step + 1} of ${steps}. ${current.title}`}
      </p>
    </div>
  );
}
