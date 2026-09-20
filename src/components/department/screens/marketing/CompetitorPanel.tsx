"use client";

import { memo } from "react";
import { cn } from "@/lib/cn";
import { COMPETITORS, type Competitor } from "./data";
import { ACCENT, ConsolePanel, LABEL, Lamp, Layers, MONO } from "./kit";

/*
 * Region C, "Competitor watch". Five local competitors and the offer each one leads with.
 * When the agent checks them, three offers turn out to have changed and one competitor is buying
 * ads against the company's own name. Rows flip one at a time, top to bottom, as the agent reads down.
 */

const FLIP_FROM = 700;
const FLIP_EVERY = 380;
const CHANGED = COMPETITORS.filter((c) => c.change);
const OFFERS_CHANGED = CHANGED.filter((c) => c.change?.kind === "offer").length;
const BIDDING = CHANGED.length - OFFERS_CHANGED;

interface CompetitorProps {
  checked: boolean;
  active: boolean;
  scan: boolean;
}

export const CompetitorPanel = memo(function CompetitorPanel({ checked, active, scan }: CompetitorProps) {
  return (
    <ConsolePanel
      label="Competitor watch"
      active={active}
      scan={scan}
      right={
        <Layers show={checked ? 1 : 0} align="end" delay={checked ? FLIP_FROM + CHANGED.length * FLIP_EVERY : 0}>
          <span className={cn(LABEL, "whitespace-nowrap")}>{COMPETITORS.length} tracked, checked daily</span>
          <span className={cn(MONO, "whitespace-nowrap text-[var(--text-0)]")}>
            {OFFERS_CHANGED} offers changed · {BIDDING} bidding
          </span>
        </Layers>
      }
    >
      <div className={cn(LABEL, "flex h-4 items-start justify-between")}>
        <span>Competitor and lead offer</span>
        <span>Last change</span>
      </div>
      <div role="list">
        {COMPETITORS.map((c) => (
          <CompetitorRow key={c.name} competitor={c} checked={checked} delay={FLIP_FROM + Math.max(0, CHANGED.indexOf(c)) * FLIP_EVERY} />
        ))}
      </div>
    </ConsolePanel>
  );
});

const CompetitorRow = memo(function CompetitorRow({ competitor: c, checked, delay }: { competitor: Competitor; checked: boolean; delay: number }) {
  const change = c.change;
  const show = checked && change ? 1 : 0;
  const bidding = change?.kind === "bidding";
  const tone = bidding ? ACCENT : "var(--warn)";

  return (
    <div role="listitem" className="grid h-[37px] grid-cols-[5px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-t border-[var(--line-faint)]">
      <Lamp color={show ? tone : "var(--text-3)"} delay={show ? delay : 0} />
      <div className="min-w-0">
        <div className="truncate text-[11.5px] leading-[14px] text-[var(--text-0)]">{c.name}</div>
        <Layers show={show} delay={delay} className="mt-[2px] max-w-full">
          <span className="block truncate text-[10.5px] leading-[13px] text-[var(--text-1)]">{c.offer}</span>
          <span className="block truncate text-[10.5px] leading-[13px] text-[var(--text-0)]">{change ? (change.kind === "offer" ? `Now: ${change.to}` : change.detail) : c.offer}</span>
        </Layers>
      </div>
      <Layers show={show} delay={delay} align="end">
        <span className="flex flex-col items-end">
          <span className={cn(MONO, "whitespace-nowrap text-[var(--text-2)]")}>No change</span>
          <span className={cn(MONO, "mt-1 whitespace-nowrap text-[var(--text-2)]")}>{c.quietFor}</span>
        </span>
        <span className="flex flex-col items-end">
          <span className={cn(MONO, "whitespace-nowrap")} style={{ color: tone }}>
            {bidding ? "Bidding on your name" : "Offer changed"}
          </span>
          <span className={cn(MONO, "mt-1 whitespace-nowrap text-[var(--text-2)]")}>{change?.when ?? c.quietFor}</span>
        </span>
      </Layers>
    </div>
  );
});
