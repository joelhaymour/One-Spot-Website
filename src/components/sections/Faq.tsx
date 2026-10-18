"use client";

import { useId, useState, type CSSProperties } from "react";
import { FAQ } from "@/content/site";
import { cn } from "@/lib/cn";
import { Split } from "@/components/motion/Split";
import { Icon } from "@/components/ui/Icons";

/** 04 · The questions owners actually ask, answered straight. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="section">
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        <div className="self-start lg:sticky lg:top-[calc(var(--nav-h)+56px)]">
          <Split id="faq-title" lines={FAQ.headline} className="t-h2" />
        </div>

        <ul className="border-t-2 border-[var(--ink)]">
          {FAQ.items.map((item, i) => {
            const isOpen = open === i;
            const buttonId = `${uid}-q-${i}`;
            const panelId = `${uid}-a-${i}`;
            return (
              <li key={item.q} className="border-b border-[var(--line-strong)]" data-reveal style={{ "--reveal-delay": `${i * 0.05}s` } as CSSProperties}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                  >
                    <span className="text-[1.15rem] font-semibold tracking-[-0.018em] text-[var(--ink)] md:text-[1.3rem]">{item.q}</span>
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-[4px] border-[1.5px] transition-[transform,background-color,border-color,color] duration-[var(--t-ui)] ease-[var(--ease-out)] group-active:translate-y-px",
                        isOpen ? "rotate-45 border-[var(--ink)] bg-[var(--ink)] text-[var(--card)]" : "border-[var(--ink)] text-[var(--ink)] group-hover:bg-[var(--paper-2)]",
                      )}
                    >
                      <Icon name="plus" size={16} strokeWidth={1.8} />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn("grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="t-body max-w-[40rem] pb-7 text-[1.05rem] text-[var(--ink-2)]">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
