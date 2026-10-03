"use client";

import { STEP_SCENES } from "@/content/site";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";
import { useScene } from "./useScene";

const { status, tasks, measuredLabel, measured } = STEP_SCENES.build;
const STATUS_CLS = ["pill-spot", "pill-wait", "pill-done"];

/** Build: the work ticks off, the status moves from building to live, and then we measure. */
export function BuildScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    const states = q(".b-status");
    const boxes = q(".b-box");
    const ticks = q(".b-tick");
    tl.set(states, { opacity: 0, y: 6 })
      .set(states[0], { opacity: 1, y: 0 })
      .set(q(".b-bar"), { scaleX: 0 })
      .set(boxes, { backgroundColor: "#fffdf9", borderColor: "rgba(21,23,27,0.18)" })
      .set(ticks, { strokeDashoffset: 1 })
      .set(q(".b-label"), { color: "#15171b" })
      .set(q(".b-measure"), { opacity: 0, y: 14 })
      .set(q(".b-metric"), { opacity: 0, scale: 0.9 });

    tasks.forEach((_, i) => {
      const at = 0.4 + i * 0.7;
      tl.to(boxes[i], { backgroundColor: "#2b7a57", borderColor: "#2b7a57", duration: 0.2 }, at)
        .to(ticks[i], { strokeDashoffset: 0, duration: 0.25 }, at + 0.08)
        .to(q(".b-label")[i], { color: "#7f848c", duration: 0.3 }, at + 0.1);
      if (i === 1 || i === 2) {
        const s = i === 1 ? 1 : 2;
        tl.to(states[s - 1], { opacity: 0, y: -6, duration: 0.2 }, at + 0.15).to(states[s], { opacity: 1, y: 0, duration: 0.3 }, at + 0.3);
      }
    });
    tl.to(q(".b-bar"), { scaleX: 1, duration: 0.4 + tasks.length * 0.7, ease: "power1.inOut" }, 0.2)
      .to(q(".b-measure"), { opacity: 1, y: 0, duration: 0.55 }, 2.7)
      .to(q(".b-metric"), { opacity: 1, scale: 1, duration: 0.45, stagger: 0.18, ease: "back.out(2)" }, 2.95);
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[520px] select-none">
      <div className="rounded-[22px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-lift)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[0.85rem] font-semibold text-[var(--ink)]">
            <Mark size={15} />
            Job notes become the invoice
          </span>
          <span className="inline-grid">
            {status.map((s, i) => (
              <span key={s} className={`b-status pill ${STATUS_CLS[i]} col-start-1 row-start-1 justify-self-end`} style={i < status.length - 1 ? { opacity: 0 } : undefined}>
                {i === status.length - 1 ? <Icon name="check" size={12} strokeWidth={2.4} /> : null}
                {s}
              </span>
            ))}
          </span>
        </div>
        <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-[var(--paper-2)]">
          <span className="b-bar block h-full origin-left rounded-full bg-[var(--done)]" />
        </span>
        <ul className="mt-4 grid gap-1">
          {tasks.map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-xl px-1 py-2">
              <span className="b-box grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[var(--done)] bg-[var(--done)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path className="b-tick" d="m5 12.5 4.5 4.5L19 7.5" pathLength={1} strokeDasharray={1} />
                </svg>
              </span>
              <span className="b-label text-[0.9rem] text-[var(--ink-3)]">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="b-measure mt-3 rounded-[22px] border border-[rgba(43,122,87,0.25)] bg-[var(--done-soft)] p-5 sm:p-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--done)]">{measuredLabel}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {measured.map((m) => (
            <div key={m.label} className="b-metric rounded-xl bg-[var(--card)] px-4 py-3">
              <p className="text-[0.72rem] text-[var(--ink-3)]">{m.label}</p>
              <p className="mt-1 text-[1.25rem] font-semibold tracking-[-0.03em] text-[var(--ink)]">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
