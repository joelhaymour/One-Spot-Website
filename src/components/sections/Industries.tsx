"use client";

import { Fragment, useRef } from "react";
import { INDUSTRIES } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Who we work with, as two slow bands of names that drift in opposite directions with the scroll.
 * Scroll-linked rather than auto-playing, so nothing moves unless the reader does.
 */
export function Industries() {
  const ref = useRef<HTMLDivElement>(null);
  const half = Math.ceil(INDUSTRIES.list.length / 2);
  const rows = [INDUSTRIES.list.slice(0, half), INDUSTRIES.list.slice(half)];

  useGSAP(
    () => {
      if (!ref.current || document.documentElement.dataset.motion !== "on") return;
      const trigger = { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
      gsap.fromTo(".ind-row-0", { xPercent: 0 }, { xPercent: -22, ease: "none", scrollTrigger: trigger });
      gsap.fromTo(".ind-row-1", { xPercent: -22 }, { xPercent: 0, ease: "none", scrollTrigger: trigger });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="overflow-hidden border-y border-[var(--line)] bg-[var(--paper-2)] py-12 md:py-16">
      <p className="wrap t-small mb-8 text-center" data-reveal>
        {INDUSTRIES.lead}
      </p>
      <p className="sr-only">{INDUSTRIES.list.join(", ")}</p>
      <div aria-hidden className="marquee-mask grid gap-3 md:gap-4">
        {rows.map((row, r) => (
          <div key={r} className={`ind-row-${r} flex w-max items-center gap-6 whitespace-nowrap pl-[4vw] md:gap-10`}>
            {[...row, ...row, ...row].map((name, i) => (
              <Fragment key={`${name}-${i}`}>
                <span
                  className={
                    r === 0
                      ? "font-[family-name:var(--font-serif)] text-[clamp(2.2rem,5.4vw,4.75rem)] leading-[1.05] tracking-[-0.02em] text-[var(--ink)]"
                      : "font-[family-name:var(--font-serif)] text-[clamp(2.2rem,5.4vw,4.75rem)] italic leading-[1.05] tracking-[-0.02em] text-[var(--ink-4)]"
                  }
                >
                  {name}
                </span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--spot)] opacity-80 md:h-3 md:w-3" />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
