"use client";

import { memo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CEO, DEPARTMENTS, departmentHref, type Department } from "@/content/departments";
import { ALERTS, COMPANY, DEADLINES, KEY_METRICS, RECOMMENDATIONS, REVENUE, TODAY, TODOS } from "@/content/hud";
import { AgentSvg, Mark } from "@/components/agent/AgentSvg";
import { AnimatedNumber, formatNumber } from "@/components/ui/AnimatedNumber";
import { ArcProgress, Sparkline } from "@/components/ui/Charts";
import { Dot, Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { useDepartmentTransition } from "@/components/motion/Transition";
import { useExperience } from "@/state/experience";
import { cn } from "@/lib/cn";
import { HUB_LABELS } from "./labels";
import type { HudState } from "./useHudScript";

/**
 * One Spot Hub — the owner's command center, authored at 1280 x 760 virtual px (see VirtualDisplay).
 * A clear view of what is happening, what needs attention and what needs a decision. Not a control panel.
 *
 *   bar ──────────────────────────────────────────────────────────────────────
 *   waiting on you │ revenue vs target                  │ needs a decision (CEO Agent)
 *   today          │ four key metrics                   │ needs attention
 *   deadlines      │ seven department doors (+ 1 dock)  │ happening now
 *
 * Everything the visitor can act on is a real link; everything that moves is scripted and budgeted.
 * Calm by rule: only warn-tone dots pulse, and the CEO Agent's spot breathes. Nothing else loops.
 */

export const HUD_SIZE = { width: 1280, height: 760 } as const;

interface BusinessHudProps {
  state: HudState;
  onPickRecommendation: (index: number) => void;
  /** False while the display is only atmosphere (phones): doors leave the tab order. */
  interactive?: boolean;
}

export function BusinessHud({ state, onPickRecommendation, interactive = true }: BusinessHudProps) {
  const pct = state.revenue / REVENUE.target;
  return (
    <div className="absolute inset-0 select-none text-[12px] leading-[1.35] text-[var(--text-1)]">
      {/* bar */}
      <div className="absolute inset-x-0 top-0 flex h-[48px] items-center justify-between border-b border-[var(--line)] px-5">
        <div className="flex items-center gap-3">
          <Mark size={16} className="text-[var(--text-0)]" />
          <span className="t-label text-[var(--text-0)]">{HUB_LABELS.name}</span>
          <span className="h-3 w-px bg-[var(--line-strong)]" />
          <span className="text-[12px] text-[var(--text-1)]">{COMPANY.name}</span>
        </div>
        <div className="t-label flex items-center gap-4">
          <span>{COMPANY.period}</span>
          <span className="text-[var(--text-3)]">/</span>
          <span>{COMPANY.dayLabel}</span>
          <span className="text-[var(--text-3)]">/</span>
          <span>{COMPANY.workingDaysLeft} working days left</span>
        </div>
        <div className="flex items-center gap-4">
          <StatusChip tone="neutral">{HUB_LABELS.workforce(DEPARTMENTS.length)}</StatusChip>
          <span className="flex items-center gap-2">
            <span className="spot spot-breathe" />
            <span className="t-label text-[var(--text-0)]">{CEO.name} observing</span>
          </span>
        </div>
      </div>

      {/* left rail */}
      <Panel className="absolute left-5 top-[62px] h-[290px] w-[270px]">
        <PanelHeader label={HUB_LABELS.waiting} right={<span className="t-label t-num">{HUB_LABELS.approvals(TODOS.length - state.done.length)}</span>} />
        <ul className="px-3.5">
          {TODOS.map((t) => {
            const done = state.done.includes(t.id);
            return (
              <li key={t.id} className="flex gap-2.5 border-t border-[var(--line-faint)] py-[9px] first:border-t-0">
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
                  <span className={cn("block truncate text-[12px] transition-colors duration-500", done ? "text-[var(--text-3)] line-through" : "text-[var(--text-0)]")}>
                    {t.label}
                  </span>
                  <span className="block truncate text-[10.5px] text-[var(--text-2)]">{done ? "Done. Filed by the agent" : t.by}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel className="absolute left-5 top-[366px] h-[170px] w-[270px]">
        <PanelHeader label="Today" right={<span className="t-label">{COMPANY.dayLabel}</span>} />
        <ul className="px-3.5">
          {TODAY.map((e, i) => (
            <li key={e.time} className="flex items-center gap-3 border-t border-[var(--line-faint)] py-[10px] first:border-t-0">
              <span className="t-num w-10 font-mono text-[11px] text-[var(--text-2)]">{e.time}</span>
              <span className={cn("h-5 w-[2px] rounded-full", i === 0 ? "bg-[rgb(var(--accent-rgb))]" : "bg-[var(--line-strong)]")} />
              <span className="truncate text-[12px] text-[var(--text-0)]">{e.label}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="absolute left-5 top-[550px] h-[190px] w-[270px]">
        <PanelHeader label="Deadlines" />
        <ul className="px-3.5">
          {DEADLINES.map((d) => (
            <li key={d.label} className="flex items-center justify-between border-t border-[var(--line-faint)] py-[11px] first:border-t-0">
              <span className="text-[12px] text-[var(--text-0)]">{d.label}</span>
              <StatusChip tone={d.tone === "warn" ? "warn" : "neutral"}>{d.due}</StatusChip>
            </li>
          ))}
        </ul>
      </Panel>

      {/* centre: revenue */}
      <Panel className="absolute left-[304px] top-[62px] h-[196px] w-[640px]">
        <PanelHeader
          label={`Revenue / ${COMPANY.period}`}
          right={
            <span
              className="t-label text-[var(--ok)] transition-opacity duration-700"
              style={{ opacity: state.revenueNote ? 1 : 0 }}
              aria-hidden
            >
              + {state.revenueNote ?? "Payment received"}
            </span>
          }
        />
        <div className="flex items-end justify-between px-3.5 pt-1">
          <div>
            <div className="flex items-baseline gap-2.5">
              <AnimatedNumber value={state.revenue} format="currency" className="text-[40px] font-medium leading-none tracking-[-0.035em] text-[var(--text-0)]" />
              <span className="text-[12px] text-[var(--text-2)]">of {formatNumber(REVENUE.target, "currency")} target</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11.5px]">
              <Dot tone="neutral" />
              <span>
                3 deals worth <span className="text-[var(--text-0)]">{formatNumber(REVENUE.pending, "currency")}</span> are waiting on one signature each. That is{" "}
                {Math.round(((state.revenue + REVENUE.pending) / REVENUE.target) * 100)}%.
              </span>
            </div>
            <Sparkline data={REVENUE.spark} width={410} height={56} className="mt-3" strokeWidth={1.6} />
          </div>
          <ArcProgress value={pct} size={132} stroke={6} className="mb-3 mr-2">
            <div className="text-center">
              <AnimatedNumber value={pct * 100} format="int" suffix="%" className="text-[26px] font-medium tracking-[-0.03em] text-[var(--text-0)]" />
              <div className="t-label mt-1 !text-[9px]">of target</div>
            </div>
          </ArcProgress>
        </div>
      </Panel>

      {/* centre: key metrics */}
      <div className="absolute left-[304px] top-[272px] flex h-[84px] w-[640px] gap-[10px]">
        {KEY_METRICS.map((m) => (
          <Panel key={m.id} className="flex-1 px-3.5 py-3">
            <div className="t-label !text-[9.5px]">{m.label}</div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <AnimatedNumber value={state.metrics[m.id] ?? m.value} format={m.format} suffix={m.suffix} className="text-[19px] font-medium tracking-[-0.025em] text-[var(--text-0)]" />
              <span className="t-num font-mono text-[10px]" style={{ color: m.tone === "warn" ? "var(--warn)" : "var(--ok)" }}>
                {m.delta}
              </span>
            </div>
          </Panel>
        ))}
      </div>

      {/* centre: the doors */}
      <nav aria-label="Departments" className="absolute left-[304px] top-[370px] h-[370px] w-[640px]">
        <div className="mb-[10px] flex h-[18px] items-center justify-between">
          <span className="t-label">Departments</span>
          <span className="t-label text-[var(--text-1)]">Select one to step inside</span>
        </div>
        <ul className="grid grid-cols-4 gap-[10px]">
          {DEPARTMENTS.map((d) => (
            <li key={d.id}>
              <DepartmentDoor department={d} flash={state.lastDept === d.id} interactive={interactive} />
            </li>
          ))}
          <li>
            <div className="flex h-[166px] flex-col justify-between rounded-[12px] border border-dashed border-[var(--line-strong)] p-3">
              <span className="t-label">Open dock</span>
              <div>
                <div className="text-[12px] text-[var(--text-0)]">Reconciliation Agent</div>
                <div className="mt-1 text-[10.5px] text-[var(--text-2)]">Recommended by the CEO Agent. Not built yet.</div>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      {/* right rail: the three questions, top to bottom. Needs a decision / needs attention / happening now */}
      <RecommendationPanel index={state.recommendation} onPick={onPickRecommendation} interactive={interactive} />

      <Panel className="absolute left-[958px] top-[392px] h-[150px] w-[302px]">
        <PanelHeader label={HUB_LABELS.attention} />
        <ul className="px-3.5">
          {ALERTS.map((a) => (
            <li key={a.id} className="flex items-start gap-2.5 border-t border-[var(--line-faint)] py-[7px] first:border-t-0">
              <Dot tone={a.tone} className="mt-[6px]" pulse={a.tone === "warn"} />
              <span className="min-w-0">
                <span className="block truncate text-[11.5px] text-[var(--text-0)]">{a.label}</span>
                <span className="block truncate text-[10.5px] text-[var(--text-2)]">{a.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="absolute left-[958px] top-[556px] h-[184px] w-[302px] overflow-hidden">
        <PanelHeader label={HUB_LABELS.happening} />
        <ul className="px-3.5" aria-live="off">
          {state.activity.map((a, i) => (
            <li
              key={a.key}
              className="rise-in flex items-start gap-2.5 border-t border-[var(--line-faint)] py-[7px] first:border-t-0"
              style={{ opacity: 1 - i * 0.2 }}
            >
              <span className="mt-[6px] h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: DEPARTMENTS.find((d) => d.id === a.dept)?.accent }} />
              <span className="min-w-0">
                <span className="t-label block !text-[9px]">{a.agent}</span>
                <span className="mt-1 block truncate text-[11.5px] text-[var(--text-0)]">{a.line}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ recommendation */

function RecommendationPanel({ index, onPick, interactive }: { index: number; onPick: (i: number) => void; interactive: boolean }) {
  const rec = RECOMMENDATIONS[index];
  return (
    <Panel raised className="absolute left-[958px] top-[62px] h-[316px] w-[302px]" style={{ borderColor: "rgba(var(--spot-rgb), 0.28)" }}>
      <PanelHeader
        label={HUB_LABELS.decision}
        right={
          <span className="t-label t-num">
            {String(index + 1).padStart(2, "0")} / {String(RECOMMENDATIONS.length).padStart(2, "0")}
          </span>
        }
      />
      <div className="flex h-[calc(100%-36px)] flex-col px-3.5 pb-3.5">
        {/* who is asking, and about what */}
        <div className="flex items-center justify-between">
          <StatusChip tone="accent">{rec.tag}</StatusChip>
          <span className="t-label !text-[9px]">{CEO.name}</span>
        </div>
        {/* keyed so each new recommendation is written fresh */}
        <p key={rec.id} className="mt-3 text-[12.5px] leading-[1.5] text-[var(--text-1)]">
          <TypedText text={rec.observation} speed={70} caret={false} />
        </p>
        <p key={`${rec.id}-a`} className="rise-in mt-2.5 text-[13px] font-medium leading-[1.45] text-[var(--text-0)]" style={{ animationDelay: "1.6s" }}>
          {rec.action}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-1.5">
            {["Approve", "Review", "Not now"].map((label, i) => (
              <span
                key={label}
                className={cn(
                  "whitespace-nowrap rounded-[6px] border px-2 py-[5px] text-[10.5px]",
                  i === 0 ? "border-transparent bg-[var(--text-0)] font-medium text-[#08090b]" : "border-[var(--line-strong)] text-[var(--text-1)]",
                )}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-[5px]" role="group" aria-label="Recommendations">
            {RECOMMENDATIONS.map((r, i) => (
              <button
                key={r.id}
                type="button"
                tabIndex={interactive ? 0 : -1}
                aria-label={`Recommendation ${i + 1}: ${r.tag}`}
                aria-pressed={i === index}
                onClick={() => onPick(i)}
                className="grid h-4 w-2.5 place-items-center"
              >
                <span className={cn("h-[5px] w-[5px] rounded-full transition-colors duration-300", i === index ? "bg-[var(--text-0)]" : "bg-[var(--line-strong)] hover:bg-[var(--text-2)]")} />
              </button>
            ))}
          </div>
        </div>
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

      <Sparkline data={d.tile.spark} width={128} height={24} dot={false} area={false} strokeWidth={1.25} color={`rgba(${d.accentRgb}, ${hovered ? 1 : 0.7})`} className="mt-2" />

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
