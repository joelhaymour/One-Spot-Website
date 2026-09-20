"use client";

import { memo, type ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { Spark } from "./chart";
import { CAMPAIGNS, CHANNELS, CPL_BLENDED, SPRING_WON_LEADS, SPRING_WON_TREND, TOTALS, WON_CHANNEL_LEADS, type Campaign } from "./data";
import { ConsolePanel, LABEL, Lamp, Layers, Meter, MONO, useLate } from "./kit";
import { TestLayer, TrendLayer } from "./PerformanceCharts";

/*
 * Region A, "Campaign performance". Left: the account as a table (5 campaigns, 6 channels).
 * Right: the one figure the owner cares about, and the chart that explains it. The chart is the
 * 28-day trend until the test starts, then the four variations racing.
 */

const SPRING_ID = "spring";
const WON_GAIN = SPRING_WON_LEADS - CAMPAIGNS[0].leads[1];
const NUM = "text-right text-[10.5px]";
const COLS = "grid-cols-[minmax(0,1fr)_50px_38px_62px_40px_56px]";

interface PerformanceProps {
  /** The hourly sync has landed (the workstation is live). */
  arrived: boolean;
  slipping: boolean;
  testing: boolean;
  won: boolean;
  reported: boolean;
  active: boolean;
  scan: boolean;
}

export const PerformancePanel = memo(function PerformancePanel({ arrived, slipping, testing, won, reported, active, scan }: PerformanceProps) {
  // The table takes the result only once the test beside it has run to day 7: one thing moves at a time.
  const settled = useLate(won ? 1 : 0, 1900) === 1;
  const snap = arrived ? 1 : 0;
  const spend = TOTALS[snap].spend;
  const leads = TOTALS[snap].leads + (settled ? WON_GAIN : 0);
  const blended = spend / leads;
  const status = reported ? 5 : won ? 4 : testing ? 3 : slipping ? 2 : arrived ? 1 : 0;
  const attention = slipping && !settled ? 1 : 0;

  return (
    <ConsolePanel
      label="Campaign performance"
      active={active}
      scan={scan}
      right={
        <Layers show={status} align="end" delay={reported ? 900 : 0}>
          <HeaderNote>Last sync 1 h ago</HeaderNote>
          <HeaderNote lamp="var(--ok)">6 channels synced</HeaderNote>
          <HeaderNote lamp="var(--warn)">1 campaign flagged</HeaderNote>
          <HeaderNote>Testing 4 variations</HeaderNote>
          <HeaderNote lamp="var(--ok)">Variation C kept</HeaderNote>
          <StatusChip tone="ok">Report sent to CEO Agent</StatusChip>
        </Layers>
      }
    >
      <div className="grid h-full grid-cols-[minmax(0,1fr)_296px] gap-x-5">
        <div className="flex min-w-0 flex-col">
          <div className="grid grid-cols-3 gap-x-4">
            <Kpi label="Spend, 28 days" note="5 campaigns">
              <AnimatedNumber value={spend} format="currency" />
            </Kpi>
            <Kpi label="Leads" note="6 channels">
              <AnimatedNumber value={leads} />
            </Kpi>
            <Kpi
              label="Needs attention"
              warn={attention === 1}
              note={
                <Layers show={attention}>
                  <span>All campaigns on target</span>
                  <span className="text-[var(--warn)]">Spring Promotion</span>
                </Layers>
              }
            >
              <AnimatedNumber value={attention} duration={0.4} />
            </Kpi>
          </div>

          <div className="mt-3.5" role="table" aria-label="Campaigns, last 28 days">
            <div role="row" className={cn("grid h-[18px] items-start gap-x-2.5", COLS, LABEL)}>
              <span role="columnheader">Campaign</span>
              <span role="columnheader" className="text-right">
                Spend
              </span>
              <span role="columnheader" className="text-right">
                Leads
              </span>
              <span role="columnheader" className="text-right">
                Cost/lead
              </span>
              <span role="columnheader" className="text-right">
                14 d
              </span>
              <span role="columnheader" className="text-right">
                Trend
              </span>
            </div>
            {CAMPAIGNS.map((c) => (
              <CampaignRow
                key={c.id}
                campaign={c}
                snap={snap}
                // 0 resting, 1 flagged, 2 under test, 3 replaced by the winner. Only Spring Promotion ever leaves 0.
                phase={c.id !== SPRING_ID ? 0 : settled ? 3 : testing ? 2 : slipping ? 1 : 0}
              />
            ))}
          </div>

          <div className="mt-3.5">
            <div className="flex h-3 items-center justify-between">
              <span className={LABEL}>Leads by channel</span>
              <span className={LABEL}>Share of total</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-2.5" role="list">
              {CHANNELS.map((ch, i) => {
                const value = ch.leads[snap] + (settled ? WON_CHANNEL_LEADS[i] : 0);
                return (
                  <div key={ch.name} role="listitem">
                    <div className="flex h-[14px] items-baseline justify-between">
                      <span className="truncate text-[10.5px] text-[var(--text-1)]">{ch.name}</span>
                      <AnimatedNumber value={value} className="text-[10.5px] text-[var(--text-0)]" />
                    </div>
                    <Meter value={value / leads} className="mt-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex h-3 items-center justify-between">
            <span className={LABEL}>Cost per lead, blended</span>
            <span className={LABEL}>All campaigns</span>
          </div>
          <div className="mt-2 flex h-[30px] items-baseline gap-2.5">
            <AnimatedNumber value={blended} format="decimal2" prefix="$" className="text-[30px] font-medium leading-none tracking-[-0.02em] text-[var(--text-0)]" />
            <AnimatedNumber
              value={Math.round((1 - blended / CPL_BLENDED[0]) * 100)}
              prefix="−"
              suffix="% on the month"
              className="text-[11px] text-[var(--ok)]"
            />
          </div>
          <div className="mt-3.5 min-h-0 flex-1">
            <Layers show={testing ? 1 : 0} fill>
              <TrendLayer arrived={arrived} slipping={slipping} />
              <TestLayer testing={testing} won={won} />
            </Layers>
          </div>
        </div>
      </div>
    </ConsolePanel>
  );
});

function HeaderNote({ lamp, children }: { lamp?: string; children: ReactNode }) {
  return (
    <span className={cn(LABEL, "flex h-[18px] items-center gap-1.5 whitespace-nowrap")}>
      {lamp ? <Lamp color={lamp} /> : null}
      {children}
    </span>
  );
}

function Kpi({ label, note, warn, children }: { label: string; note: ReactNode; warn?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className={LABEL}>{label}</div>
      <div
        className="mt-[7px] text-[20px] font-medium leading-none tracking-[-0.01em] transition-colors duration-500 ease-[var(--ease-out)]"
        style={{ color: warn ? "var(--warn)" : "var(--text-0)" }}
      >
        {children}
      </div>
      <div className="mt-[5px] flex h-3 items-center whitespace-nowrap text-[10px] leading-none text-[var(--text-2)]">{note}</div>
    </div>
  );
}

const SPRING_STATUS = ["Flagged", "Testing A to D", "Variation C live"];

const CampaignRow = memo(function CampaignRow({ campaign: c, snap, phase }: { campaign: Campaign; snap: 0 | 1; phase: 0 | 1 | 2 | 3 }) {
  const flagged = phase === 1 || phase === 2;
  const replaced = phase === 3;
  const leads = replaced ? SPRING_WON_LEADS : c.leads[snap];
  const tone = replaced ? "var(--ok)" : flagged ? "var(--warn)" : undefined;
  const shift = "transition-colors duration-500 ease-[var(--ease-out)]";

  return (
    <div role="row" className={cn("relative isolate grid h-8 items-center gap-x-2.5 border-t border-[var(--line-faint)]", COLS)}>
      <span
        aria-hidden
        className="absolute -inset-x-2 inset-y-px -z-10 rounded-md bg-[var(--warn)] transition-opacity duration-500 ease-[var(--ease-out)]"
        style={{ opacity: phase === 1 ? 0.08 : 0 }}
      />
      <div role="cell" className="flex min-w-0 items-center gap-2">
        <Lamp color={tone ?? (c.status === "Live" ? "var(--ok)" : "var(--text-3)")} />
        <div className="min-w-0">
          <div className="truncate text-[11px] leading-[14px] text-[var(--text-0)]">{c.name}</div>
          {c.id === SPRING_ID ? (
            <Layers show={phase} className="mt-[3px]">
              <span className={cn(MONO, "whitespace-nowrap text-[var(--text-2)]")}>{c.status}</span>
              {SPRING_STATUS.map((text, i) => (
                <span key={text} className={cn(MONO, "whitespace-nowrap", i === 1 ? "text-[var(--text-1)]" : i === 0 ? "text-[var(--warn)]" : "text-[var(--ok)]")}>
                  {text}
                </span>
              ))}
            </Layers>
          ) : (
            <div className={cn(MONO, "mt-[3px] text-[var(--text-2)]")}>{c.status}</div>
          )}
        </div>
      </div>
      <span role="cell" className={cn(NUM, "text-[var(--text-1)]")}>
        <AnimatedNumber value={c.spend[snap]} format="currency" />
      </span>
      <span role="cell" className={cn(NUM, "text-[var(--text-1)]")}>
        <AnimatedNumber value={leads} />
      </span>
      <span role="cell" className={cn(NUM, shift)} style={{ color: tone ?? "var(--text-0)" }}>
        <AnimatedNumber value={c.spend[snap] / leads} format="decimal2" prefix="$" />
      </span>
      <span role="cell" className={cn(NUM, "t-num")}>
        {c.id === SPRING_ID ? (
          <Layers show={replaced ? 1 : 0} align="end">
            <span className={shift} style={{ color: flagged ? "var(--warn)" : "var(--text-1)" }}>
              {c.delta}
            </span>
            <AnimatedNumber value={replaced ? 41 : 0} prefix="−" suffix="%" className="text-[var(--ok)]" />
          </Layers>
        ) : (
          <span className="text-[var(--text-1)]">{c.delta}</span>
        )}
      </span>
      <span role="cell" className="flex justify-end">
        {c.id === SPRING_ID ? (
          <Layers show={replaced ? 1 : 0} align="end">
            <Spark data={c.trend} color={flagged ? "var(--warn)" : undefined} />
            <Spark data={SPRING_WON_TREND} color="var(--ok)" />
          </Layers>
        ) : (
          <Spark data={c.trend} />
        )}
      </span>
    </div>
  );
});
