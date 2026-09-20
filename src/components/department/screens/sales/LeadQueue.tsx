"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader, ScanLine, StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { ACCENT, BAR_GREY, ColumnLabel, Fade, HBar, Swap, Tag, useDelayed, wait } from "./kit";
import { HOT_SCORE, LEADS, PIPELINE, RANK, SOURCE_RATES, WEIGHTS, type Lead } from "./data";

const ROW_H = 36;
const COLS = "grid grid-cols-[minmax(0,1fr)_74px_56px_142px] items-center gap-x-3";

interface LeadQueueProps {
  /** The leads have arrived (the workstation is live). */
  live: boolean;
  scored: boolean;
  learned: boolean;
  active: boolean;
  scanning: boolean;
}

/** Region A. One queue for every source; scored, sorted, then re-weighted by what actually closes. */
export function LeadQueue({ live, scored, learned, active, scanning }: LeadQueueProps) {
  // One thing at a time: scores count in, then the queue sorts. Later the evidence appears,
  // then the scores shift, then the queue sorts again.
  const sorted = useDelayed(scored, 1150);
  const reweighted = useDelayed(learned, 1300);
  const resorted = useDelayed(learned, 2500);

  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="Lead queue"
        right={
          <>
            <Fade as="span" on={scored} y={0} delayMs={900} className="inline-flex">
              <Swap
                flipped={resorted}
                align="end"
                first={<StatusChip tone="neutral">3 above 80</StatusChip>}
                second={<StatusChip tone="neutral">Weights updated</StatusChip>}
              />
            </Fade>
            <span className="t-label">
              <AnimatedNumber value={live ? LEADS.length : 0} duration={1.1} className="text-[var(--text-0)]" /> new since 08:00
            </span>
          </>
        }
      />

      <div className="flex gap-3.5 px-3.5">
        {/* the queue */}
        <div className="w-[520px] shrink-0">
          <div className={cn(COLS, "h-[22px] border-b border-[var(--line-faint)] pl-[26px]")}>
            <ColumnLabel>Lead</ColumnLabel>
            <ColumnLabel>Source</ColumnLabel>
            <ColumnLabel>Received</ColumnLabel>
            <ColumnLabel>Score</ColumnLabel>
          </div>
          <div className="relative" style={{ height: ROW_H * LEADS.length }}>
            {/* positions stay put while the leads move through them */}
            <ol aria-hidden className="absolute inset-y-0 left-0 w-[26px]">
              {LEADS.map((lead, i) => (
                <li key={lead.id} className="t-num flex items-center font-mono text-[10px] text-[var(--text-3)]" style={{ height: ROW_H }}>
                  {String(i + 1).padStart(2, "0")}
                </li>
              ))}
            </ol>
            <ul>
              {LEADS.map((lead, i) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  index={i}
                  position={resorted ? RANK.learned[lead.id] : sorted ? RANK.scored[lead.id] : i}
                  live={live}
                  scored={scored}
                  reweighted={reweighted}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="w-px self-stretch bg-[var(--line-faint)]" />

        {/* pipeline at rest; the evidence once the agent has learned */}
        <div className="relative min-w-0 flex-1">
          <Fade on={!learned} y={0} className="absolute inset-0">
            <Pipeline live={live} />
          </Fade>
          <Fade on={learned} delayMs={260} className="absolute inset-0">
            <WhatCloses on={learned} />
          </Fade>
        </div>
      </div>

      <ScanLine active={scanning} />
    </Panel>
  );
}

interface LeadRowProps {
  lead: Lead;
  index: number;
  position: number;
  live: boolean;
  scored: boolean;
  reweighted: boolean;
}

function LeadRow({ lead, index, position, live, scored, reweighted }: LeadRowProps) {
  const score = reweighted ? lead.reweighted : lead.score;
  const hot = scored && score > HOT_SCORE;
  return (
    <li
      className="absolute inset-x-0 top-0 pl-[26px] transition-transform duration-[850ms] ease-[var(--ease-out)]"
      style={{ height: ROW_H, transform: `translate3d(0, ${position * ROW_H}px, 0)`, transitionDelay: wait(position * 35) }}
    >
      {/* lit: this lead is above 80 */}
      <span
        aria-hidden
        className="absolute inset-y-[3px] left-[20px] right-0 rounded-[6px] bg-white/[0.04] transition-opacity duration-500 ease-[var(--ease-out)]"
        style={{ opacity: hot ? 1 : 0, transitionDelay: hot ? wait(700) : "0ms" }}
      />
      {/* oldest first: the queue fills in the order the enquiries came in */}
      <div
        className={cn(COLS, "relative h-full border-b border-[var(--line-faint)] transition-[opacity,transform] duration-[600ms] ease-[var(--ease-out)]")}
        style={{
          opacity: live ? 1 : 0.3,
          transform: live ? "none" : "translate3d(-6px, 0, 0)",
          transitionDelay: live ? wait((LEADS.length - 1 - index) * 90) : "0ms",
        }}
      >
        <span className="min-w-0 pl-1.5">
          <span className="block truncate text-[12px] text-[var(--text-0)]">{lead.name}</span>
          <span className="block truncate text-[10.5px] text-[var(--text-2)]">
            {lead.company} · {lead.kind}
          </span>
        </span>
        <span>
          <Tag>{lead.source}</Tag>
        </span>
        <span className="t-num font-mono text-[10.5px] text-[var(--text-2)]">{lead.ago}</span>
        <span className="flex items-center gap-2.5 pr-1.5">
          <HBar value={score / 100} on={scored} delayMs={index * 45} color={hot ? ACCENT : BAR_GREY} className="flex-1" />
          <span
            className="w-[22px] text-right font-mono text-[11px] transition-[opacity,color] duration-500"
            style={{ opacity: scored ? 1 : 0, color: hot ? "var(--text-0)" : "var(--text-2)" }}
            aria-hidden={scored ? undefined : true}
          >
            <AnimatedNumber value={scored ? score : 0} duration={0.9} />
          </span>
        </span>
      </div>
    </li>
  );
}

function Pipeline({ live }: { live: boolean }) {
  const max = Math.max(...PIPELINE.map((s) => s.amount));
  return (
    <div className="pt-[5px]">
      <ColumnLabel>Pipeline by stage</ColumnLabel>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="t-num text-[24px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]">$4.82M</span>
        <span className="t-num font-mono text-[10px] text-[var(--ok)]">+12%</span>
      </div>
      <div className="mt-1.5 text-[10.5px] text-[var(--text-2)]">48 open deals · 2 at risk</div>
      <ul className="mt-3.5">
        {PIPELINE.map((s, i) => (
          <li key={s.stage} className="border-t border-[var(--line-faint)] py-[9px]">
            <div className="flex items-baseline justify-between">
              <span className="text-[11.5px] text-[var(--text-1)]">{s.stage}</span>
              <span className="t-num font-mono text-[10.5px] text-[var(--text-2)]">
                {s.deals} · <span className="text-[var(--text-0)]">${s.amount.toFixed(2)}M</span>
              </span>
            </div>
            <HBar value={s.amount / max} on={live} delayMs={300 + i * 70} className="mt-[7px]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhatCloses({ on }: { on: boolean }) {
  const best = SOURCE_RATES[0].rate;
  return (
    <div className="pt-[5px]">
      <ColumnLabel>Win rate by source</ColumnLabel>
      <div className="mt-2 text-[10.5px] text-[var(--text-2)]">From 214 closed deals</div>
      <ul className="mt-2.5">
        {SOURCE_RATES.map((s, i) => (
          <li key={s.source} className="py-[5px]">
            <div className="flex items-baseline justify-between">
              <span className={cn("text-[11.5px]", i === 0 ? "text-[var(--text-0)]" : "text-[var(--text-1)]")}>{s.source}</span>
              <span className="t-num font-mono text-[10.5px] text-[var(--text-2)]">{s.rate}%</span>
            </div>
            {/* the winner is brighter, not coloured: the accent in this panel belongs to the three hot leads */}
            <HBar value={s.rate / best} on={on} delayMs={450 + i * 80} color={i === 0 ? "rgba(255, 255, 255, 0.7)" : BAR_GREY} className="mt-[5px]" />
          </li>
        ))}
      </ul>
      <Fade on={on} delayMs={950} y={4} className="mt-1.5 text-[11.5px] text-[var(--text-0)]">
        Referrals close at 2.4x paid.
      </Fade>

      <div className="mt-3 border-t border-[var(--line-faint)] pt-3">
        <ColumnLabel>Score weights</ColumnLabel>
        <ul className="mt-2">
          {WEIGHTS.map((w) => (
            <li key={w.label} className="flex items-baseline justify-between py-[4px]">
              <span className="text-[11.5px] text-[var(--text-1)]">{w.label}</span>
              <span className="t-num font-mono text-[10.5px] text-[var(--text-2)]">
                {w.from.toFixed(1)} <span className="text-[var(--text-3)]">to</span>{" "}
                <WeightValue on={on} from={w.from} to={w.to} />
              </span>
            </li>
          ))}
          <li className="flex items-baseline justify-between py-[4px]">
            <span className="text-[11.5px] text-[var(--text-1)]">Reply under 5 min</span>
            <span className="t-num font-mono text-[10.5px] text-[var(--text-0)]">2x responses</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/** The weight moves after the evidence has been drawn, not with it. */
function WeightValue({ on, from, to }: { on: boolean; from: number; to: number }) {
  const shifted = useDelayed(on, 1300);
  return <AnimatedNumber value={shifted ? to : from} format="decimal1" duration={1} className="text-[var(--text-0)]" />;
}
