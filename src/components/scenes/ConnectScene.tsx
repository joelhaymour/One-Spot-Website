"use client";

import { SCENES } from "@/content/site";
import { Icon, type IconName } from "@/components/ui/Icons";
import { Mark } from "@/components/ui/Mark";
import { useScene } from "./useScene";

const { tools, receivers, packet, caption } = SCENES.connect;
const ICONS: IconName[] = ["mail", "calendar", "bank", "sheet", "phone", "users", "box", "wallet"];
const R = 36;
const POS = tools.map((_, i) => {
  const a = ((-90 + i * (360 / tools.length)) * Math.PI) / 180;
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) * 0.92 };
});

/** Connect: eight everyday tools join up through one spot, then a new customer entered once lands everywhere. */
export function ConnectScene({ active }: { active: boolean }) {
  const ref = useScene(active, (tl, q) => {
    const lines = q(".c-line");
    const pills = q(".c-pill");
    const recv = receivers.map((i) => pills[i]);
    const checks = q(".c-check");
    const inDot = q(".c-in")[0];
    const outDots = q(".c-out");

    tl.set(lines, { strokeDashoffset: 1 })
      .set(pills, { opacity: 0.35, scale: 0.94 })
      .set(checks, { scale: 0, opacity: 0 })
      .set(q(".c-label"), { opacity: 0, y: 8 })
      .set([inDot, ...outDots], { opacity: 0 })
      .set(q(".c-caption"), { opacity: 0, y: 8 })
      .set(q(".c-core"), { scale: 0.7, opacity: 0.4 });

    tl.to(pills, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" }, 0.1)
      .to(q(".c-core"), { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" }, 0.3)
      .to(lines, { strokeDashoffset: 0, duration: 0.7, stagger: 0.06, ease: "power2.inOut" }, 0.35)
      .to(q(".c-label"), { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.25)
      .to(pills[0], { borderColor: "rgba(45,74,224,0.55)", backgroundColor: "#e4e8fb", duration: 0.3 }, 1.25)
      .fromTo(inDot, { opacity: 1, attr: { cx: POS[0].x, cy: POS[0].y } }, { attr: { cx: 50, cy: 50 }, duration: 0.7, ease: "power2.inOut" }, 1.7)
      .to(inDot, { opacity: 0, duration: 0.15 }, 2.4)
      .fromTo(q(".c-ping"), { scale: 0.6, opacity: 0.6 }, { scale: 2.1, opacity: 0, duration: 0.8, ease: "power2.out" }, 2.35);

    outDots.forEach((dot, k) => {
      const p = POS[receivers[k]];
      tl.fromTo(dot, { opacity: 1, attr: { cx: 50, cy: 50 } }, { attr: { cx: p.x, cy: p.y }, duration: 0.7, ease: "power2.inOut" }, 2.45).to(dot, { opacity: 0, duration: 0.15 }, 3.15);
    });
    recv.forEach((pill, k) => {
      tl.to(pill, { borderColor: "rgba(43,122,87,0.5)", backgroundColor: "#dfeee5", duration: 0.3 }, 3.1 + k * 0.06).to(
        checks[k],
        { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2.4)" },
        3.12 + k * 0.06,
      );
    });
    tl.to(q(".c-caption"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 3.4);
  });

  return (
    <div ref={ref} aria-hidden className="relative mx-auto aspect-square w-full max-w-[560px] select-none">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
        {POS.map((p, i) => (
          <line key={i} className="c-line" x1={50} y1={50} x2={p.x} y2={p.y} stroke="rgba(21,23,27,0.2)" strokeWidth={0.3} pathLength={1} strokeDasharray="1" />
        ))}
        <circle className="c-in" r={1.3} cx={POS[0].x} cy={POS[0].y} fill="var(--spot)" opacity={0} />
        {receivers.map((i) => (
          <circle key={i} className="c-out" r={1.3} cx={POS[i].x} cy={POS[i].y} fill="var(--done)" opacity={0} />
        ))}
      </svg>

      {/* one spot */}
      <div className="absolute left-1/2 top-1/2 -ml-[34px] -mt-[34px] h-[68px] w-[68px]">
        <span className="c-ping absolute inset-0 rounded-full border-2 border-[var(--spot)] opacity-0" />
        <span className="c-core absolute inset-0 grid place-items-center rounded-full bg-[var(--card)] text-[var(--ink)] shadow-[var(--shadow-lift)]">
          <Mark size={38} />
        </span>
      </div>

      {tools.map((tool, i) => {
        const receiving = (receivers as readonly number[]).includes(i);
        return (
          <div key={tool} className="absolute h-0 w-0" style={{ left: `${POS[i].x}%`, top: `${POS[i].y}%` }}>
            <div className="c-pill relative flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--card)] px-2.5 py-1.5 text-[0.72rem] font-medium tracking-[-0.01em] text-[var(--ink)] shadow-[var(--shadow-card)] sm:gap-2 sm:px-3 sm:text-[0.8rem]">
              <Icon name={ICONS[i]} size={15} className="text-[var(--ink-2)]" />
              {tool}
              {receiving && (
                <span className="c-check absolute -right-1.5 -top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-[var(--done)] text-white">
                  <Icon name="check" size={11} strokeWidth={2.8} />
                </span>
              )}
            </div>
          </div>
        );
      })}

      <div className="c-label absolute left-1/2 top-[1.5%] -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--ink)] px-2.5 py-1.5 text-[0.72rem] font-medium text-[var(--paper)] shadow-[var(--shadow-lift)] sm:text-[0.78rem]">
        {packet}
      </div>

      <p className="c-caption absolute inset-x-0 -bottom-1 text-center font-[family-name:var(--font-serif)] text-[1.2rem] italic text-[var(--ink-2)] sm:text-[1.4rem]">
        {caption}
      </p>
    </div>
  );
}
