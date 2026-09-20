"use client";

import { memo } from "react";
import { StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { BRIEFS, CONCEPT, IN_MARKET, WINNER } from "./data";
import { Appear, ConsolePanel, LABEL, Layers, Letter, MONO } from "./kit";

/*
 * Region D, "Creative". Two slots, each with a before and an after:
 *   top     the angle in market  ->  the new concept, typed by the agent
 *   bottom  the four tired ads   ->  four briefs, one per variation
 * So the panel is a working tool at rest, and each of the two "act" steps changes exactly one half.
 */

const BRIEF_FROM = 250;
const BRIEF_EVERY = 240;
const CHIP_AFTER = BRIEF_FROM + BRIEFS.length * BRIEF_EVERY + 300;

interface CreativeProps {
  concept: boolean;
  briefed: boolean;
  /** The variations have been queued, so a person has signed them off. */
  approved: boolean;
  won: boolean;
  active: boolean;
}

export const CreativePanel = memo(function CreativePanel({ concept, briefed, approved, won, active }: CreativeProps) {
  const status = won ? 4 : approved ? 3 : briefed ? 2 : concept ? 1 : 0;

  return (
    <ConsolePanel
      label="Creative"
      active={active}
      scan={false}
      right={
        <Layers show={status} align="end" delay={status === 2 ? CHIP_AFTER : status === 1 ? 1500 : 0}>
          <span className={cn(LABEL, "flex h-[18px] items-center whitespace-nowrap")}>{IN_MARKET.ads.length} ads live</span>
          <span className={cn(LABEL, "flex h-[18px] items-center whitespace-nowrap")}>Concept drafted</span>
          <StatusChip tone="accent">Awaiting approval</StatusChip>
          <StatusChip tone="ok">Approved, queued</StatusChip>
          <span className={cn(LABEL, "flex h-[18px] items-center whitespace-nowrap")}>{WINNER} kept · A, B, D retired</span>
        </Layers>
      }
    >
      <div className="flex h-full flex-col">
        <div className="h-[62px] rounded-lg border border-[var(--line)] bg-white/[0.02] px-3 py-[7px]">
          <Layers show={concept ? 1 : 0} fill>
            <div>
              <div className={LABEL}>Angle in market</div>
              <div className="mt-[5px] text-[13px] font-medium leading-4 text-[var(--text-0)]">{IN_MARKET.angle}</div>
              <div className="mt-[3px] text-[10px] leading-3 text-[var(--text-2)]">
                {IN_MARKET.campaign} · {IN_MARKET.age} · {IN_MARKET.ads.length} ads
              </div>
            </div>
            <div>
              <div className={LABEL}>New concept</div>
              <div className="mt-[5px] whitespace-nowrap text-[13px] font-medium leading-4 text-[var(--text-0)]">
                <TypedText text={CONCEPT.line} active={concept} delay={0.45} />
              </div>
              <Appear on={concept} delay={1500} y={3} className="mt-[3px] whitespace-nowrap text-[10px] leading-3 text-[var(--text-1)]">
                {CONCEPT.why}
              </Appear>
            </div>
          </Layers>
        </div>

        <div className="mt-1.5 min-h-0 flex-1">
          <Layers show={briefed ? 1 : 0} fill>
            <div role="list" aria-label="Ads live in Spring Promotion">
              <div className={cn(LABEL, "flex h-[18px] items-center justify-between")}>
                <span>Live ads</span>
                <span>Click-through</span>
              </div>
              {IN_MARKET.ads.map((ad) => (
                <div key={ad.id} role="listitem" className="grid h-[29px] grid-cols-[30px_minmax(0,1fr)_64px_34px] items-center gap-x-2 border-t border-[var(--line-faint)]">
                  <span className={cn(MONO, "text-[var(--text-2)]")}>{ad.id}</span>
                  <span className="truncate text-[11px] text-[var(--text-1)]">{ad.headline}</span>
                  <span className="text-[10px] text-[var(--text-2)]">{ad.format}</span>
                  <span className="t-num text-right text-[10.5px] text-[var(--text-0)]">{ad.clickThrough}</span>
                </div>
              ))}
            </div>

            <div role="list" aria-label="Creative briefs" className="grid h-full grid-cols-2 grid-rows-2 gap-1.5">
              {BRIEFS.map((b, i) => {
                const retired = won && b.id !== WINNER;
                return (
                  <Appear key={b.id} on={briefed} delay={BRIEF_FROM + i * BRIEF_EVERY} className="min-w-0">
                    <div
                      role="listitem"
                      className={cn(
                        "h-full rounded-lg border border-[var(--line)] bg-white/[0.02] px-[9px] py-[7px] transition-opacity duration-500 ease-[var(--ease-out)]",
                        retired && "opacity-45",
                      )}
                    >
                      <div className="flex h-[14px] items-center justify-between">
                        <Letter id={b.id} lit={won && b.id === WINNER} struck={retired} />
                        <span className={cn(MONO, "text-[var(--text-2)]")}>{b.format}</span>
                      </div>
                      <div className={cn("mt-[5px] truncate text-[11.5px] font-medium leading-[14px] text-[var(--text-0)]", retired && "line-through")}>{b.headline}</div>
                      <div className="mt-[2px] truncate text-[10px] leading-3 text-[var(--text-2)]">{b.audience}</div>
                    </div>
                  </Appear>
                );
              })}
            </div>
          </Layers>
        </div>
      </div>
    </ConsolePanel>
  );
});
