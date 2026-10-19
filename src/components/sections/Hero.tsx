import type { CSSProperties } from "react";
import { HERO } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { AnchorButton } from "@/components/ui/Button";

/** The opening: the promise, set large, and straight into what we connect. */
export function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden">
      <div aria-hidden className="dot-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_45%,#000_15%,transparent_75%)]" />
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[8%] h-[720px] w-[720px] rounded-full [background:radial-gradient(circle,rgba(45,74,224,0.10),rgba(45,74,224,0)_62%)]" />

      <div className="wrap relative pb-16 pt-[calc(var(--nav-h)+56px)] md:pb-20 lg:pb-24 lg:pt-[calc(var(--nav-h)+96px)]">
        <p className="t-eyebrow max-sm:text-[0.64rem] max-sm:tracking-[0.1em]" data-reveal style={{ "--reveal-delay": "0.05s" } as CSSProperties}>
          {HERO.eyebrow}
        </p>
        <Split as="h1" lines={HERO.headline} className="t-hero mt-6 md:mt-8" delay={0.1} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,36rem)_auto] lg:items-end lg:justify-between">
          <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.45s" } as CSSProperties}>
            {HERO.lead}
          </p>
          <div data-reveal style={{ "--reveal-delay": "0.6s" } as CSSProperties}>
            <div className="flex flex-wrap items-center gap-3">
              <AnchorButton href={HERO.primary.href}>{HERO.primary.label}</AnchorButton>
              <AnchorButton href={HERO.secondary.href} variant="ghost" arrow="down">
                {HERO.secondary.label}
              </AnchorButton>
            </div>
            <p className="t-small mt-4">{HERO.reassurance}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
