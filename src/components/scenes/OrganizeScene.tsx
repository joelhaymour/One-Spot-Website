"use client";

import { SCENES } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { Icon } from "@/components/ui/Icons";
import { useScene } from "./useScene";

// A selector scoped to one row (gsap.utils.selector, typed for elements).
const within = (root: Element) => gsap.utils.selector(root) as unknown as (s: string) => HTMLElement[];

const { source, outcomes, owner } = SCENES.organize;

const DEPT: Record<string, string> = {
  Sales: "var(--spot)",
  Scheduling: "#2f8aa0",
  Accounting: "var(--done)",
  Customer: "#7b5cd6",
};

function Tag({ dept }: { dept: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em]" style={{ color: DEPT[dept] ?? "var(--ink-2)" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: DEPT[dept] ?? "var(--ink-3)" }} />
      {dept}
    </span>
  );
}

/** Organize: one signed quote, and every part of the business that needs to know hears at once. */
export function OrganizeScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    const rows = q(".o-row");
    tl.set(q(".o-src"), { opacity: 0, y: -14 })
      .set(q(".o-vtop, .o-vbot"), { scaleY: 0 })
      .set(q(".o-branch"), { scaleX: 0 })
      .set(q(".o-card"), { opacity: 0, x: -12 })
      .set(q(".o-check"), { scale: 0, opacity: 0 })
      .set(q(".o-owner"), { opacity: 0, y: 10 });

    tl.to(q(".o-src"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.15).fromTo(
      q(".o-stamp"),
      { scale: 1.6, opacity: 0, rotation: -12 },
      { scale: 1, opacity: 1, rotation: -6, duration: 0.45, ease: "back.out(2)" },
      0.6,
    );

    rows.forEach((row, i) => {
      const at = 1.0 + i * 0.42;
      const s = within(row);
      tl.to(s(".o-vtop"), { scaleY: 1, duration: 0.25, ease: "none" }, at)
        .to(s(".o-branch"), { scaleX: 1, duration: 0.22, ease: "power1.out" }, at + 0.22)
        .to(s(".o-card"), { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, at + 0.3)
        .to(s(".o-check"), { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.4)" }, at + 0.55);
      const bot = s(".o-vbot");
      if (bot.length) tl.to(bot, { scaleY: 1, duration: 0.2, ease: "none" }, at + 0.25);
    });

    tl.to(q(".o-owner"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.0 + outcomes.length * 0.42 + 0.4);
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto flex w-full max-w-[520px] select-none flex-col justify-center">
      <div className="o-src relative rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[var(--shadow-lift)] sm:p-5">
        <Tag dept={source.dept} />
        <p className="mt-2 text-[1rem] font-medium tracking-[-0.015em] text-[var(--ink)] sm:text-[1.05rem]">{source.title}</p>
        <p className="mt-0.5 text-[0.82rem] text-[var(--ink-3)]">{source.detail}</p>
        <span className="o-stamp absolute right-4 top-4 rounded-md border-[1.5px] border-[var(--done)] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--done)] sm:right-5 sm:top-5">
          Signed
        </span>
      </div>

      <div className="ml-6 pl-8 sm:ml-8">
        {outcomes.map((o, i) => (
          <div key={o.dept} className="o-row relative mt-3.5">
            <span className="o-vtop absolute -left-8 -top-3.5 h-[calc(50%+14px)] w-px origin-top bg-[var(--line-strong)]" />
            {i < outcomes.length - 1 && <span className="o-vbot absolute -left-8 bottom-0 top-1/2 w-px origin-top bg-[var(--line-strong)]" />}
            <span className="o-branch absolute -left-8 top-1/2 h-px w-8 origin-left bg-[var(--line-strong)]" />
            <div className="o-card flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 shadow-[var(--shadow-card)]">
              <div className="min-w-0">
                <Tag dept={o.dept} />
                <p className="mt-1 truncate text-[0.9rem] font-medium tracking-[-0.012em] text-[var(--ink)]">{o.title}</p>
                <p className="truncate text-[0.78rem] text-[var(--ink-3)]">{o.detail}</p>
              </div>
              <span className="o-check grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--done)] text-white">
                <Icon name="check" size={13} strokeWidth={2.6} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="o-owner mt-6 flex items-center gap-2.5 self-start rounded-full bg-[var(--ink)] px-4 py-2 text-[0.82rem] text-[var(--paper)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--spot-light)]" />
        {owner}
      </p>
    </div>
  );
}
