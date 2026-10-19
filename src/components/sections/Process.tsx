import type { CSSProperties } from "react";
import { PROCESS } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { Mark } from "@/components/ui/Mark";

/**
 * 03 · How we work, in one row: five steps, each with when it happens and what you get. Business first,
 * technology second.
 */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="section pb-[clamp(32px,4vw,64px)]">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-end lg:gap-16">
          <div>
            <p className="t-eyebrow" data-reveal>
              {PROCESS.eyebrow}
            </p>
            <Split id="process-title" lines={PROCESS.headline} className="t-h2 mt-6" />
          </div>
          <div data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
            <p className="t-lead">{PROCESS.lead}</p>
            <p className="mt-5 flex items-start gap-3 text-[0.98rem] leading-[1.55] text-[var(--ink)]">
              <Mark size={18} className="mt-[3px] shrink-0" />
              {PROCESS.note}
            </p>
          </div>
        </div>

        <ol className="relative mt-14 grid gap-px overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:mt-16 lg:grid-cols-5">
          {PROCESS.steps.map((step, i) => (
            <li key={step.name} className="bg-[var(--card)] p-6 lg:p-7" data-reveal style={{ "--reveal-delay": `${i * 0.06}s` } as CSSProperties}>
              <span className="t-num grid h-9 w-9 place-items-center rounded-full border border-[var(--line-strong)] text-[0.8rem] font-medium text-[var(--ink-2)]">0{i + 1}</span>
              <h3 className="mt-5 text-[1.35rem] font-semibold tracking-[-0.025em] text-[var(--ink)]">{step.name}</h3>
              <p className="mt-1 text-[0.85rem] text-[var(--ink-3)]">{step.when}</p>
              <p className="mt-4 text-[0.98rem] leading-snug text-[var(--ink-2)]">{step.get}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
