"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Sparkline } from "@/components/ui/Charts";
import { Dot, Panel, PanelHeader, ScanLine, StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { ACCENT, ColumnLabel, Fade, HBar, Tag, Tick, useDelayed, wait } from "../sales/kit";
import { AnimatedDuration } from "./AnimatedDuration";
import { CHANNELS, GROUPED, MEDIAN, REQUESTS, ROOT_CAUSE, TOTALS, type ServiceRequest } from "./data";

const ROW_H = 34;
const COLS = "grid grid-cols-[52px_minmax(0,1fr)_44px_122px] items-center gap-x-3";
const SAME_CAUSE_SHOWN = REQUESTS.filter((r) => r.sameCause).length;

interface RequestQueueProps {
  /** The requests have arrived (the workstation is live). */
  live: boolean;
  /** The request the agent has open. */
  selected: string | null;
  resolved: boolean;
  escalated: boolean;
  patterned: boolean;
  active: boolean;
  scanning: boolean;
  /** Median response over the last 12 weeks, from the department tile. */
  trend: number[];
}

/** Region A. One queue for every channel: resolved in under a minute, handed over, then grouped by cause. */
export function RequestQueue({ live, selected, resolved, escalated, patterned, active, scanning, trend }: RequestQueueProps) {
  // One thing at a time: rows tick, then the median falls. Later the shared cause is lit,
  // then those rows gather, then the cause is named.
  const fell = useDelayed(resolved, 1500);
  const grouped = useDelayed(patterned, 1000);
  const named = useDelayed(patterned, 1900);

  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="Queue"
        right={
          <>
            <Fade as="span" on={named} y={0} className="inline-flex">
              <StatusChip tone="neutral">{TOTALS.sameCause} share one cause</StatusChip>
            </Fade>
            <span className="t-label">
              <AnimatedNumber value={live ? TOTALS.today : 0} duration={1.3} className="text-[var(--text-0)]" /> today · 4 channels
            </span>
          </>
        }
      />

      <div className="flex gap-3.5 px-3.5">
        {/* the queue */}
        <div className="w-[520px] shrink-0">
          <div className={cn(COLS, "h-[22px] border-b border-[var(--line-faint)] pl-3")}>
            <ColumnLabel>Channel</ColumnLabel>
            <ColumnLabel>Request</ColumnLabel>
            <ColumnLabel>In</ColumnLabel>
            <ColumnLabel>Status</ColumnLabel>
          </div>
          <div className="relative" style={{ height: ROW_H * REQUESTS.length }}>
            {/* one bracket around the requests that share a cause: the only accent in this panel */}
            <span
              aria-hidden
              className="absolute left-0 top-[5px] w-[2px] origin-top rounded-full transition-[opacity,transform] duration-[700ms] ease-[var(--ease-out)]"
              style={{
                height: SAME_CAUSE_SHOWN * ROW_H - 10,
                background: ACCENT,
                opacity: grouped ? 1 : 0,
                transform: grouped ? "none" : "scaleY(0)",
                transitionDelay: grouped ? wait(850) : "0ms",
              }}
            />
            <ul>
              {REQUESTS.map((request, i) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  index={i}
                  position={grouped ? GROUPED[request.id] : i}
                  live={live}
                  lit={selected === request.id || (patterned && request.sameCause === true)}
                  done={request.resolvedIn ? resolved : escalated}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="w-px self-stretch bg-[var(--line-faint)]" />

        <div className="flex min-w-0 flex-1 flex-col">
          <Response fell={fell} resolved={resolved} escalated={escalated} trend={trend} />
          {/* the channels at rest; the root cause once the agent has found it */}
          <div className="relative mt-3 flex-1 border-t border-[var(--line-faint)] pt-3">
            <Fade on={!named} y={0} className="absolute inset-x-0 top-3">
              <ByChannel live={live} />
            </Fade>
            <Fade on={named} className="absolute inset-x-0 top-3">
              <RootCause on={named} />
            </Fade>
          </div>
        </div>
      </div>

      <ScanLine active={scanning} />
    </Panel>
  );
}

interface RequestRowProps {
  request: ServiceRequest;
  index: number;
  position: number;
  live: boolean;
  lit: boolean;
  /** Resolved by the agent, or in a person's hands. */
  done: boolean;
}

function RequestRow({ request, index, position, live, lit, done }: RequestRowProps) {
  // newest first: the request the agent has open is answered first, the rest follow down the queue
  const doneDelay = done ? wait(300 + index * 110) : "0ms";
  return (
    <li
      className="absolute inset-x-0 top-0 pl-3 transition-transform duration-[850ms] ease-[var(--ease-out)]"
      style={{ height: ROW_H, transform: `translate3d(0, ${position * ROW_H}px, 0)`, transitionDelay: wait(position * 35) }}
    >
      <span
        aria-hidden
        className="absolute inset-y-[3px] left-[7px] right-0 rounded-[6px] bg-white/[0.04] transition-opacity duration-500 ease-[var(--ease-out)]"
        style={{ opacity: lit ? 1 : 0, transitionDelay: lit ? wait(index * 60) : "0ms" }}
      />
      {/* oldest first: the queue fills in the order the requests came in */}
      <div
        className={cn(COLS, "relative h-full border-b border-[var(--line-faint)] transition-[opacity,transform] duration-[600ms] ease-[var(--ease-out)]")}
        style={{
          opacity: live ? 1 : 0.3,
          transform: live ? "none" : "translate3d(-6px, 0, 0)",
          transitionDelay: live ? wait((REQUESTS.length - 1 - index) * 80) : "0ms",
        }}
      >
        <span className="pl-1.5">
          <Tag className="w-[44px] justify-center">{request.channel}</Tag>
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] text-[var(--text-0)]">{request.subject}</span>
          <span className="block truncate text-[10.5px] text-[var(--text-2)]">{request.customer}</span>
        </span>
        <span className="t-num font-mono text-[10.5px] text-[var(--text-2)]">{request.received}</span>
        <span className="relative block h-[16px]">
          <span
            aria-hidden={done ? true : undefined}
            className="absolute inset-0 flex items-center font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--text-2)] transition-opacity duration-300 ease-[var(--ease-out)]"
            style={{ opacity: done ? 0 : 1, transitionDelay: doneDelay }}
          >
            Open
          </span>
          <span
            aria-hidden={done ? undefined : true}
            className="absolute inset-y-0 left-0 right-1.5 flex items-center gap-1.5 transition-opacity duration-500 ease-[var(--ease-out)]"
            style={{ opacity: done ? 1 : 0, transitionDelay: doneDelay }}
          >
            {request.resolvedIn ? (
              <>
                <Tick boxed={false} on={done} delayMs={300 + index * 110} />
                <span className="text-[11px] text-[var(--text-1)]">Resolved</span>
                <span className="t-num ml-auto font-mono text-[10.5px] text-[var(--text-0)]">{request.resolvedIn}</span>
              </>
            ) : (
              <>
                <Dot tone="warn" />
                <span className="text-[11px] text-[var(--text-0)]">With Priya</span>
              </>
            )}
          </span>
        </span>
      </div>
    </li>
  );
}

interface ResponseProps {
  fell: boolean;
  resolved: boolean;
  escalated: boolean;
  trend: number[];
}

function Response({ fell, resolved, escalated, trend }: ResponseProps) {
  return (
    <div className="pt-[5px]">
      <ColumnLabel>Median response</ColumnLabel>
      <div className="mt-3 flex items-end justify-between">
        <AnimatedDuration
          value={fell ? MEDIAN.after : MEDIAN.before}
          className="text-[24px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]"
        />
        {/* twelve weeks of the same figure, drawn as it lands */}
        <Sparkline data={trend} width={70} height={22} drawn={fell} area={false} color="rgba(255, 255, 255, 0.55)" />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between text-[10.5px] text-[var(--text-2)]">
        <span className="inline-grid">
          <span aria-hidden={fell ? true : undefined} className="col-start-1 row-start-1 transition-opacity duration-500" style={{ opacity: fell ? 0 : 1 }}>
            Last week
          </span>
          <span aria-hidden={fell ? undefined : true} className="col-start-1 row-start-1 transition-opacity duration-500" style={{ opacity: fell ? 1 : 0 }}>
            Today
          </span>
        </span>
        <Fade as="span" on={fell} y={0} delayMs={900} className="t-num font-mono text-[10px] text-[var(--ok)]">
          {MEDIAN.delta}
        </Fade>
      </div>
      <dl className="mt-3">
        <div className="flex items-baseline justify-between border-t border-[var(--line-faint)] py-[6px]">
          <dt className="text-[11.5px] text-[var(--text-1)]">Resolved by agent</dt>
          <dd className="t-num font-mono text-[10.5px] text-[var(--text-2)]">
            <AnimatedNumber value={resolved ? TOTALS.resolved : 0} duration={1.6} className="text-[var(--text-0)]" /> of {TOTALS.today}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-[var(--line-faint)] py-[6px]">
          <dt className="text-[11.5px] text-[var(--text-1)]">With a person</dt>
          <dd className="t-num font-mono text-[10.5px] text-[var(--text-0)]">
            <AnimatedNumber value={escalated ? TOTALS.withPerson : 0} duration={1} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ByChannel({ live }: { live: boolean }) {
  const max = Math.max(...CHANNELS.map((c) => c.count));
  return (
    <div>
      <ColumnLabel>By channel</ColumnLabel>
      <ul className="mt-1.5">
        {CHANNELS.map((c, i) => (
          <li key={c.label} className="py-[6px]">
            <div className="flex items-baseline justify-between">
              <span className="text-[11.5px] text-[var(--text-1)]">{c.label}</span>
              <span className="t-num font-mono text-[10.5px] text-[var(--text-0)]">{c.count}</span>
            </div>
            <HBar value={c.count / max} on={live} delayMs={300 + i * 70} className="mt-[6px]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RootCause({ on }: { on: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <ColumnLabel>Root cause</ColumnLabel>
        <span className="t-num font-mono text-[9px] uppercase tracking-[0.07em] text-[var(--text-2)]">
          {SAME_CAUSE_SHOWN} of {TOTALS.sameCause} shown
        </span>
      </div>
      <div className="mt-1.5 text-[12px] text-[var(--text-0)]">{ROOT_CAUSE.title}</div>
      <p className="mt-1 text-[11px] leading-[1.4] text-[var(--text-1)]">{ROOT_CAUSE.body}</p>

      {/* the sentence customers receive today, and the one the agent proposes instead */}
      <div className="mt-2 rounded-[8px] border border-[var(--line)] bg-white/[0.025] px-2.5 py-2">
        <div className="t-label !text-[9px]">Says now</div>
        <p className="mt-1 text-[10.5px] leading-[1.4] text-[var(--text-2)]">{ROOT_CAUSE.now}</p>
        <div className="t-label mt-2 border-t border-[var(--line-faint)] pt-2 !text-[9px] !text-[var(--text-1)]">Proposed</div>
        <p className="mt-1 text-[10.5px] leading-[1.4] text-[var(--text-0)]">
          <TypedText text={ROOT_CAUSE.fix} active={on} speed={38} delay={0.8} />
        </p>
      </div>
    </div>
  );
}
