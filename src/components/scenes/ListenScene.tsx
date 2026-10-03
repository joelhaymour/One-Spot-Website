"use client";

import { STEP_SCENES } from "@/content/site";
import { Icon } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";
import { useScene } from "./useScene";

const { notes, findings } = STEP_SCENES.listen;
const TILT = [-1.6, 1.2, -0.8];

/** Listen: what people actually said, and the clear findings it becomes. */
export function ListenScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    tl.set(q(".n-note"), { opacity: 0, y: 16 })
      .set(q(".n-mark"), { scaleX: 0 })
      .set(q(".n-turn"), { opacity: 0, scale: 0.8 })
      .set(q(".n-find"), { opacity: 0, x: -14 });

    tl.to(q(".n-note"), { opacity: 1, y: 0, duration: 0.6, stagger: 0.32 }, 0.1)
      .to(q(".n-mark"), { scaleX: 1, duration: 0.45, stagger: 0.3, ease: "power2.inOut" }, 1.1)
      .to(q(".n-turn"), { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, 2.0)
      .to(q(".n-find"), { opacity: 1, x: 0, duration: 0.55, stagger: 0.24 }, 2.3);
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[520px] select-none">
      <ul className="grid gap-2.5">
        {notes.map((n, i) => (
          <li key={n.who} className="n-note rounded-2xl border border-[var(--line)] bg-[#fffaf0] px-4 py-3 shadow-[var(--shadow-card)]" style={{ rotate: `${TILT[i]}deg` }}>
            <p className="text-[0.9rem] leading-snug text-[var(--ink)]">
              <span className="relative">
                <span className="n-mark absolute inset-x-0 bottom-0 h-[38%] origin-left rounded-sm bg-[rgba(45,74,224,0.14)]" />
                <span className="relative">“{n.quote}”</span>
              </span>
            </p>
            <p className="mt-1 text-[0.75rem] text-[var(--ink-3)]">{n.who}</p>
          </li>
        ))}
      </ul>

      <div className="n-turn my-4 flex items-center justify-center gap-2 text-[0.75rem] font-medium text-[var(--ink-2)]">
        <span className="h-px w-10 bg-[var(--line-strong)]" />
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--spot)] text-white">
          <Mark size={14} spot="#fff" />
        </span>
        Becomes
        <Icon name="arrowDown" size={13} />
        <span className="h-px w-10 bg-[var(--line-strong)]" />
      </div>

      <ul className="grid gap-2 rounded-[20px] border border-[var(--line)] bg-[var(--card)] p-3 shadow-[var(--shadow-lift)]">
        {findings.map((f) => (
          <li key={f.text} className="n-find flex items-center gap-3 rounded-xl px-2.5 py-2">
            <span className={`pill ${f.kind === "Pain" ? "pill-risk" : "pill-wait"} w-14 justify-center`}>{f.kind}</span>
            <span className="text-[0.88rem] font-medium text-[var(--ink)]">{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
