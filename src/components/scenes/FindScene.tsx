"use client";

import { STEP_SCENES } from "@/content/site";
import { Icon } from "@/components/ui/Icons";
import { useScene } from "./useScene";

const { painsLabel, pains, fixesLabel, fixes, skip } = STEP_SCENES.find;
/** Which of the pains each fix removes; the last pain is the one not worth building. */
const SOLVES = [[0, 1], [2], [3]];
const SKIP = pains.length - 1;

/** Find: everything we found, and the few changes that remove most of it. Plus what we'd leave alone. */
export function FindScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    const chips = q(".f-pain");
    const fixCards = q(".f-fix");
    tl.set(q(".f-label"), { opacity: 0 })
      .set(chips, { opacity: 0, y: 10, backgroundColor: "#f6e1db", color: "#b4412f" })
      .set(q(".f-strike"), { scaleX: 0 })
      .set(fixCards, { opacity: 0, y: 14 })
      .set(q(".f-skip"), { opacity: 0, y: 14 });

    tl.to(q(".f-label")[0], { opacity: 1, duration: 0.4 }, 0.05).to(chips, { opacity: 1, y: 0, duration: 0.4, stagger: 0.12, ease: "back.out(1.8)" }, 0.2);
    tl.to(q(".f-label")[1], { opacity: 1, duration: 0.4 }, 1.1);
    SOLVES.forEach((hit, i) => {
      const at = 1.3 + i * 0.6;
      tl.to(
        hit.map((h) => chips[h]),
        { backgroundColor: "#dfeee5", color: "#2b7a57", duration: 0.35 },
        at,
      ).to(fixCards[i], { opacity: 1, y: 0, duration: 0.5 }, at + 0.1);
    });
    const end = 1.3 + SOLVES.length * 0.6;
    tl.to(chips[SKIP], { color: "#b2b4b8", backgroundColor: "#eeeae2", duration: 0.3 }, end)
      .to(q(".f-strike"), { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, end + 0.05)
      .to(q(".f-skip"), { opacity: 1, y: 0, duration: 0.5 }, end + 0.3);
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[520px] select-none rounded-[22px] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow-lift)] sm:p-7">
      <p className="f-label text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{painsLabel}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {pains.map((p, i) => (
          <span key={p} className="f-pain relative inline-flex h-7 items-center rounded-full bg-[var(--done-soft)] px-3 text-[0.78rem] font-medium text-[var(--done)]" style={i === SKIP ? { background: "var(--paper-2)", color: "var(--ink-4)" } : undefined}>
            {p}
            {i === SKIP ? <span className="f-strike absolute inset-x-2.5 top-1/2 h-px origin-left bg-current" /> : null}
          </span>
        ))}
      </div>

      <p className="f-label mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]">{fixesLabel}</p>
      <ul className="mt-2.5 grid gap-2">
        {fixes.map((f) => (
          <li key={f.title} className="f-fix flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 shadow-[var(--shadow-card)]">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--spot)] text-white">
              <Icon name="check" size={14} strokeWidth={2.2} />
            </span>
            <span className="flex-1 text-[0.9rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">{f.title}</span>
            <span className="pill pill-done">{f.solves}</span>
          </li>
        ))}
      </ul>

      <div className="f-skip mt-3 flex items-center gap-3 rounded-xl border border-dashed border-[var(--line-strong)] px-3.5 py-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--paper-2)] text-[var(--ink-3)]">
          <Icon name="close" size={13} strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.88rem] font-medium text-[var(--ink-3)] line-through">{skip.title}</span>
          <span className="block text-[0.78rem] text-[var(--ink-3)]">{skip.why}</span>
        </span>
      </div>
    </div>
  );
}
