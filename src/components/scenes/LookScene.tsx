"use client";

import { STEP_SCENES } from "@/content/site";
import { Mark } from "@/components/ui/Mark";
import { useScene } from "./useScene";

const { company, meta, toolsLabel, tools, stuckLabel, stuck, openerLabel, opener } = STEP_SCENES.look;

/** Look: the research brief we write before the first call. It reads the business, then fills in. */
export function LookScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    tl.set(q(".l-scan"), { yPercent: -100, opacity: 1 })
      .set(q(".l-head, .l-co"), { opacity: 0, y: 10 })
      .set(q(".l-label"), { opacity: 0 })
      .set(q(".l-tool"), { opacity: 0, scale: 0.8 })
      .set(q(".l-stuck"), { opacity: 0, x: -12 })
      .set(q(".l-ask"), { opacity: 0, y: 12 });

    tl.to(q(".l-head"), { opacity: 1, y: 0, duration: 0.5 }, 0.1)
      .to(q(".l-scan"), { yPercent: 100, duration: 1.4, ease: "power1.inOut" }, 0.2)
      .to(q(".l-scan"), { opacity: 0, duration: 0.3 }, 1.4)
      .to(q(".l-co"), { opacity: 1, y: 0, duration: 0.6 }, 0.35)
      .to(q(".l-label"), { opacity: 1, duration: 0.4, stagger: 0.5 }, 0.8)
      .to(q(".l-tool"), { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: "back.out(2)" }, 0.9)
      .to(q(".l-stuck"), { opacity: 1, x: 0, duration: 0.5, stagger: 0.22 }, 1.45)
      .to(q(".l-ask"), { opacity: 1, y: 0, duration: 0.6 }, 2.3);
  });

  return (
    <div ref={ref} aria-hidden className="relative mx-auto w-full max-w-[520px] select-none overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <span className="l-scan pointer-events-none absolute inset-x-0 top-0 h-full opacity-0 [background:linear-gradient(180deg,rgba(45,74,224,0)_0%,rgba(45,74,224,0.08)_80%,rgba(45,74,224,0.35)_100%)]" />
      <div className="l-head flex items-center justify-between border-b border-[var(--line-soft)] pb-3.5 text-[0.75rem] text-[var(--ink-3)]">
        <span className="flex items-center gap-2 font-medium text-[var(--ink-2)]">
          <Mark size={15} />
          Research brief
        </span>
        <span className="pill pill-spot">Before we meet</span>
      </div>

      <div className="l-co mt-5">
        <p className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[var(--ink)]">{company}</p>
        <p className="mt-0.5 text-[0.85rem] text-[var(--ink-3)]">{meta}</p>
      </div>

      <p className="l-label mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{toolsLabel}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tools.map((t) => (
          <span key={t} className="l-tool pill">
            {t}
          </span>
        ))}
      </div>

      <p className="l-label mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{stuckLabel}</p>
      <ul className="mt-2 grid gap-1.5">
        {stuck.map((s) => (
          <li key={s} className="l-stuck flex items-center gap-2.5 rounded-xl bg-[var(--paper-2)] px-3 py-2 text-[0.85rem] text-[var(--ink)]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--wait)]" />
            {s}
          </li>
        ))}
      </ul>

      <div className="l-ask mt-5 rounded-xl border border-[rgba(45,74,224,0.22)] bg-[var(--spot-soft)] px-4 py-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--spot)]">{openerLabel}</p>
        <p className="mt-1 text-[0.95rem] font-semibold tracking-[-0.015em] text-[var(--ink)]">{opener}</p>
      </div>
    </div>
  );
}
