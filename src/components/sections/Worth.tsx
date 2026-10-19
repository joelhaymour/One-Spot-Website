import type { CSSProperties } from "react";
import { WORTH } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { WorthCalculator } from "@/components/worth/WorthCalculator";

/** 02 · What it's worth: the calculator, on its own band, with the visitor's own numbers. */
export function Worth() {
  return (
    <section id="worth" aria-labelledby="worth-title" className="section bg-[var(--paper-2)]">
      <div className="wrap grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="min-w-0 lg:sticky lg:top-[calc(var(--nav-h)+56px)] lg:pt-6">
          <p className="t-eyebrow" data-reveal>
            {WORTH.section.eyebrow}
          </p>
          <Split id="worth-title" lines={WORTH.section.headline} className="t-h2 mt-6" />
          <p className="t-lead mt-7 max-w-[30rem]" data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
            {WORTH.section.lead}
          </p>
        </div>
        <div className="relative mx-auto w-full min-w-0 max-w-[540px] lg:mr-0" data-reveal style={{ "--reveal-delay": "0.1s" } as CSSProperties}>
          <WorthCalculator />
        </div>
      </div>
    </section>
  );
}
