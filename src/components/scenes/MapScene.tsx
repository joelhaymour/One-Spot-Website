"use client";

import { useEffect, useRef, useState } from "react";
import { STEP_SCENES } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icons";
import { useScene } from "./useScene";

const { lanes, steps, total } = STEP_SCENES.map;

// Drawn at one size and scaled to fit. Wide frames lay the lanes out as rows (steps run left to right,
// as in the HUD); narrow ones turn the map on its side (lanes as columns, steps run down) so the
// words stay readable on a phone.
type Layout = { vertical: boolean; W: number; H: number; cardW: number; cardH: number; x: (i: number, lane: number) => number; y: (i: number, lane: number) => number };

const WIDE: Layout = (() => {
  const W = 600;
  const LANE_H = 84;
  const LABEL_W = 92;
  const COL = (W - LABEL_W - 6) / steps.length;
  const cardW = COL - 10;
  const cardH = 56;
  return { vertical: false, W, H: lanes.length * LANE_H, cardW, cardH, x: (i) => LABEL_W + i * COL + (COL - cardW) / 2, y: (_, lane) => lane * LANE_H + (LANE_H - cardH) / 2 };
})();

const TALL: Layout = (() => {
  const W = 320;
  const HEAD = 38;
  const ROW = 64;
  const LANE_W = W / lanes.length;
  const cardW = LANE_W - 8;
  const cardH = 50;
  return { vertical: true, W, H: HEAD + steps.length * ROW + 6, cardW, cardH, x: (_, lane) => lane * LANE_W + 4, y: (i) => HEAD + i * ROW + (ROW - cardH) / 2 };
})();

/** Map: the job, drawn as swimlanes the way the HUD draws it. Hand-offs cross lanes; waits are dashed. */
export function MapScene({ active }: { active: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(WIDE.W);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setFrame(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const L = frame < 470 ? TALL : WIDE;
  const scale = Math.min(1, frame / L.W);
  const { W, H, cardW: CARD_W, cardH: CARD_H } = L;

  const ref = useScene(active, (tl, q) => {
    // The two layouts share class names, so one timeline serves both.
    const cards = q(".m-step");
    const lines = q(".m-line");
    const waits = q(".m-wait");
    tl.set(q(".m-lane"), { opacity: 0 })
      .set(cards, { opacity: 0, scale: 0.85 })
      .set(lines, { strokeDashoffset: 1 })
      .set(waits, { opacity: 0, scale: 0.7 })
      .set(q(".m-pain"), { opacity: 0 })
      .set(q(".m-total"), { opacity: 0, y: 10 });

    tl.to(q(".m-lane"), { opacity: 1, duration: 0.4, stagger: 0.08 }, 0.05);
    steps.forEach((s, i) => {
      const at = 0.45 + i * 0.42;
      if (i > 0) tl.to(lines[i - 1], { strokeDashoffset: 0, duration: 0.3, ease: "power1.inOut" }, at - 0.22);
      tl.to(cards[i], { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, at);
    });
    const end = 0.45 + steps.length * 0.42;
    tl.to(q(".m-pain"), { opacity: 1, duration: 0.4, stagger: 0.15 }, end)
      .to(waits, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.18, ease: "back.out(2)" }, end + 0.2)
      .to(q(".m-total"), { opacity: 1, y: 0, duration: 0.5 }, end + 0.7);
  });

  return (
    <div ref={ref} aria-hidden className="mx-auto w-full max-w-[600px] select-none">
      <div ref={boxRef} className="relative overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-lift)]" style={{ height: H * scale }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          {lanes.map((l, i) =>
            L.vertical ? (
              <div key={l} className={cn("m-lane absolute inset-y-0 border-r border-[var(--line-soft)]", i % 2 ? "bg-[rgba(238,234,226,0.45)]" : "")} style={{ left: (i * W) / lanes.length, width: W / lanes.length }}>
                <div className="flex h-[38px] items-center justify-center gap-1.5 border-b border-[var(--line)] px-1">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--paper-3)] text-[0.62rem] font-semibold text-[var(--ink-2)]">{l.slice(0, 1)}</span>
                  <span className="truncate text-[0.7rem] font-medium text-[var(--ink-2)]">{l}</span>
                </div>
              </div>
            ) : (
              <div key={l} className={cn("m-lane absolute inset-x-0 border-b border-[var(--line-soft)]", i % 2 ? "bg-[rgba(238,234,226,0.45)]" : "")} style={{ top: (i * H) / lanes.length, height: H / lanes.length }}>
                <div className="flex h-full w-[86px] items-center gap-1.5 border-r border-[var(--line)] px-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--paper-3)] text-[0.62rem] font-semibold text-[var(--ink-2)]">{l.slice(0, 1)}</span>
                  <span className="truncate text-[0.7rem] font-medium text-[var(--ink-2)]">{l}</span>
                </div>
              </div>
            ),
          )}

          <svg className="absolute left-0 top-0" width={W} height={H}>
            {steps.slice(1).map((s, j) => {
              const a = steps[j];
              const wait = "wait" in a && a.wait;
              let d: string;
              if (L.vertical) {
                const x1 = L.x(j, a.lane) + CARD_W / 2;
                const y1 = L.y(j, a.lane) + CARD_H;
                const x2 = L.x(j + 1, s.lane) + CARD_W / 2;
                const y2 = L.y(j + 1, s.lane);
                const mid = (y1 + y2) / 2;
                d = `M${x1} ${y1} C${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
              } else {
                const x1 = L.x(j, a.lane) + CARD_W;
                const y1 = L.y(j, a.lane) + CARD_H / 2;
                const x2 = L.x(j + 1, s.lane);
                const y2 = L.y(j + 1, s.lane) + CARD_H / 2;
                const mid = (x1 + x2) / 2;
                d = `M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
              }
              return (
                <path
                  key={j}
                  className="m-line"
                  d={d}
                  pathLength={1}
                  strokeDasharray={1}
                  fill="none"
                  stroke={wait ? "var(--wait)" : "var(--ink-4)"}
                  strokeWidth={wait ? 1.8 : 1.4}
                />
              );
            })}
          </svg>

          {/* waits ride on the dashed hand-offs */}
          {steps.map((a, j) => {
            if (!("wait" in a) || !a.wait || j === steps.length - 1) return null;
            const b = steps[j + 1];
            const mx = (L.x(j, a.lane) + L.x(j + 1, b.lane)) / 2 + CARD_W / 2;
            const my = (L.y(j, a.lane) + L.y(j + 1, b.lane)) / 2 + CARD_H / 2;
            return (
              <span key={j} className="m-wait absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-[rgba(168,109,20,0.35)] bg-[var(--wait-soft)] px-2 py-0.5 text-[0.66rem] font-semibold text-[var(--wait)]" style={{ left: mx, top: my }}>
                <Icon name="clock" size={10} strokeWidth={2.2} />
                {a.wait}
              </span>
            );
          })}

          {steps.map((s, i) => {
            const pain = "pain" in s && s.pain;
            return (
              <div
                key={s.label}
                className={cn("m-step absolute flex flex-col justify-center rounded-[10px] border px-2 py-1.5", pain ? "border-[rgba(180,65,47,0.35)] bg-[var(--card)]" : "border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-card)]")}
                style={{ left: L.x(i, s.lane), top: L.y(i, s.lane), width: CARD_W, height: CARD_H }}
              >
                {pain ? <span className="m-pain absolute inset-0 rounded-[10px] bg-[var(--risk-soft)]" /> : null}
                <span className="relative text-[0.6rem] font-semibold text-[var(--ink-4)]">{i + 1}</span>
                <span className="relative text-[0.68rem] font-medium leading-[1.2] text-[var(--ink)]">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="m-total mt-4 flex items-center justify-center gap-2 text-[0.9rem] font-medium text-[var(--ink)]">
        <span className="pill pill-wait">
          <Icon name="clock" size={12} strokeWidth={2.2} /> Waiting
        </span>
        {total}
      </p>
    </div>
  );
}
