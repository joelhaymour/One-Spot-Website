"use client";

import { memo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BUSINESS } from "@/content/copy";
import { CEO, DEPARTMENTS, departmentHref, type Department } from "@/content/departments";
import { ALERTS, COMPANY, DEADLINES, KEY_METRICS, RECOMMENDATIONS, REVENUE, TODAY, TODOS, TODO_RECOMMENDATIONS, type Recommendation } from "@/content/hud";
import { AgentSvg, Mark } from "@/components/agent/AgentSvg";
import { AnimatedNumber, formatNumber } from "@/components/ui/AnimatedNumber";
import { ArcProgress, Sparkline } from "@/components/ui/Charts";
import { Dot, Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { useDepartmentTransition } from "@/components/motion/Transition";
import { useExperience } from "@/state/experience";
import { cn } from "@/lib/cn";
import { HUB_LABELS } from "./labels";
import type { HudState } from "./useHudScript";

/**
 * One Spot Hub: the owner's command center, authored at 1280 x 760 virtual px (see VirtualDisplay).
 * Two tabs, told in four story steps:
 *
 *   0  black, "See more."                                             Dashboard tab lit
 *   1  Dashboard: revenue / four key metrics / seven doors (+ 1 dock)
 *   2  black, "Do less."                                              Dashboard tab still lit
 *   3  To Do: calendar and deadlines / waiting on you, needs attention / recommendations
 *
 * The fades are CSS opacity transitions driven by `step`; reduced motion turns them into cuts.
 * Whatever is faded out is inert: no pointer, no focus, nothing for assistive tech, so the doors
 * only exist while you can see them. The tabs are the way in for anyone who does not scroll.
 * Calm by rule: only warn-tone dots pulse, and the CEO Agent's spot breathes. Nothing else loops.
 */

export const HUD_SIZE = { width: 1280, height: 760 } as const;

export type HubTab = keyof typeof BUSINESS.tabs;

/** The story steps each tab sits on (the words sit on 0 and 2). */
export const TAB_STEP: Record<HubTab, number> = { dashboard: 1, todo: 3 };

interface BusinessHudProps {
  state: HudState;
  /** The story step, 0..3. Phones have no story: the caller passes 0 (and the Dashboard before mount). */
  step: number;
  /** False while the display is only atmosphere (phones): tabs and doors leave the tab order. */
  interactive?: boolean;
  /** A tab was chosen: the owner scrolls the story to it. */
  onSelectTab?: (tab: HubTab) => void;
}

const TABS: HubTab[] = ["dashboard", "todo"];

export function BusinessHud({ state, step, interactive = true, onSelectTab }: BusinessHudProps) {
  const dashboard = step === 1;
  const todo = step === 3;
  const activeTab: HubTab = todo ? "todo" : "dashboard";
  // The underline follows the story; "pressed" means the pane is actually on screen.
  const shown: Record<HubTab, boolean> = { dashboard, todo };

  return (
    <div className="absolute inset-0 select-none text-[12px] leading-[1.35] text-[var(--text-1)]">
      {/* bar: first in the DOM so the tabs come before the pane they reveal (focus and reading order) */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-[48px] items-center justify-between border-b border-[var(--line)] px-5">
        <div className="flex items-center gap-3">
          <Mark size={16} className="text-[var(--text-0)]" />
          <span className="t-label text-[var(--text-0)]">{HUB_LABELS.name}</span>
          <span className="h-3 w-px bg-[var(--line-strong)]" />
          <span className="text-[12px] text-[var(--text-1)]">{COMPANY.name}</span>
        </div>
        <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-stretch gap-7">
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                aria-pressed={shown[tab]}
                tabIndex={interactive ? 0 : -1}
                onClick={() => onSelectTab?.(tab)}
                className={cn(
                  "t-label relative flex items-center px-1 outline-offset-[-3px] transition-colors duration-300",
                  active ? "text-[var(--text-0)]" : "text-[var(--text-2)] hover:text-[var(--text-1)]",
                )}
              >
                {BUSINESS.tabs[tab]}
                <span
                  aria-hidden
                  className={cn("absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[var(--text-0)] transition-opacity duration-300", active ? "opacity-100" : "opacity-0")}
                  style={{ boxShadow: "0 0 10px rgba(var(--spot-rgb), 0.45)" }}
                />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <span className="t-label flex items-center gap-3">
            <span>{COMPANY.period}</span>
            <span className="text-[var(--text-3)]">/</span>
            <span>{COMPANY.dayLabel}</span>
            <span className="text-[var(--text-3)]">/</span>
            <span>{COMPANY.workingDaysLeft} working days left</span>
          </span>
          <span className="h-3 w-px bg-[var(--line-strong)]" />
          <span className="flex items-center gap-2">
            <span className="spot spot-breathe" />
            <span className="t-label text-[var(--text-0)]">{HUB_LABELS.observing(CEO.name)}</span>
          </span>
        </div>
      </div>

      {/* Phones have no story: the display is atmosphere and always shows the Dashboard (the words and
          the To Do tab repeat natively below it). */}
      <Pane shown={dashboard} phone>
        <Dashboard state={state} interactive={interactive && dashboard} />
      </Pane>
      <Pane shown={todo}>
        <ToDo state={state} />
      </Pane>

      {/* the two words, over the middle of the screen */}
      <Word shown={step === 0}>{BUSINESS.seeMore}</Word>
      <Word shown={step === 2}>{BUSINESS.doLess}</Word>

    </div>
  );
}

/* ------------------------------------------------------------------ the two states of the screen */

/** A tab's content. Faded in over 0.9 s, out over 0.6 s; inert the moment it is not the one shown. */
function Pane({ shown, phone = false, children }: { shown: boolean; /** what phones always show */ phone?: boolean; children: ReactNode }) {
  return (
    <div
      inert={!shown}
      className={cn(
        "absolute inset-0 transition-opacity ease-[var(--ease-out)]",
        shown ? "opacity-100 duration-[900ms]" : "pointer-events-none opacity-0 duration-[600ms]",
        phone ? "max-md:opacity-100!" : "max-md:opacity-0!",
      )}
    >
      {children}
    </div>
  );
}

/** One of the two words, centred under the bar. Fades over 0.5 s either way. */
function Word({ shown, children }: { shown: boolean; children: string }) {
  return (
    <p
      aria-hidden={!shown}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 top-[48px] grid place-items-center text-[56px] font-medium leading-none tracking-[-0.04em] text-[var(--text-0)] transition-opacity duration-500 ease-[var(--ease-out)] max-md:opacity-0!",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ dashboard (step 1) */

/**
 * The Dashboard tab, filling the canvas under the bar:
 *
 *   revenue (780 x 284)            │ four key metrics, 2 x 2 (446 x 284)
 *   departments: header, then seven doors + the open dock, 4 x 2 (1240 x 370)
 */
function Dashboard({ state, interactive }: { state: HudState; interactive: boolean }) {
  const pct = state.revenue / REVENUE.target;
  return (
    <>
      <Panel className="absolute left-5 top-[62px] h-[284px] w-[780px]">
        <PanelHeader
          label={`Revenue / ${COMPANY.period}`}
          right={
            <span className="t-label text-[var(--ok)] transition-opacity duration-700" style={{ opacity: state.revenueNote ? 1 : 0 }} aria-hidden>
              + {state.revenueNote ?? "Payment received"}
            </span>
          }
        />
        <div className="flex h-[248px] items-center justify-between px-5 pb-3">
          <div className="flex h-full flex-col justify-between pt-1">
            <div>
              <div className="flex items-baseline gap-3">
                <AnimatedNumber value={state.revenue} format="currency" className="text-[52px] font-medium leading-none tracking-[-0.035em] text-[var(--text-0)]" />
                <span className="text-[12.5px] text-[var(--text-2)]">of {formatNumber(REVENUE.target, "currency")} target</span>
              </div>
              <div className="mt-3.5 flex items-center gap-2 text-[12px]">
                <Dot tone="neutral" />
                <span>
                  3 deals worth <span className="text-[var(--text-0)]">{formatNumber(REVENUE.pending, "currency")}</span> are waiting on one signature each. That is{" "}
                  {Math.round(((state.revenue + REVENUE.pending) / REVENUE.target) * 100)}%.
                </span>
              </div>
            </div>
            <Sparkline data={REVENUE.spark} width={540} height={88} strokeWidth={1.6} />
          </div>
          <ArcProgress value={pct} size={168} stroke={7} className="mr-1">
            <div className="text-center">
              <AnimatedNumber value={pct * 100} format="int" suffix="%" className="text-[32px] font-medium tracking-[-0.03em] text-[var(--text-0)]" />
              <div className="t-label mt-1 !text-[9.5px]">of target</div>
            </div>
          </ArcProgress>
        </div>
      </Panel>

      <div className="absolute left-[814px] top-[62px] grid h-[284px] w-[446px] grid-cols-2 grid-rows-2 gap-[10px]">
        {KEY_METRICS.map((m) => (
          <Panel key={m.id} className="flex flex-col justify-between px-4 py-3.5">
            <div className="t-label">{m.label}</div>
            <div className="flex items-baseline justify-between">
              <AnimatedNumber value={state.metrics[m.id] ?? m.value} format={m.format} suffix={m.suffix} className="text-[30px] font-medium tracking-[-0.03em] text-[var(--text-0)]" />
              <span className="t-num font-mono text-[11px]" style={{ color: m.tone === "warn" ? "var(--warn)" : "var(--ok)" }}>
                {m.delta}
              </span>
            </div>
          </Panel>
        ))}
      </div>

      <nav aria-label={HUB_LABELS.departments} className="absolute left-5 top-[370px] w-[1240px]">
        <div className="mb-[10px] flex h-[18px] items-center justify-between">
          <span className="t-label">{HUB_LABELS.departments}</span>
          <span className="flex items-center gap-3">
            <StatusChip tone="neutral">{HUB_LABELS.workforce(DEPARTMENTS.length)}</StatusChip>
            <span className="t-label text-[var(--text-1)]">{HUB_LABELS.select}</span>
          </span>
        </div>
        <ul className="grid grid-cols-4 gap-[10px]">
          {DEPARTMENTS.map((d) => (
            <li key={d.id}>
              <DepartmentDoor department={d} flash={state.lastDept === d.id} interactive={interactive} />
            </li>
          ))}
          <li>
            <div className="flex h-[166px] flex-col justify-between rounded-[12px] border border-dashed border-[var(--line-strong)] p-3">
              <span className="t-label">{HUB_LABELS.dock}</span>
              <div>
                <div className="text-[12px] text-[var(--text-0)]">Reconciliation Agent</div>
                <div className="mt-1 text-[10.5px] text-[var(--text-2)]">Recommended by the CEO Agent. Not built yet.</div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
}

/* ------------------------------------------------------------------ to do (step 3) */

/** The hours the calendar shows, and how tall one hour is (8 hours x 42 px = 336 px). */
const DAY = { start: 9, end: 17, slot: 42 } as const;
const hourOf = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
};

/**
 * Three columns, 300 / 330 / 590 wide with 10 px gaps, all 678 px tall (62 to 740):
 * calendar and deadlines │ waiting on you, needs attention │ three recommendations.
 */
function ToDo({ state }: { state: HudState }) {
  const hours = DAY.end - DAY.start;
  return (
    <div className="absolute left-5 top-[62px] flex h-[678px] w-[1240px] gap-[10px]">
      <Panel className="flex w-[300px] shrink-0 flex-col overflow-hidden">
        <PanelHeader label={HUB_LABELS.calendar} right={<span className="t-label">{COMPANY.dayLabel}</span>} />
        <div className="px-3.5 pb-3.5">
          <div className="t-label !text-[9.5px]">{HUB_LABELS.today}</div>
          <div className="relative mt-2.5" style={{ height: hours * DAY.slot + 12 }}>
            {Array.from({ length: hours + 1 }, (_, i) => (
              <div key={i} aria-hidden className="absolute inset-x-0 flex items-center gap-2" style={{ top: i * DAY.slot }}>
                <span className="t-num w-[34px] font-mono text-[9.5px] leading-none text-[var(--text-3)]">{String(DAY.start + i).padStart(2, "0")}:00</span>
                <span className="h-px flex-1 bg-[var(--line-faint)]" />
              </div>
            ))}
            <ul>
              {TODAY.map((e, i) => (
                <li
                  key={e.time}
                  className="absolute left-[42px] right-0 flex flex-col justify-center rounded-[6px] border-l-2 pl-2.5 pr-2"
                  style={{
                    top: (hourOf(e.time) - DAY.start) * DAY.slot + 2,
                    height: DAY.slot - 4,
                    borderColor: i === 0 ? "rgb(var(--accent-rgb))" : "var(--line-strong)",
                    background: i === 0 ? "rgba(var(--accent-rgb), 0.07)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <span className="truncate text-[12px] leading-[1.2] text-[var(--text-0)]">{e.label}</span>
                  <span className="t-num mt-[3px] font-mono text-[10px] leading-none text-[var(--text-2)]">{e.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="t-label mt-4 !text-[9.5px]">{HUB_LABELS.deadlines}</div>
          <ul className="mt-1">
            {DEADLINES.map((d) => (
              <li key={d.label} className="flex items-center justify-between border-t border-[var(--line-faint)] py-[11px] first:border-t-0">
                <span className="truncate pr-2 text-[12px] text-[var(--text-0)]">{d.label}</span>
                <StatusChip tone={d.tone === "warn" ? "warn" : "neutral"}>{d.due}</StatusChip>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <div className="flex w-[330px] shrink-0 flex-col gap-[10px]">
        <Panel className="min-h-0 flex-[3] overflow-hidden">
          <PanelHeader label={HUB_LABELS.waiting} right={<span className="t-label t-num">{HUB_LABELS.approvals(TODOS.length - state.done.length)}</span>} />
          <TodoList done={state.done} />
        </Panel>
        <Panel className="min-h-0 flex-[2] overflow-hidden">
          <PanelHeader label={HUB_LABELS.attention} />
          <ul className="px-3.5">
            {ALERTS.map((a) => (
              <li key={a.id} className="flex items-start gap-2.5 border-t border-[var(--line-faint)] py-[12px] first:border-t-0">
                <Dot tone={a.tone} className="mt-[6px]" pulse={a.tone === "warn"} />
                <span className="min-w-0">
                  <span className="block truncate text-[12px] text-[var(--text-0)]">{a.label}</span>
                  <span className="block truncate text-[10.5px] text-[var(--text-2)]">{a.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-[10px] flex h-[18px] items-center justify-between">
          <span className="t-label">{HUB_LABELS.recommendations}</span>
          <span className="t-label t-num text-[var(--text-1)]">{HUB_LABELS.approvals(TODO_RECOMMENDATIONS.length)}</span>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col gap-[10px]">
          {TODO_RECOMMENDATIONS.map((id) => {
            const rec = RECOMMENDATIONS.find((r) => r.id === id);
            return rec ? (
              <li key={id} className="min-h-0 flex-1">
                <RecommendationCard rec={rec} />
              </li>
            ) : null;
          })}
        </ul>
      </div>
    </div>
  );
}

/** The owner's checklist. The script ticks items off; a done item stays, struck through. */
function TodoList({ done: doneIds }: { done: string[] }) {
  return (
    <ul className="px-3.5">
      {TODOS.map((t) => {
        const done = doneIds.includes(t.id);
        return (
          <li key={t.id} className="flex gap-2.5 border-t border-[var(--line-faint)] py-[13px] first:border-t-0">
            <span
              className={cn(
                "mt-[2px] grid h-[13px] w-[13px] shrink-0 place-items-center rounded-[3.5px] border transition-colors duration-500",
                done ? "border-[var(--ok)] bg-[color-mix(in_srgb,var(--ok)_22%,transparent)]" : "border-[var(--line-strong)]",
              )}
            >
              <svg viewBox="0 0 10 10" className="h-2 w-2" aria-hidden>
                <path
                  d="M2 5.2 4.2 7.4 8 3"
                  fill="none"
                  stroke="var(--ok)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  style={{ strokeDashoffset: done ? 0 : 1, transition: "stroke-dashoffset 500ms var(--ease-out)" }}
                />
              </svg>
            </span>
            <span className="min-w-0">
              <span className={cn("block truncate text-[12.5px] transition-colors duration-500", done ? "text-[var(--text-3)] line-through" : "text-[var(--text-0)]")}>
                {t.label}
              </span>
              <span className="block truncate text-[10.5px] text-[var(--text-2)]">{done ? HUB_LABELS.doneBy : t.by}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** One recommendation, static: who asks, what it saw, what it recommends, and the three answers it takes. */
function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <Panel raised className="flex h-full flex-col px-4 py-3.5" style={{ borderColor: "rgba(var(--spot-rgb), 0.28)" }}>
      <div className="flex items-center justify-between">
        <StatusChip tone="accent">{rec.tag}</StatusChip>
        <span className="t-label !text-[9px]">{CEO.name}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-[12.5px] leading-[1.5] text-[var(--text-1)]">{rec.observation}</p>
      <p className="mt-2 line-clamp-2 text-[13.5px] font-medium leading-[1.4] text-[var(--text-0)]">{rec.action}</p>
      {/* a picture of the choice, not the choice: the visitor is not the owner */}
      <div className="mt-auto flex gap-1.5 pt-3" aria-hidden>
        {HUB_LABELS.decisions.map((label, i) => (
          <span
            key={label}
            className={cn(
              "whitespace-nowrap rounded-[6px] border px-2.5 py-[6px] text-[10.5px] leading-none",
              i === 0 ? "border-transparent bg-[var(--text-0)] font-medium text-[#08090b]" : "border-[var(--line-strong)] text-[var(--text-1)]",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ department door */

const DepartmentDoor = memo(function DepartmentDoor({ department: d, flash, interactive }: { department: Department; flash: boolean; interactive: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const { enter } = useDepartmentTransition();
  const hovered = useExperience((s) => s.hoveredDept === d.id);
  const href = departmentHref(d.id);

  const attend = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const s = useExperience.getState();
    s.setHoveredDept(d.id);
    s.setGazeTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    router.prefetch(href);
  };
  const release = () => {
    const s = useExperience.getState();
    if (s.hoveredDept === d.id) {
      s.setHoveredDept(null);
      s.setGazeTarget(null);
    }
  };

  return (
    <Link
      ref={ref}
      href={href}
      prefetch={false}
      tabIndex={interactive ? 0 : -1}
      onPointerEnter={attend}
      onPointerLeave={release}
      onFocus={() => {
        attend();
        // Keyboard users reach the doors while the display is still below the fold: bring it up.
        const anchor = document.getElementById("business-doors") ?? document.getElementById("business");
        const el = ref.current;
        if (anchor && el && el.getBoundingClientRect().bottom > window.innerHeight * 0.92) anchor.scrollIntoView({ block: "start" });
      }}
      onBlur={release}
      onClick={(e) => {
        // Let the browser handle new-tab / new-window clicks.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        enter(d.id, ref.current);
      }}
      className="group relative flex h-[166px] flex-col rounded-[12px] border p-3 outline-offset-2 transition-[border-color,background-color,transform] duration-300 ease-[var(--ease-out)]"
      style={{
        ["--accent-rgb" as string]: d.accentRgb,
        borderColor: hovered ? `rgba(${d.accentRgb}, 0.6)` : flash ? `rgba(${d.accentRgb}, 0.32)` : "var(--line)",
        background: hovered
          ? `linear-gradient(180deg, rgba(${d.accentRgb}, 0.085), rgba(${d.accentRgb}, 0.02))`
          : "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Dot tone={d.tile.status === "warn" ? "warn" : "accent"} pulse={d.tile.status === "warn"} />
          <span className="t-label !text-[9.5px] text-[var(--text-0)]">{d.name}</span>
        </div>
        <div className={cn("h-[34px] w-[24px] transition-opacity duration-300", hovered ? "opacity-100" : "opacity-55")} aria-hidden>
          <AgentSvg agent={d.id} accent={d.accent} mood={hovered ? "observe" : "idle"} gazeY={hovered ? 0.7 : 0} />
        </div>
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="t-num text-[19px] font-medium tracking-[-0.025em] text-[var(--text-0)]">{d.tile.metricValue}</span>
        <span className="t-num font-mono text-[10px]" style={{ color: d.tile.deltaTone === "warn" ? "var(--warn)" : "var(--ok)" }}>
          {d.tile.delta}
        </span>
      </div>
      <div className="text-[10.5px] text-[var(--text-2)]">{d.tile.metricLabel}</div>

      {/* the door is 302 wide now: the trace runs the full width */}
      <Sparkline data={d.tile.spark} width={270} height={24} dot={false} area={false} strokeWidth={1.25} color={`rgba(${d.accentRgb}, ${hovered ? 1 : 0.7})`} className="mt-2" />

      <div className="relative mt-auto h-[28px] overflow-hidden text-[10.5px] leading-[1.3]">
        <span className={cn("absolute inset-0 line-clamp-2 text-[var(--text-2)] transition-[opacity,transform] duration-300", hovered && "-translate-y-1 opacity-0")}>
          {d.tile.activity[0]}
        </span>
        <span
          className={cn("absolute inset-0 flex items-end justify-between transition-[opacity,transform] duration-300", hovered ? "opacity-100" : "translate-y-1 opacity-0")}
          style={{ color: d.accent }}
        >
          <span className="line-clamp-2 pr-2 text-[var(--text-0)]">{d.tile.hover}</span>
          <span className="t-label shrink-0 !text-[9px]" style={{ color: d.accent }}>
            Enter
          </span>
        </span>
      </div>
      <span className="sr-only">
        . {d.agentName}. {d.oneLiner}
      </span>
    </Link>
  );
});
