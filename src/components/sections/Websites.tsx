import type { CSSProperties } from "react";
import { WEBSITES } from "@/content/site";
import { Split } from "@/components/motion/Split";
import { Icon, type IconName } from "@/components/ui/Icons";
import { CartDemo } from "@/components/websites/CartDemo";
import { StoreCompare } from "@/components/websites/StoreCompare";

/** 03 · Websites. The storefront is part of the business too: before and after, a bag that sells, and what we build. */
export function Websites() {
  return (
    <section id="websites" aria-labelledby="websites-title" className="section bg-[var(--paper-2)]">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,32rem)] lg:items-end lg:gap-16">
          <div>
            <p className="t-eyebrow" data-reveal>
              {WEBSITES.eyebrow}
            </p>
            <Split id="websites-title" lines={WEBSITES.headline} className="t-h2 mt-6" />
          </div>
          <p className="t-lead" data-reveal style={{ "--reveal-delay": "0.2s" } as CSSProperties}>
            {WEBSITES.lead}
          </p>
        </div>

        <div className="mt-14 lg:mt-16" data-reveal>
          <StoreCompare />
        </div>

        <div className="mt-20 grid gap-14 lg:mt-24 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <div className="min-w-0" data-reveal>
            <CartDemo />
          </div>
          <div className="min-w-0">
            <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {WEBSITES.features.map((f, i) => (
                <li key={f.title} data-reveal style={{ "--reveal-delay": `${(i % 2) * 0.08}s` } as CSSProperties}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--card)] text-[var(--spot)]">
                    <Icon name={f.icon as IconName} size={19} />
                  </span>
                  <p className="mt-4 text-[1.1rem] font-medium tracking-[-0.015em] text-[var(--ink)]">{f.title}</p>
                  <p className="t-body mt-1.5">{f.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-12 flex max-w-[34rem] items-start gap-3 border-l-2 border-[var(--spot)] pl-4 text-[1rem] leading-[1.55] text-[var(--ink)]" data-reveal>
              {WEBSITES.platform}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
