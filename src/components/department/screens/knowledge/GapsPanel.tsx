"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { DRAFTS_READY, DRAFT_NOTE, GAPS, GAPS_BEFORE, GAPS_FOUND } from "./data";
import { InReport, LABEL, MONO, Show, Swap, Tick, lag, type Stage } from "./kit";

interface GapsPanelProps {
  gaps: Stage;
  reported: boolean;
  active: boolean;
}

const KNOWN_ROWS = GAPS.filter((g) => g.known).length;

/** Region C. Questions people keep asking that nobody ever wrote an answer to. */
export function GapsPanel({ gaps, reported, active }: GapsPanelProps) {
  const found = gaps.on;
  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="Gaps"
        right={
          <>
            <InReport on={reported} order={2} />
            <Swap
              on={found}
              delay={lag(gaps, 500)}
              align="end"
              from={
                <span className={LABEL}>
                  {KNOWN_ROWS} of {GAPS_BEFORE} shown
                </span>
              }
              to={
                <span className={LABEL}>
                  {GAPS.length} of {GAPS_FOUND} shown
                </span>
              }
            />
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3">
        <div className="flex h-[46px] items-start gap-7">
          <div>
            <AnimatedNumber
              value={found ? GAPS_FOUND : GAPS_BEFORE}
              duration={1.2}
              className="block text-[26px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]"
            />
            <div className={cn(LABEL, "mt-[7px]")}>No written answer</div>
          </div>
          <div>
            <AnimatedNumber
              value={found ? DRAFTS_READY : 0}
              duration={1.6}
              className="block text-[26px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]"
            />
            <div className={cn(LABEL, "mt-[7px]")}>Drafts ready for approval</div>
          </div>
        </div>

        <ul className="mt-2">
          {GAPS.map((g, i) => {
            const row = (
              <div className="flex h-[25px] items-center gap-2 border-t border-[var(--line-faint)]">
                <span className="min-w-0 flex-1 truncate text-[11.5px] leading-none text-[var(--text-0)]">{g.question}</span>
                <span className="t-num w-[58px] shrink-0 text-right font-mono text-[10px] leading-none text-[var(--text-2)]">
                  asked {g.asked}×
                </span>
                <span className="flex w-[88px] shrink-0 justify-end">
                  {g.drafted ? (
                    // the agent writes the two most-asked answers first
                    <Swap
                      on={found}
                      delay={lag(gaps, 1500 + i * 350)}
                      align="end"
                      from={<span className={LABEL}>No answer</span>}
                      to={
                        <span className={cn(MONO, "flex items-center gap-1")} style={{ color: "rgb(var(--accent-rgb))" }}>
                          <Tick />
                          Draft ready
                        </span>
                      }
                    />
                  ) : (
                    <span className={LABEL}>{g.known ? "No answer" : "New"}</span>
                  )}
                </span>
              </div>
            );
            return g.known ? (
              <li key={g.question}>{row}</li>
            ) : (
              <Show as="li" key={g.question} when={found} delay={lag(gaps, 350 + (i - KNOWN_ROWS) * 160)}>
                {row}
              </Show>
            );
          })}
        </ul>

        <p className="mt-auto truncate border-t border-[var(--line-faint)] pt-[7px] text-[11px] leading-[1.3] text-[var(--text-1)]">
          <TypedText text={DRAFT_NOTE} active={found} delay={2.3} speed={52} />
        </p>
      </div>
    </Panel>
  );
}
