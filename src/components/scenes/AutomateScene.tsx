"use client";

import { SCENES } from "@/content/site";
import { Mark } from "@/components/ui/Mark";
import { useScene } from "./useScene";

const { title, tasks, hoursLabel, hours } = SCENES.automate;
const STEP = 0.42;

/** Automate: the week's routine work ticks itself off, and the hours come back to the team. */
export function AutomateScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    const boxes = q(".a-box");
    const ticks = q(".a-tick");
    const labels = q(".a-label");
    const counts = q(".a-count");
    const tags = q(".a-by");
    const out = q(".a-hours")[0];
    const counter = { v: 0 };

    tl.set(boxes, { backgroundColor: "rgba(255,253,249,1)", borderColor: "rgba(21,23,27,0.18)" })
      .set(ticks, { strokeDashoffset: 1 })
      .set(counts, { opacity: 0, x: 8 })
      .set(tags, { opacity: 0 })
      .set(labels, { color: "#15171b" })
      .set(q(".a-bar"), { scaleX: 0 })
      .set(counter, { v: 0 })
      .call(() => {
        if (out) out.textContent = "0.0";
      });

    tasks.forEach((_, i) => {
      const at = 0.35 + i * STEP;
      tl.to(boxes[i], { backgroundColor: "#2b7a57", borderColor: "#2b7a57", duration: 0.2 }, at)
        .to(ticks[i], { strokeDashoffset: 0, duration: 0.25, ease: "power2.out" }, at + 0.08)
        .to(labels[i], { color: "#7f848c", duration: 0.3 }, at + 0.1)
        .to(counts[i], { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, at + 0.1)
        .to(tags[i], { opacity: 1, duration: 0.3 }, at + 0.14);
    });

    const span = tasks.length * STEP;
    tl.to(q(".a-bar"), { scaleX: 1, duration: span, ease: "power1.inOut" }, 0.35).to(
      counter,
      {
        v: hours,
        duration: span,
        ease: "power1.inOut",
        onUpdate: () => {
          if (out) out.textContent = counter.v.toFixed(1);
        },
      },
      0.35,
    );
    // settle exactly on the number, whatever the frame timing
    tl.call(() => {
      if (out) out.textContent = hours.toFixed(1);
    });
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[500px] select-none rounded-[22px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <div className="flex items-center justify-between">
        <p className="text-[1rem] font-medium tracking-[-0.015em] text-[var(--ink)]">{title}</p>
        <span className="rounded-full bg-[var(--paper-2)] px-2.5 py-1 text-[0.72rem] font-medium text-[var(--ink-2)]">Mon–Fri</span>
      </div>
      <ul className="mt-4 divide-y divide-[var(--line-soft)]">
        {tasks.map((task) => (
          <li key={task.label} className="flex items-center gap-3 py-3">
            <span className="a-box grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[7px] border-[1.5px] border-[var(--done)] bg-[var(--done)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path className="a-tick" d="m5 12.5 4.5 4.5L19 7.5" pathLength={1} strokeDasharray="1" />
              </svg>
            </span>
            <span className="a-label min-w-0 flex-1 truncate text-[0.9rem] tracking-[-0.01em] text-[var(--ink-3)]">{task.label}</span>
            <span className="a-by flex items-center gap-1 text-[0.68rem] font-medium text-[var(--ink-3)] max-sm:hidden">
              <Mark size={11} />
              by One Spot
            </span>
            <span className="a-count t-num w-[4.2rem] shrink-0 text-right text-[0.8rem] font-medium text-[var(--done)]">{task.count}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-2xl bg-[var(--paper-2)] p-4">
        <div className="flex items-end justify-between gap-4">
          <p className="text-[0.82rem] leading-[1.35] text-[var(--ink-2)]">{hoursLabel}</p>
          <p className="flex items-baseline gap-1 font-[family-name:var(--font-serif)] text-[2.6rem] leading-none tracking-[-0.02em] text-[var(--ink)]">
            <span className="a-hours t-num">{hours.toFixed(1)}</span>
            <span className="font-[family-name:var(--font-sans)] text-[0.85rem] tracking-normal text-[var(--ink-3)]">hrs</span>
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--paper-3)]">
          <div className="a-bar h-full origin-left rounded-full bg-[var(--done)]" />
        </div>
      </div>
    </div>
  );
}
