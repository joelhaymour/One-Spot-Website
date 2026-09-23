import Link from "next/link";
import type { ReactNode } from "react";
import { BUSINESS } from "@/content/copy";
import { CEO, DEPARTMENTS, departmentHref } from "@/content/departments";
import { ALERTS, COMPANY, DEADLINES, KEY_METRICS, RECOMMENDATIONS, REVENUE, TODAY, TODOS, TODO_RECOMMENDATIONS } from "@/content/hud";
import { AgentSvg } from "@/components/agent/AgentSvg";
import { formatNumber } from "@/components/ui/AnimatedNumber";
import { Arrow } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { Dot, StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { HUB_LABELS } from "./labels";

/**
 * Phones: the display above is atmosphere (its type is too small to read at 360 px), so both tabs
 * repeat here at native size, in the order the display tells them. "See more.": revenue, the four
 * key metrics, the seven doors. "Do less.": the calendar and deadlines, what is waiting on you, what
 * needs attention, and the three recommendations. No state: the numbers are the first frame's.
 * Hidden from md up, where the display itself is interactive.
 */
export function MobileBusiness({ heading = true }: { heading?: boolean }) {
  const pct = Math.round((REVENUE.booked / REVENUE.target) * 100);
  const open = TODOS.filter((t) => !t.done).length;
  return (
    <div className="px-[var(--gutter)] pb-24 pt-6 md:hidden">
      {heading && (
        <>
          <Eyebrow index="06">{BUSINESS.eyebrow}</Eyebrow>
          <h2 id="business-mobile" className="t-title mt-5">
            {BUSINESS.heading}
          </h2>
          <p className="t-lead mt-4">{BUSINESS.lead}</p>
        </>
      )}

      {/* ---------------------------------------------------------------- see more: the dashboard */}
      <Word className="mt-10">{BUSINESS.seeMore}</Word>

      <div className="panel mt-5 p-4">
        <div className="flex items-center justify-between">
          <span className="t-label">Revenue / {COMPANY.period}</span>
          <span className="t-label t-num">{pct}% of target</span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="t-num text-[2rem] font-medium leading-none tracking-[-0.035em] text-[var(--text-0)]">{formatNumber(REVENUE.booked, "currency")}</span>
          <span className="text-[0.8rem] text-[var(--text-2)]">of {formatNumber(REVENUE.target, "currency")}</span>
        </div>
        <p className="mt-3 flex items-start gap-2 text-[0.85rem] leading-snug text-[var(--text-1)]">
          <Dot tone="neutral" className="mt-[7px]" />
          <span>
            3 deals worth <span className="text-[var(--text-0)]">{formatNumber(REVENUE.pending, "currency")}</span> are waiting on one signature each. That is{" "}
            {Math.round(((REVENUE.booked + REVENUE.pending) / REVENUE.target) * 100)}%.
          </span>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {KEY_METRICS.map((m) => (
          <div key={m.id} className="panel p-4">
            <div className="t-label !text-[10px]">{m.label}</div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span className="t-num text-[1.35rem] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]">
                {formatNumber(m.value, m.format)}
                {m.suffix}
              </span>
              <span className="t-num font-mono text-[0.7rem]" style={{ color: m.tone === "warn" ? "var(--warn)" : "var(--ok)" }}>
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <nav aria-label={HUB_LABELS.departments} className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="t-label">{HUB_LABELS.departments}</span>
          <span className="t-label">{HUB_LABELS.workforce(DEPARTMENTS.length)}</span>
        </div>
        <ul className="flex flex-col">
          {DEPARTMENTS.map((d) => (
            <li key={d.id} className="border-t border-[var(--line)] last:border-b">
              <Link href={departmentHref(d.id)} className="group flex items-center gap-4 py-4" style={{ ["--accent-rgb" as string]: d.accentRgb }}>
                <span className="h-12 w-9 shrink-0" aria-hidden>
                  <AgentSvg agent={d.id} accent={d.accent} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1rem] font-medium tracking-[-0.015em] text-[var(--text-0)]">{d.name}</span>
                  <span className="mt-0.5 block text-[0.85rem] leading-snug text-[var(--text-2)]">{d.tile.hover}</span>
                </span>
                <span className="text-right">
                  <span className="t-num block text-[0.95rem] text-[var(--text-0)]">{d.tile.metricValue}</span>
                  <span className="t-label mt-1 block !text-[10px]">{d.tile.metricLabel}</span>
                </span>
                <Arrow className="shrink-0 text-[var(--text-2)]" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------------------------------------------------------------- do less: to do */}
      <Word className="mt-14">{BUSINESS.doLess}</Word>

      <div className="panel mt-5 p-4">
        <div className="flex items-center justify-between">
          <span className="t-label">{HUB_LABELS.calendar}</span>
          <span className="t-label t-num">{COMPANY.dayLabel}</span>
        </div>
        <div className="t-label mt-4 !text-[10px]">{HUB_LABELS.today}</div>
        <ul className="mt-1">
          {TODAY.map((e, i) => (
            <li key={e.time} className="flex items-center gap-3 border-t border-[var(--line-faint)] py-3 first:border-t-0">
              <span className="t-num w-11 font-mono text-[0.8rem] text-[var(--text-2)]">{e.time}</span>
              <span className={cn("h-5 w-[2px] rounded-full", i === 0 ? "bg-[rgb(var(--accent-rgb))]" : "bg-[var(--line-strong)]")} />
              <span className="truncate text-[0.95rem] text-[var(--text-0)]">{e.label}</span>
            </li>
          ))}
        </ul>
        <div className="t-label mt-4 !text-[10px]">{HUB_LABELS.deadlines}</div>
        <ul className="mt-1">
          {DEADLINES.map((d) => (
            <li key={d.label} className="flex items-center justify-between gap-3 border-t border-[var(--line-faint)] py-3 first:border-t-0">
              <span className="truncate text-[0.95rem] text-[var(--text-0)]">{d.label}</span>
              <StatusChip tone={d.tone === "warn" ? "warn" : "neutral"}>{d.due}</StatusChip>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel mt-3 p-4">
        <div className="flex items-center justify-between">
          <span className="t-label">{HUB_LABELS.waiting}</span>
          <span className="t-label t-num">{HUB_LABELS.approvals(open)}</span>
        </div>
        <ul className="mt-2">
          {TODOS.map((t) => (
            <li key={t.id} className="flex gap-3 border-t border-[var(--line-faint)] py-3 first:border-t-0">
              <span
                className={cn(
                  "mt-[3px] h-[15px] w-[15px] shrink-0 rounded-[4px] border",
                  t.done ? "border-[var(--ok)] bg-[color-mix(in_srgb,var(--ok)_22%,transparent)]" : "border-[var(--line-strong)]",
                )}
                aria-hidden
              />
              <span className="min-w-0">
                <span className={cn("block text-[0.95rem] leading-snug", t.done ? "text-[var(--text-3)] line-through" : "text-[var(--text-0)]")}>{t.label}</span>
                <span className="mt-0.5 block text-[0.8rem] text-[var(--text-2)]">{t.done ? HUB_LABELS.doneBy : t.by}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel mt-3 p-4">
        <span className="t-label">{HUB_LABELS.attention}</span>
        <ul className="mt-2">
          {ALERTS.map((a) => (
            <li key={a.id} className="flex items-start gap-3 border-t border-[var(--line-faint)] py-3 first:border-t-0">
              <Dot tone={a.tone} className="mt-[8px]" pulse={a.tone === "warn"} />
              <span className="min-w-0">
                <span className="block text-[0.95rem] leading-snug text-[var(--text-0)]">{a.label}</span>
                <span className="mt-0.5 block text-[0.8rem] text-[var(--text-2)]">{a.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="t-label">{HUB_LABELS.recommendations}</span>
        <span className="flex items-center gap-2">
          <span className="spot spot-breathe" />
          <span className="t-label text-[var(--text-0)]">{CEO.name}</span>
        </span>
      </div>
      <ul className="mt-2 flex flex-col gap-3">
        {TODO_RECOMMENDATIONS.map((id) => {
          const rec = RECOMMENDATIONS.find((r) => r.id === id);
          return rec ? (
            <li key={id} className="panel-raised p-4">
              <StatusChip tone="accent">{rec.tag}</StatusChip>
              <p className="t-body mt-3">{rec.observation}</p>
              <p className="mt-2 text-[0.95rem] font-medium leading-snug text-[var(--text-0)]">{rec.action}</p>
              {/* a picture of the choice, not the choice: the visitor is not the owner */}
              <div className="mt-4 flex gap-2" aria-hidden>
                {HUB_LABELS.decisions.map((label, i) => (
                  <span
                    key={label}
                    className={cn(
                      "whitespace-nowrap rounded-[7px] border px-3 py-[7px] text-[0.8rem] leading-none",
                      i === 0 ? "border-transparent bg-[var(--text-0)] font-medium text-[#08090b]" : "border-[var(--line-strong)] text-[var(--text-1)]",
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}

/** One of the two words, as a line: the display says it above, the page says it here. */
function Word({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-4 text-[1.5rem] font-medium leading-none tracking-[-0.035em] text-[var(--text-0)]", className)}>
      {children}
      <span className="h-px flex-1 bg-[var(--line-strong)]" aria-hidden />
    </p>
  );
}
