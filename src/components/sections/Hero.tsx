import type { CSSProperties } from "react";
import { HERO } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { AnchorButton } from "@/components/ui/Button";
import { CompanyFile } from "@/components/hero/CompanyFile";

/**
 * The opening: the promise on the left, and on the right one business's file in the One Spot HUD,
 * filling in step by step. The page's whole story in one glance: we learn first, then build.
 */
export function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden">
      <div aria-hidden className="dot-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_45%,#000_15%,transparent_75%)]" />
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[8%] h-[720px] w-[720px] rounded-full [background:radial-gradient(circle,rgba(45,74,224,0.10),rgba(45,74,224,0)_62%)]" />

      <div className="wrap relative grid items-center gap-12 pb-20 pt-[calc(var(--nav-h)+48px)] md:pb-28 lg:min-h-[100svh] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 lg:pb-16 lg:pt-[calc(var(--nav-h)+24px)]">
        <div>
          <p className="t-eyebrow max-sm:text-[0.64rem] max-sm:tracking-[0.1em]" data-reveal style={{ "--reveal-delay": "0.05s" } as CSSProperties}>
            {HERO.eyebrow}
          </p>
          <Split as="h1" lines={HERO.headline} className="t-hero mt-6 md:mt-8" delay={0.1} />
          <p className="t-lead mt-7 max-w-[36rem] md:mt-8" data-reveal style={{ "--reveal-delay": "0.45s" } as CSSProperties}>
            {HERO.lead}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3" data-reveal style={{ "--reveal-delay": "0.6s" } as CSSProperties}>
            <AnchorButton href={HERO.primary.href}>{HERO.primary.label}</AnchorButton>
            <AnchorButton href={HERO.secondary.href} variant="ghost" arrow="down">
              {HERO.secondary.label}
            </AnchorButton>
          </div>
          <p className="t-small mt-6" data-reveal style={{ "--reveal-delay": "0.75s" } as CSSProperties}>
            {HERO.reassurance}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] lg:mr-0" data-reveal style={{ "--reveal-delay": "0.35s", "--reveal-y": "36px" } as CSSProperties}>
          <CompanyFile />
        </div>
      </div>
    </section>
  );
}
