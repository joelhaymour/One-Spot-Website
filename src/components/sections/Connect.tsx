import type { CSSProperties } from "react";
import { CONNECT } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { AnchorLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { ConnectMap } from "@/components/connect/ConnectMap";

/**
 * 01 · What we connect. The parts every business runs on, around one dashboard (the morning screen in
 * the hero is that dashboard); pick a part to see where it lives and what changes. Websites get one line.
 */
export function Connect() {
  return (
    <section id="connect" aria-labelledby="connect-title" className="section bg-[var(--paper)] pt-[clamp(48px,7vw,96px)]">
      <div className="wrap">
        <div className="grid gap-8 xl:grid-cols-[1fr_minmax(0,30rem)] xl:items-end xl:gap-16">
          <div>
            <p className="t-eyebrow" data-reveal>
              {CONNECT.eyebrow}
            </p>
            <Split id="connect-title" lines={CONNECT.headline} className="t-h2 mt-6" />
          </div>
          <p className="t-lead max-w-[40rem] xl:max-w-none" data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
            {CONNECT.lead}
          </p>
        </div>

        <div className="mt-12 lg:mt-14" data-reveal>
          <ConnectMap />
        </div>

        {/* websites, in one line */}
        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--line)] pt-8 sm:flex-row sm:items-center sm:justify-between" data-reveal>
          <p className="max-w-[40rem] text-[1.02rem] leading-snug text-pretty text-[var(--ink)]">{CONNECT.website.text}</p>
          <AnchorLink href="#contact" className="inline-flex shrink-0 items-center gap-2 text-[0.95rem] font-medium text-[var(--ink)] underline-offset-4 hover:underline">
            {CONNECT.website.action}
            <Icon name="arrow" size={16} />
          </AnchorLink>
        </div>
      </div>
    </section>
  );
}
