"use client";

import { memo, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { BEAT_METRICS, LANES, ORIGINAL_LANE, UI, waitMinutes, type QueueCardData, type QueueSnapshot } from "./script";

/**
 * The work surface: metrics, then the queue. Three columns sit under the three agent positions, so
 * while there is one agent there is one queue beneath it, and when the specialists arrive the same
 * cards slide sideways into a lane under each of them.
 *
 * Cards are absolutely placed and moved with transforms only. Row pitch is computed in CSS from the
 * container's own height (cqh), so a growing queue packs into a tighter stack at any viewport size
 * without measuring anything in JS. The pitch never drops below one label strip; on a short screen
 * the tail of the stack simply runs out under the "+N waiting" chip.
 */

const LANES_STEP = 4;

const surfaceVars = {
  "--gap": "clamp(6px, 1vw, 12px)",
  "--card-h": "38px",
  "--pitch": "44px",
  // Shortest visible slice of a waiting card: exactly its type label.
  "--strip": "13px",
  "--foot": "22px",
} as CSSProperties;

interface QueueCardProps {
  card: QueueCardData;
  col: number;
  /** Position in its queue, head first. */
  index: number;
  /** Cards in its queue: decides how tightly the stack is packed. */
  count: number;
}

const QueueCard = memo(function QueueCard({ card, col, index, count }: QueueCardProps) {
  const inner = useRef<HTMLDivElement>(null);

  // Web Animations rather than a CSS keyframe: the site's pause switch freezes CSS animations at their
  // first frame, which for an entrance would mean an invisible card.
  useLayoutEffect(() => {
    const el = inner.current;
    if (!card.fresh || !el || typeof el.animate !== "function") return;
    const entrance = el.animate(
      [
        { opacity: 0, transform: "translate3d(-60%, 0, 0)" },
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
      ],
      { duration: 440, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    return () => entrance.cancel();
  }, [card.fresh]);

  const working = index === 0 && !card.leaving;
  const pitch = `min(var(--pitch), max(var(--strip), (100cqh - var(--card-h) - var(--foot)) / ${Math.max(1, count - 1)}))`;

  return (
    <li
      className="absolute left-0 top-0 transition-transform duration-500 ease-[var(--ease-out)]"
      style={{
        width: "calc((100% - 2 * var(--gap)) / 3)",
        transform: `translate3d(calc(${col} * (100% + var(--gap))), calc(${index} * ${pitch}), 0)`,
        // Head on top: a packed stack shows each waiting card's bottom strip, where its type is printed.
        zIndex: card.leaving ? 60 : 50 - index,
      }}
    >
      <div
        ref={inner}
        className="panel flex h-[var(--card-h)] flex-col justify-between overflow-hidden rounded-[8px] bg-[var(--bg-1)] px-2 pb-[4px] pt-[6px] transition-[opacity,transform,border-color] duration-[420ms] ease-[var(--ease-out)] md:px-2.5"
        style={{
          opacity: card.leaving ? 0 : 1,
          transform: card.leaving ? "translate3d(60%, 0, 0)" : "none",
          borderColor: working ? "rgba(var(--accent-rgb), 0.5)" : undefined,
        }}
      >
        <span className="truncate text-[11px] leading-none tracking-[-0.005em] text-[var(--text-0)] md:text-[12px]">{card.text}</span>
        <span className={cn("t-label !text-[10px] md:text-[8.5px] transition-colors duration-500", working && "text-[rgb(var(--accent-rgb))]")}>{LANES[card.lane]}</span>
      </div>
    </li>
  );
});

function Metric({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5 border-l border-[var(--line)] px-2.5 py-2.5 first:border-l-0 md:px-4 md:py-3", className)}>
      <dt className="t-label !text-[10px] md:text-[9px] md:!text-[10px] md:text-[9.5px]">{label}</dt>
      <dd className="t-num flex items-baseline gap-1.5 whitespace-nowrap font-mono text-[15px] leading-none text-[var(--text-0)] md:text-[19px]">{children}</dd>
    </div>
  );
}

const unit = "text-[10px] text-[var(--text-2)] md:text-[11px]";

interface WorkSurfaceProps {
  step: number;
  snapshot: QueueSnapshot;
  className?: string;
}

export function WorkSurface({ step, snapshot, className }: WorkSurfaceProps) {
  const { cards, overflow, done } = snapshot;
  const lanes = step >= LANES_STEP;
  const saturated = step >= 1 && step < LANES_STEP;
  const metrics = BEAT_METRICS[step];

  const perLane = [0, 0, 0];
  let waiting = 0;
  for (const c of cards) {
    if (c.leaving) continue;
    perLane[c.lane]++;
    waiting++;
  }
  const depth = waiting + overflow;

  const seen = [0, 0, 0];
  let seenAll = 0;
  const placed = cards.map((card) => {
    const col = lanes ? card.lane : ORIGINAL_LANE;
    // A finished card leaves from the head of the queue, where it was being worked on.
    const index = card.leaving ? 0 : lanes ? seen[card.lane]++ : seenAll++;
    return { card, col, index, count: lanes ? perLane[card.lane] : waiting };
  });

  return (
    <Panel className={cn("flex min-h-0 flex-col overflow-hidden", className)} style={surfaceVars}>
      <PanelHeader
        label={UI.surface}
        right={
          <>
            <span className="transition-opacity duration-500 ease-[var(--ease-out)]" style={{ opacity: saturated ? 1 : 0 }} aria-hidden={!saturated}>
              <StatusChip tone="warn">{UI.growing}</StatusChip>
            </span>
            <span className="t-label ml-1 flex items-baseline gap-1.5">
              {UI.done}
              <AnimatedNumber value={done} duration={0.5} className="text-[var(--text-0)]" />
            </span>
          </>
        }
      />

      <dl className="grid grid-cols-4 border-y border-[var(--line)]">
        <Metric label={UI.metrics.load}>
          <span className="transition-colors duration-700" style={{ color: saturated ? "var(--warn)" : undefined }}>
            <AnimatedNumber value={metrics.load} duration={step === 1 ? 2 : 1.2} suffix="%" />
          </span>
          <span className={cn(unit, "transition-opacity duration-500", lanes ? "opacity-100" : "opacity-0")} aria-hidden={!lanes}>
            {UI.each}
          </span>
        </Metric>
        <Metric label={UI.metrics.depth}>
          <AnimatedNumber value={depth} />
        </Metric>
        <Metric label={UI.metrics.wait}>
          <AnimatedNumber value={waitMinutes(depth, metrics.agents)} />
          <span className={unit}>min</span>
        </Metric>
        <Metric label={UI.metrics.throughput}>
          <AnimatedNumber value={metrics.throughput} duration={1.2} />
          <span className={cn("transition-opacity duration-500", lanes ? "opacity-100 delay-700" : "opacity-0")} aria-hidden={!lanes}>
            <StatusChip tone="ok" className="-translate-y-px">
              {UI.tripled}
            </StatusChip>
          </span>
        </Metric>
      </dl>

      <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2.5 pt-3 md:px-4 md:pb-4">
        {/* lane heads: one queue under one agent, then a lane under each */}
        <ul className="grid grid-cols-3 gap-[var(--gap)]" aria-label={UI.lanes}>
          {LANES.map((lane, i) => {
            const shown = lanes || i === ORIGINAL_LANE;
            return (
              <li
                key={lane}
                className="flex items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2 transition-opacity duration-700 ease-[var(--ease-out)]"
                style={{ opacity: shown ? 1 : 0, transitionDelay: lanes ? `${Math.abs(i - ORIGINAL_LANE) * 120}ms` : "0ms" }}
                aria-hidden={!shown}
              >
                <span className="t-label relative min-w-0 truncate text-[var(--text-1)]">
                  {i === ORIGINAL_LANE ? (
                    <>
                      <span className="transition-opacity duration-500" style={{ opacity: lanes ? 1 : 0 }} aria-hidden={!lanes}>
                        {lane}
                      </span>
                      <span className="absolute left-0 top-0 transition-opacity duration-500" style={{ opacity: lanes ? 0 : 1 }} aria-hidden={lanes}>
                        {UI.queue}
                      </span>
                    </>
                  ) : (
                    lane
                  )}
                </span>
                <span className="t-label t-num">{lanes ? perLane[i] : depth}</span>
              </li>
            );
          })}
        </ul>

        <div className="relative mt-2.5 min-h-[96px] flex-1 overflow-hidden" style={{ containerType: "size" }}>
          <ul aria-hidden className="absolute inset-0">
            {placed.map((p) => (
              <QueueCard key={p.card.id} {...p} />
            ))}
          </ul>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[70] flex justify-center">
            <span
              className="t-label rounded-[5px] border border-[var(--line)] bg-[var(--bg-1)] px-1.5 py-[3px] text-[var(--text-1)] transition-opacity duration-500"
              style={{ opacity: overflow > 0 ? 1 : 0 }}
              aria-hidden={overflow === 0}
            >
              +<AnimatedNumber value={overflow} duration={0.5} /> {UI.waiting}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
