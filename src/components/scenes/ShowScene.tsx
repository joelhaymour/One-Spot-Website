"use client";

import { STEP_SCENES } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";
import { useScene } from "./useScene";

const { title, stats, hoursLabel, hours, after, approve, approved } = STEP_SCENES.show;

const ACTOR: Record<string, { label: string; cls: string; icon?: IconName }> = {
  onespot: { label: "One Spot", cls: "bg-[var(--spot)] text-white" },
  system: { label: "Your systems", cls: "bg-[var(--paper-3)] text-[var(--ink-2)]", icon: "tools" },
  you: { label: "You decide", cls: "bg-[var(--wait)] text-white", icon: "person" },
};

/** Show: the before and after, the way the HUD lays it out, and the plan the owner approves. */
export function ShowScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    const out = q(".s-hours")[0];
    const counter = { v: 0 };
    const target = Number(hours.replace(/\D/g, ""));
    tl.set(q(".s-title"), { opacity: 0, y: 10 })
      .set(q(".s-before"), { opacity: 0 })
      .set(q(".s-after"), { opacity: 0, y: 8 })
      .set(q(".s-row"), { opacity: 0, x: -12 })
      .set(q(".s-btn"), { backgroundColor: "#15171b" })
      .set(q(".s-btn-a"), { opacity: 1 })
      .set(q(".s-btn-b"), { opacity: 0 })
      .call(() => {
        if (out) out.textContent = "~0";
      });

    tl.to(q(".s-title"), { opacity: 1, y: 0, duration: 0.5 }, 0.1)
      .to(q(".s-before"), { opacity: 1, duration: 0.4, stagger: 0.12 }, 0.4)
      .to(q(".s-after"), { opacity: 1, y: 0, duration: 0.45, stagger: 0.18, ease: "back.out(1.8)" }, 0.95)
      .to(counter, { v: target, duration: 1.1, ease: "power2.out", onUpdate: () => out && (out.textContent = `~${Math.round(counter.v)}`) }, 1.0)
      .to(q(".s-row"), { opacity: 1, x: 0, duration: 0.5, stagger: 0.2 }, 1.7)
      .to(q(".s-btn"), { scale: 0.94, duration: 0.12, ease: "power2.in" }, 2.85)
      .to(q(".s-btn"), { scale: 1, backgroundColor: "#2b7a57", duration: 0.35, ease: "back.out(2)" }, 2.97)
      .to(q(".s-btn-a"), { opacity: 0, duration: 0.15 }, 2.97)
      .to(q(".s-btn-b"), { opacity: 1, duration: 0.2 }, 3.05);
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[520px] select-none overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-lift)]">
      <p className="s-title flex items-center gap-2 px-5 pb-4 pt-5 text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--ink)] sm:px-6">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--spot)] shadow-[0_0_0_3px_rgba(45,74,224,0.15)]" />
        {title}
      </p>

      <div className="grid grid-cols-2 gap-px border-y border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--card)] px-4 py-3">
            <p className="text-[0.7rem] font-medium text-[var(--ink-3)]">{s.label}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="s-before t-num text-[0.85rem] text-[var(--ink-4)] line-through decoration-[rgba(180,65,47,0.5)]">{s.before}</span>
              <span className="s-after t-num text-[1.1rem] font-semibold tracking-[-0.02em] text-[var(--done)]">{s.after}</span>
            </p>
          </div>
        ))}
        <div className="bg-[var(--ink)] px-4 py-3 text-[var(--paper)]">
          <p className="text-[0.7rem] font-medium text-[rgba(245,242,236,0.6)]">{hoursLabel}</p>
          <p className="s-hours t-num mt-1 text-[1.35rem] font-semibold tracking-[-0.03em]">{hours}</p>
        </div>
      </div>

      <div className="bg-[linear-gradient(180deg,rgba(228,232,251,0.5),rgba(228,232,251,0))] px-5 pb-5 pt-4 sm:px-6">
        <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--spot)]">
          <span className="h-2 w-2 rounded-full bg-[var(--spot)]" /> With One Spot
        </p>
        <ul className="mt-3 grid gap-2">
          {after.map((a) => {
            const actor = ACTOR[a.actor];
            return (
              <li key={a.text} className="s-row flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 shadow-[var(--shadow-card)]">
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", actor.cls)}>{actor.icon ? <Icon name={actor.icon} size={14} /> : <Mark size={14} spot="#fff" />}</span>
                <span className="min-w-0 flex-1 text-[0.86rem] font-medium leading-snug text-[var(--ink)]">{a.text}</span>
                <span className="hidden shrink-0 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-4)] sm:block">{actor.label}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-end">
          <span className="s-btn relative inline-grid h-10 place-items-center rounded-full bg-[var(--done)] px-5 text-[0.85rem] font-medium text-white">
            <span className="s-btn-a col-start-1 row-start-1 opacity-0">{approve}</span>
            <span className="s-btn-b col-start-1 row-start-1 flex items-center gap-1.5">
              <Icon name="check" size={14} strokeWidth={2.4} /> {approved}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
