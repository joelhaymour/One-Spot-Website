import type { CSSProperties } from "react";
import { EXAMPLES } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { ExampleFlows } from "@/components/examples/ExampleFlows";

/** 03 · Examples: one ordinary job in four businesses, today and with One Spot, side by side. */
export function Examples() {
  return (
    <section id="examples" aria-labelledby="examples-title" className="section bg-[var(--paper-2)]">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-16">
          <Split id="examples-title" lines={EXAMPLES.headline} className="t-h2" />
          <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.1s" } as CSSProperties}>
            {EXAMPLES.lead}
          </p>
        </div>
        <div className="mt-12 lg:mt-14" data-reveal>
          <ExampleFlows />
        </div>
      </div>
    </section>
  );
}
