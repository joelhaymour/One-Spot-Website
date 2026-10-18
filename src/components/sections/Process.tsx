"use client";

import { useRef, type CSSProperties } from "react";
import { PROCESS } from "@/content/site";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { Split } from "@/components/motion/Split";
import { Mark } from "@/components/ui/Mark";

/**
 * 01 · How we work, as the routing slip that travels with a job: five steps on ruled rows, each with
 * when it happens, what happens and what you get. As the reader reaches a row its step box inks in,
 * the way a slip gets initialled at each station.
 */
export function Process() {
  const listRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list || document.documentElement.dataset.motion !== "on") return;
      gsap.utils.toArray<HTMLElement>(".p-step", list).forEach((step) => {
        ScrollTrigger.create({ trigger: step, start: "top 70%", toggleClass: { targets: step, className: "is-on" } });
      });
    },
    { scope: listRef },
  );

  const { slip } = PROCESS;

  return (
    <section id="process" aria-labelledby="process-title" className="section">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-16">
          <Split id="process-title" lines={PROCESS.headline} className="t-h2" />
          <div data-reveal style={{ "--reveal-delay": "0.1s" } as CSSProperties}>
            <p className="t-lead text-[var(--ink)]">{PROCESS.lead}</p>
            <p className="mt-5 flex items-start gap-3 text-[0.98rem] leading-[1.55] text-[var(--ink-2)]">
              <Mark size={18} className="mt-[3px] shrink-0 text-[var(--ink)]" />
              {PROCESS.note}
            </p>
          </div>
        </div>

        {/* the slip */}
        <div className="ticket mt-14 overflow-hidden lg:mt-16" data-reveal>
          <div className="flex items-baseline justify-between border-b-2 border-[var(--ink)] px-5 pb-3 pt-5 sm:px-8">
            <span className="t-label">{slip.label}</span>
            <span className="t-label t-num text-[var(--ink-3)]">{PROCESS.steps.length} steps</span>
          </div>
          <div aria-hidden className="hidden grid-cols-[4.5rem_11rem_minmax(0,1fr)_minmax(0,17rem)] gap-6 border-b border-[var(--line-strong)] px-8 py-2.5 md:grid">
            <span className="t-label text-[0.8rem] text-[var(--ink-3)]">{slip.step}</span>
            <span className="t-label text-[0.8rem] text-[var(--ink-3)]">{slip.when}</span>
            <span className="t-label text-[0.8rem] text-[var(--ink-3)]">{slip.what}</span>
            <span className="t-label text-[0.8rem] text-[var(--ink-3)]">{slip.get}</span>
          </div>
          <ol ref={listRef}>
            {PROCESS.steps.map((step, i) => (
              <li
                key={step.name}
                className="p-step group grid gap-x-6 gap-y-2 border-b border-[var(--line-strong)] px-5 py-6 last:border-b-0 sm:px-8 md:grid-cols-[4.5rem_11rem_minmax(0,1fr)_minmax(0,17rem)] md:items-baseline md:py-7"
              >
                <span className="flex items-center gap-4 md:block">
                  <span className="t-num grid h-12 w-12 place-items-center rounded-[4px] border-2 border-[var(--ink)] font-[family-name:var(--font-display)] text-[1.35rem] font-black transition-colors duration-[var(--t-ui)] group-[.is-on]:bg-[var(--ink)] group-[.is-on]:text-[var(--card)]">
                    {i + 1}
                  </span>
                  <span className="t-h3 md:hidden">{step.name}</span>
                </span>
                <span className="text-[0.92rem] font-medium text-[var(--ink-2)] md:pt-1">{step.when}</span>
                <span>
                  <span className="t-h3 hidden md:block">{step.name}</span>
                  <span className="t-body mt-2 block max-w-[38rem] text-[1.02rem] text-[var(--ink-2)]">{step.body}</span>
                </span>
                <span className="mt-1 border-t border-dashed border-[var(--line-strong)] pt-3 text-[0.98rem] leading-[1.45] text-[var(--ink)] md:mt-0 md:border-0 md:pt-1">
                  <span className="text-[var(--ink-3)] md:hidden">{slip.get}: </span>
                  {step.get}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
