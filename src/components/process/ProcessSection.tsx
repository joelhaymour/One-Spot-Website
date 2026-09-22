"use client";

import type { CSSProperties } from "react";
import { PROCESS } from "@/content/copy";
import { ScrollStory, useStory } from "@/components/motion/ScrollStory";
import { SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { CompanyMap } from "./CompanyMap";
import css from "./process.module.css";

/**
 * How we work. The site stops showing agents here and says what we do for a client:
 * six plain steps on the left, one drawing of one company on the right that each step changes.
 */

// The first agent built in the drawing serves customers, so "live" borrows the Customer Service accent.
const ACCENT = { "--accent": "var(--acc-service)", "--accent-rgb": "97, 216, 229" } as CSSProperties;

const number = (i: number) => String(i + 1).padStart(2, "0");

function Steps() {
  const { step, goTo } = useStory();
  return (
    <div>
      {/* Below 1024px only the active step is visible (the rest are visibility:hidden). This is the
          complete text equivalent for assistive technology at those sizes. */}
      <ol className="sr-only lg:hidden">
        {PROCESS.steps.map((s) => (
          <li key={s.title}>
            {s.title} {s.body}
          </li>
        ))}
      </ol>
      <ol className={css.steps}>
        {PROCESS.steps.map((s, i) => {
          const active = i === step;
          return (
            <li
              key={s.title}
              className={cn(
                css.item,
                active && css.itemActive,
                "relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline lg:border-t lg:border-[var(--line)] lg:py-3.5 lg:pl-5 lg:first:border-t-0",
              )}
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 hidden h-full w-px origin-top bg-[rgb(var(--accent-rgb))] transition-transform duration-500 ease-[var(--ease-out)] lg:block"
                style={{ transform: active ? "scaleY(1)" : "scaleY(0)" }}
              />
              <span className={cn("t-label t-num transition-colors duration-500", active ? "text-[rgb(var(--accent-rgb))]" : "text-[var(--text-2)]")}>{number(i)}</span>
              <div className="min-w-0">
                <h3 className="text-[clamp(1.2rem,1.55vw,1.4rem)] font-medium leading-[1.2] tracking-[-0.025em]">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className={cn("text-left transition-colors duration-500", active ? "text-[var(--text-0)]" : "text-[var(--text-2)] hover:text-[var(--text-1)]")}
                  >
                    {s.title}
                  </button>
                </h3>
                <p
                  className={cn(
                    css.body,
                    "mt-1.5 max-w-[34rem] text-[0.9rem] leading-[1.5] tracking-[-0.006em] transition-colors duration-500",
                    active ? "text-[var(--text-1)]" : "text-[var(--text-2)]",
                  )}
                >
                  {s.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Under the desktop breakpoint only the active step is shown, so the other five are reached from this rail. */}
      <nav aria-label="Steps" className="mt-4 flex gap-1.5 lg:hidden">
        {PROCESS.steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Step ${i + 1}: ${s.title}`}
            aria-current={i === step ? "step" : undefined}
            className="flex h-8 flex-1 items-center"
          >
            <span className={cn("block h-px w-full transition-colors duration-500", i === step ? "bg-[var(--text-0)]" : i < step ? "bg-[var(--text-2)]" : "bg-[var(--line-strong)]")} />
          </button>
        ))}
      </nav>
    </div>
  );
}

function Stage({ step }: { step: number }) {
  return (
    <div
      className="mx-auto grid h-full w-full max-w-[1320px] content-start gap-y-4 px-[var(--gutter)] pb-5 pt-[calc(var(--nav-h)+8px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:content-center lg:items-center lg:gap-x-14 lg:pb-8"
      style={ACCENT}
    >
      <div className="max-lg:order-2">
        <Steps />
      </div>
      <div className="min-w-0 max-lg:order-1">
        <CompanyMap step={step} />
      </div>
    </div>
  );
}

export function ProcessSection({ index = "01" }: { index?: string }) {
  return (
    <section id="how" className="relative" aria-labelledby="how-heading">
      <div className="mx-auto max-w-[1320px] px-[var(--gutter)] pb-8 pt-28 md:pt-40">
        <SectionHeading eyebrow={PROCESS.eyebrow} index={index} title={<span id="how-heading">{PROCESS.heading}</span>} lead={PROCESS.lead} />
      </div>

      <ScrollStory steps={PROCESS.steps.length} stepLength={0.8} tail={0.4} aria-label="Six steps, drawn on one company">
        {({ step }) => <Stage step={step} />}
      </ScrollStory>
    </section>
  );
}
