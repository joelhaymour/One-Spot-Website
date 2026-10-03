"use client";

import { useEffect, useRef, useState } from "react";
import { FILE, JOURNEY } from "@/content/site";
import { onIntroDone } from "@/lib/intro";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

const STEP_MS = 2600;
const HOLD_MS = 4200;
const LAST = JOURNEY.steps.length - 1;

const TONE: Record<string, string> = {
  ink: "var(--ink-3)",
  risk: "var(--risk)",
  wait: "var(--wait)",
  spot: "var(--spot)",
  done: "var(--done)",
};

/**
 * The hero's company file, drawn like an account in the One Spot HUD: the six steps as a rail, the
 * question the current step answers, and what we know about the business growing one line per step.
 * It plays on a loop while it's on screen. The server HTML (and reduced motion) is the finished file.
 *
 * step: the step being worked on (0-5); LAST + 1 means the file is complete.
 */
export function CompanyFile({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(LAST + 1);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.motion !== "on") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    let started = false;
    let at = 0;

    const tick = () => {
      at = at > LAST ? 0 : at + 1;
      setStep(at);
      if (visible) timer = setTimeout(tick, at > LAST ? HOLD_MS : STEP_MS);
    };
    const resume = () => {
      clearTimeout(timer);
      if (started && visible) timer = setTimeout(tick, STEP_MS);
    };

    // Empty file under the intro cover, so the first thing a visitor sees is it starting to fill.
    setStep(0);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume();
      else clearTimeout(timer);
    });
    io.observe(el);
    const stop = onIntroDone(() => {
      started = true;
      resume();
    });
    return () => {
      stop();
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const complete = step > LAST;
  const current = JOURNEY.steps[Math.min(step, LAST)];

  return (
    <div ref={ref} aria-hidden className={cn("select-none rounded-[22px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-float)]", className)}>
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-3.5 sm:px-6">
        <span className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]">
          <Mark size={15} className="text-[var(--ink)]" />
          {FILE.label}
        </span>
        <span className={cn("pill t-num", complete ? "pill-done" : "pill-spot")}>
          {complete ? (
            <>
              <Icon name="check" size={12} strokeWidth={2.4} /> Live
            </>
          ) : (
            `Step ${step + 1} of ${LAST + 1}`
          )}
        </span>
      </div>

      <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <p className="text-[1.3rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--ink)]">{FILE.company}</p>
        <p className="mt-1 text-[0.85rem] text-[var(--ink-3)]">{FILE.meta}</p>

        {/* the six steps */}
        <div className="mt-5 grid grid-cols-6 gap-[3px]">
          {JOURNEY.steps.map((s, i) => {
            const state = complete || i < step ? "done" : i === step ? "current" : "upcoming";
            return (
              <div key={s.key} className="min-w-0">
                <span className={cn("relative block h-[6px] overflow-hidden rounded-full", state === "done" ? "bg-[var(--ink)]" : "bg-[var(--line)]")}>
                  {state === "current" ? (
                    <span
                      key={`${s.key}-${step}`}
                      className="file-fill absolute inset-y-0 left-0 rounded-full bg-[var(--spot)]"
                      style={{ animationDuration: `${STEP_MS}ms, 1.1s` }}
                    />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "mt-2 block truncate text-[0.7rem] font-medium transition-colors duration-500",
                    state === "current" ? "text-[var(--spot)]" : state === "done" ? "text-[var(--ink-2)]" : "text-[var(--ink-4)]",
                  )}
                >
                  {s.short}
                </span>
              </div>
            );
          })}
        </div>

        {/* the question this step answers */}
        <div className="mt-5 rounded-2xl bg-[var(--paper-2)] px-4 py-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{complete ? "Where it stands" : "Answering now"}</p>
          <p key={complete ? "done" : current.key} className="story-fade mt-1.5 text-[1rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--ink)]">
            {complete ? "Built, measured, and running." : current.question}
          </p>
        </div>

        {/* what we know: one line per finished step, the rest still blank */}
        <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">What we know</p>
        <ul className="mt-2.5 grid gap-1.5">
          {FILE.lines.map((line, i) => {
            const shown = complete || i < step;
            const fresh = !complete && i === step - 1;
            return (
              <li
                key={line.text}
                className={cn(
                  "relative flex h-9 items-center gap-2.5 rounded-xl px-3 text-[0.875rem] transition-colors duration-700",
                  fresh ? "bg-[var(--spot-soft)]" : "bg-transparent",
                )}
              >
                {shown ? (
                  <span key={`${line.text}-${step > LAST ? "all" : "one"}`} className="story-fade flex min-w-0 items-center gap-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TONE[line.tone] }} />
                    <span className={cn("truncate", line.tone === "done" ? "font-medium text-[var(--done)]" : "text-[var(--ink)]")}>{line.text}</span>
                  </span>
                ) : (
                  <span className="flex w-full items-center gap-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--line-strong)]" />
                    <span className="h-2 rounded-full bg-[var(--paper-3)]" style={{ width: `${46 + ((i * 17) % 34)}%` }} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-4 flex items-center gap-2 border-t border-[var(--line-soft)] pt-4 text-[0.85rem] text-[var(--ink-2)]">
          {complete ? (
            <>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--done)] text-white">
                <Icon name="check" size={11} strokeWidth={2.6} />
              </span>
              Next: keep improving it with Dana
            </>
          ) : (
            <>
              <Icon name="arrow" size={14} className="text-[var(--spot)]" />
              <span className="text-[var(--ink-3)]">Next:</span>
              <span key={step} className="story-fade truncate font-medium text-[var(--ink)]">
                {FILE.next[step]}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
