import type { CSSProperties } from "react";
import { EXAMPLES } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { ExampleFlows } from "@/components/examples/ExampleFlows";

/** 03 · Examples: one ordinary job in four businesses, today and with One Spot. */
export function Examples() {
  return (
    <section id="examples" aria-labelledby="examples-title" className="section bg-[var(--paper-2)]">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="min-w-0">
          <p className="t-eyebrow" data-reveal>
            {EXAMPLES.eyebrow}
          </p>
          <Split id="examples-title" lines={EXAMPLES.headline} className="t-h2 mt-6" />
          <p className="t-lead mt-7 max-w-[32rem]" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
            {EXAMPLES.lead}
          </p>
        </div>
        <div className="relative mx-auto w-full min-w-0 max-w-[540px] lg:mr-0" data-reveal style={{ "--reveal-delay": "0.15s", "--reveal-y": "36px" } as CSSProperties}>
          <ExampleFlows />
        </div>
      </div>
    </section>
  );
}
