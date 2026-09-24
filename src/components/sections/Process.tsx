"use client";

import { useRef, type CSSProperties } from "react";
import { PROCESS } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Split } from "@/components/motion/Split";
import { Icon, type IconName } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";

const STEP_ICON: IconName[] = ["chat", "tools", "list", "check", "users"];

/**
 * 03 · How we work. The consulting promise: understand first, build second. A rail draws down the five
 * steps as the reader scrolls, and each step's node lights as the rail reaches it.
 */
export function Process() {
  const listRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list || document.documentElement.dataset.motion !== "on") return;
      gsap.fromTo(
        ".p-fill",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 62%", end: "bottom 62%", scrub: 0.4 } },
      );
      gsap.utils.toArray<HTMLElement>(".p-step", list).forEach((step) => {
        ScrollTrigger.create({ trigger: step, start: "top 62%", toggleClass: { targets: step, className: "is-on" } });
      });
    },
    { scope: listRef },
  );

  return (
    <section id="process" aria-labelledby="process-title" className="section bg-[var(--paper-2)]">
      <div className="wrap grid gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
        <div className="self-start lg:sticky lg:top-[calc(var(--nav-h)+56px)]">
          <p className="t-eyebrow" data-reveal>
            {PROCESS.eyebrow}
          </p>
          <Split id="process-title" lines={PROCESS.headline} className="t-h2 mt-6" />
          <p className="t-lead mt-8 max-w-[32rem]" data-reveal style={{ "--reveal-delay": "0.15s" } as CSSProperties}>
            {PROCESS.lead}
          </p>
          <p
            className="mt-10 flex max-w-[30rem] items-start gap-3 border-l-2 border-[var(--spot)] pl-4 text-[0.98rem] leading-[1.55] text-[var(--ink)]"
            data-reveal
            style={{ "--reveal-delay": "0.25s" } as CSSProperties}
          >
            <Mark size={18} className="mt-[3px] shrink-0" />
            {PROCESS.note}
          </p>
        </div>

        <ol ref={listRef} className="relative">
          {/* the rail, and the part of it the reader has travelled */}
          <span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-px bg-[var(--line-strong)]" />
          <span aria-hidden className="p-fill absolute bottom-6 left-[21px] top-6 w-[2px] -translate-x-[0.5px] origin-top bg-[var(--spot)]" />

          {PROCESS.steps.map((step, i) => (
            <li key={step.name} className="p-step group relative pb-16 pl-[4.5rem] last:pb-0 md:pb-20">
              <span className="p-node absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--paper-2)] text-[0.8rem] font-medium text-[var(--ink-2)] transition-[background-color,border-color,color,box-shadow] duration-500 group-[.is-on]:border-[var(--spot)] group-[.is-on]:bg-[var(--spot)] group-[.is-on]:text-white group-[.is-on]:shadow-[0_0_0_6px_rgba(45,74,224,0.12)]">
                <span className="t-num">0{i + 1}</span>
              </span>
              <div data-reveal>
                <p className="pt-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{step.when}</p>
                <h3 className="t-h3 mt-3">{step.name}</h3>
                <p className="t-body mt-4 max-w-[34rem] text-[1.075rem]">{step.body}</p>
                <p className="mt-6 inline-flex max-w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] py-2.5 pl-2.5 pr-4 text-[0.95rem] text-[var(--ink)] shadow-[var(--shadow-card)]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--spot-soft)] text-[var(--spot)]">
                    <Icon name={STEP_ICON[i]} size={17} />
                  </span>
                  <span>
                    <span className="text-[var(--ink-3)]">You get: </span>
                    {step.get}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
