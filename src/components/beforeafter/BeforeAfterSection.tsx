"use client";

import { useCallback, useState } from "react";
import { BEFORE_AFTER } from "@/content/copy";
import { ScrollStory, useStory } from "@/components/motion/ScrollStory";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { ToolsDiagram } from "./ToolsDiagram";

/**
 * Before / After. Nothing is ripped out: the same eight tools are on screen the whole time.
 * What changes is what stands in the middle of them.
 */

const STATES = [
  { key: "before", label: "Before", text: BEFORE_AFTER.before, goTo: 0 },
  { key: "after", label: "After", text: BEFORE_AFTER.after, goTo: 2 },
] as const;

/** A working day, counted. Before, the first two climb with every jump of attention. */
const COUNTERS = [
  { label: "Tab switches today", before: 312, after: 14 },
  { label: "Copy-pastes", before: 140, after: 0 },
  { label: "Things waiting on you", before: 41, after: 3 },
] as const;

function States() {
  const { step, goTo } = useStory();
  const current = step === 0 ? "before" : "after";
  return (
    <ol className="flex flex-col">
      {STATES.map((state) => {
        const active = state.key === current;
        return (
          <li key={state.key} className="relative border-t border-[var(--line)] py-2.5 pl-5 first:border-t-0 lg:py-5">
            <span
              aria-hidden
              className="absolute left-0 top-0 h-full w-px origin-top bg-[var(--text-0)] transition-transform duration-500 ease-[var(--ease-out)]"
              style={{ transform: active ? "scaleY(1)" : "scaleY(0)" }}
            />
            <button type="button" onClick={() => goTo(state.goTo)} aria-current={active ? "step" : undefined} className="group flex w-full flex-col gap-1.5 text-left lg:gap-2">
              <span className={cn("t-label transition-colors duration-500", active ? "text-[var(--text-0)]" : "text-[var(--text-2)]")}>{state.label}</span>
              <span
                className={cn(
                  "text-[clamp(1.2rem,1.9vw,1.65rem)] font-medium leading-[1.15] tracking-[-0.028em] transition-colors duration-500",
                  active ? "text-[var(--text-0)]" : "text-[var(--text-2)] group-hover:text-[var(--text-1)]",
                )}
              >
                {state.text}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Counters({ hops, settled }: { hops: number; settled: boolean }) {
  const climbing = [hops, Math.floor(hops / 3), 0];
  return (
    <dl className="mt-4 border-t border-[var(--line)] lg:mt-8">
      {COUNTERS.map((counter, i) => (
        <div key={counter.label} className="flex items-baseline justify-between gap-4 border-b border-[var(--line-faint)] py-2 lg:py-3">
          <dt className="t-label">{counter.label}</dt>
          <dd className="font-mono text-[0.95rem] leading-none text-[var(--text-0)]">
            <AnimatedNumber value={settled ? counter.after : counter.before + climbing[i]} duration={settled ? 1.4 : 0.3} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Stage({ step }: { step: number }) {
  // Attention landing on another tool is a tab switch; every third one is a copy-paste.
  const [hops, setHops] = useState(0);
  const onHop = useCallback(() => setHops((h) => h + 1), []);

  return (
    <div className="mx-auto grid h-full w-full max-w-[1320px] content-start gap-y-4 px-[var(--gutter)] pb-5 max-sm:[--frame-h:34svh] pt-[calc(var(--nav-h)+8px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:content-center lg:items-center lg:gap-x-14 lg:pb-8">
      <div className="max-lg:order-2">
        <States />
        <Counters hops={hops} settled={step >= 2} />
        {/* the drawing is hidden from assistive tech; this is its inventory */}
        <p className="sr-only">The eight tools, unchanged before and after: {BEFORE_AFTER.tools.join(", ")}.</p>
      </div>
      <div className="min-w-0 max-lg:order-1">
        <ToolsDiagram step={step} onHop={onHop} />
      </div>
    </div>
  );
}

export function BeforeAfterSection({ index = "02" }: { index?: string }) {
  return (
    <section id="before-after" className="relative" aria-labelledby="before-after-heading">
      <div className="mx-auto max-w-[1320px] px-[var(--gutter)] pb-8 pt-28 md:pt-40">
        <SectionHeading eyebrow={BEFORE_AFTER.eyebrow} index={index} title={<span id="before-after-heading">{BEFORE_AFTER.heading}</span>} lead={BEFORE_AFTER.lead} />
      </div>

      <ScrollStory steps={3} stepLength={0.9} tail={0.5} aria-label="The same eight tools, before and after">
        {({ step }) => <Stage step={step} />}
      </ScrollStory>

      {/* The line that explains the product in one breath. It follows the transformation, not the heading. */}
      <div className="mx-auto max-w-[1320px] px-[var(--gutter)] pb-10 pt-6 md:pb-16">
        <Reveal>
          <p className="max-w-[40rem] text-[clamp(1.25rem,2.1vw,1.85rem)] font-medium leading-[1.2] tracking-[-0.03em] text-[var(--text-0)]">{BEFORE_AFTER.payoff}</p>
        </Reveal>
      </div>
    </section>
  );
}
