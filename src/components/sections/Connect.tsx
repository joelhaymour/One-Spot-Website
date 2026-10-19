import type { CSSProperties } from "react";
import { CONNECT } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { AnchorLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { ConnectMap } from "@/components/connect/ConnectMap";
import { DashboardPreview } from "@/components/connect/DashboardPreview";

/**
 * 01 · What we connect. The parts every business runs on, around one dashboard; pick the part that's a
 * mess. Then the payoff: the one screen an owner sees each morning. Websites get one line of their own.
 */
export function Connect() {
  return (
    <section id="connect" aria-labelledby="connect-title" className="section bg-[var(--paper)] pt-[clamp(48px,7vw,96px)]">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-end lg:gap-16">
          <div>
            <p className="t-eyebrow" data-reveal>
              {CONNECT.eyebrow}
            </p>
            <Split id="connect-title" lines={CONNECT.headline} className="t-h2 mt-6" />
          </div>
          <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
            {CONNECT.lead}
          </p>
        </div>

        <div className="mt-12 lg:mt-14" data-reveal>
          <ConnectMap />
        </div>

        {/* the payoff */}
        <div className="mt-20 grid items-center gap-8 lg:mt-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div data-reveal>
            <h3 className="t-h3">{CONNECT.dashboard.title}</h3>
            <p className="t-body mt-4 max-w-[26rem] text-[1.05rem]">{CONNECT.dashboard.body}</p>
            <p className="t-small mt-3">{CONNECT.dashboard.caption}</p>
          </div>
          <div data-reveal style={{ "--reveal-delay": "0.1s" } as CSSProperties}>
            <DashboardPreview />
          </div>
        </div>

        {/* websites, in one line */}
        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--line)] pt-8 sm:flex-row sm:items-center sm:justify-between" data-reveal>
          <p className="max-w-[40rem] text-[1.02rem] leading-snug text-[var(--ink)]">{CONNECT.website.text}</p>
          <AnchorLink href="#contact" className="inline-flex shrink-0 items-center gap-2 text-[0.95rem] font-medium text-[var(--ink)] underline-offset-4 hover:underline">
            {CONNECT.website.action}
            <Icon name="arrow" size={16} />
          </AnchorLink>
        </div>
      </div>
    </section>
  );
}
