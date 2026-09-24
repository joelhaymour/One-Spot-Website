"use client";

import { SCENES } from "@/content/site";
import { Mark } from "@/components/ui/Mark";
import { useScene } from "./useScene";

const { greeting, intro, stats, attentionTitle, attention } = SCENES.see;

/** See clearly: the owner's Monday note. Last week in plain English, and only what needs them. */
export function SeeScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    tl.set(q(".s-head, .s-greet, .s-intro"), { opacity: 0, y: 12 })
      .set(q(".s-stat"), { opacity: 0, y: 14 })
      .set(q(".s-att-title"), { opacity: 0 })
      .set(q(".s-item"), { opacity: 0, x: -12 })
      .set(q(".s-action"), { opacity: 0, scale: 0.85 });

    tl.to(q(".s-head"), { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.1)
      .to(q(".s-greet"), { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.3)
      .to(q(".s-intro"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.5)
      .to(q(".s-stat"), { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, 0.8)
      .to(q(".s-att-title"), { opacity: 1, duration: 0.5 }, 1.4)
      .to(q(".s-item"), { opacity: 1, x: 0, duration: 0.55, stagger: 0.28, ease: "power3.out" }, 1.55)
      .to(q(".s-action"), { opacity: 1, scale: 1, duration: 0.4, stagger: 0.28, ease: "back.out(2)" }, 1.8);
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[520px] select-none rounded-[22px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <div className="s-head flex items-center justify-between border-b border-[var(--line-soft)] pb-3.5 text-[0.75rem] text-[var(--ink-3)]">
        <span className="flex items-center gap-2 font-medium text-[var(--ink-2)]">
          <Mark size={15} />
          Your Monday summary
        </span>
        <span>Mon 7:00am</span>
      </div>

      <p className="s-greet mt-5 font-[family-name:var(--font-serif)] text-[1.9rem] leading-[1.05] tracking-[-0.02em] text-[var(--ink)] sm:text-[2.2rem]">{greeting}</p>
      <p className="s-intro mt-1.5 text-[0.9rem] text-[var(--ink-2)]">{intro}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="s-stat rounded-xl bg-[var(--paper-2)] px-3 py-2.5">
            <p className="text-[0.68rem] leading-tight text-[var(--ink-3)]">{s.label}</p>
            <p className="t-num mt-1 text-[1.2rem] font-medium leading-none tracking-[-0.02em] text-[var(--ink)] sm:text-[1.35rem]">{s.value}</p>
            <p className="mt-1 text-[0.66rem] leading-tight text-[var(--ink-3)]">{s.note}</p>
          </div>
        ))}
      </div>

      <p className="s-att-title mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--wait)]">{attentionTitle}</p>
      <ul className="mt-2 grid gap-2">
        {attention.map((a) => (
          <li key={a.text} className="s-item flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-3.5 py-2.5">
            <span className="text-[0.8rem] leading-[1.35] text-[var(--ink)]">{a.text}</span>
            <span className="s-action shrink-0 rounded-full bg-[var(--ink)] px-3 py-1.5 text-[0.72rem] font-medium text-[var(--paper)]">{a.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
