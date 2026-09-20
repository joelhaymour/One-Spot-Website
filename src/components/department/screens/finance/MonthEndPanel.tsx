"use client";

import { memo } from "react";
import { StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { PACK, WEEK } from "./data";
import { Appear, ConsolePanel, InReport, MONO, Meter, Swap, Tick } from "./kit";

interface MonthEndPanelProps {
  active: boolean;
  /** The books reconcile, so the pack can be built. */
  ready: boolean;
  /** The pack has been assembled. */
  closed: boolean;
  reported: boolean;
  /** The line the agent writes when it is done (its log entry for the step). */
  note: string;
}

/** ms between one section of the pack completing and the next starting. */
const SECTION = 640;

export const MonthEndPanel = memo(function MonthEndPanel({ active, ready, closed, reported, note }: MonthEndPanelProps) {
  const doneAt = PACK.length * SECTION + 260;

  return (
    <ConsolePanel
      label="Month-end"
      active={active}
      className="flex flex-col"
      right={
        <>
          <InReport on={reported} order={2} />
          <Swap
            index={closed ? 1 : 0}
            delay={closed ? doneAt : 0}
            className="justify-items-end"
            items={[
              <StatusChip key="open">September · open</StatusChip>,
              <StatusChip key="done" tone="ok">
                Assembled
              </StatusChip>,
            ]}
          />
        </>
      }
    >
      <div className={cn(MONO, "flex h-3 items-center justify-between text-[var(--text-2)]")}>
        <span>September pack</span>
        <span>3 sections</span>
      </div>

      <ul className="mt-2.5 flex flex-col gap-[11px]">
        {PACK.map((section, i) => {
          const start = closed ? i * SECTION : 0;
          const finish = i * SECTION + 620;
          return (
            <li key={section.id} className="flex flex-col gap-[7px]">
              <div className="flex items-start gap-2.5">
                <Tick on={closed} delay={finish} size={13} className="mt-px" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[11.5px] leading-tight text-[var(--text-0)]">{section.label}</span>
                  <Swap
                    block
                    index={closed ? 1 : 0}
                    delay={closed ? finish - 140 : 0}
                    itemClassName="truncate text-[10px] leading-tight text-[var(--text-2)]"
                    items={[section.source, section.detail]}
                  />
                </div>
                <Appear as="span" on={closed} delay={finish} y={0} x={6} className="t-num block text-[13px] leading-tight text-[var(--text-0)]">
                  {section.value}
                </Appear>
              </div>
              <Meter value={closed ? 1 : 0} delay={start} duration={700} height={2} />
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex h-[26px] items-end border-t border-[var(--line-faint)] text-[10.5px]">
        <Swap
          block
          index={closed ? 2 : ready ? 1 : 0}
          items={[
            <span key="wait" className="block text-[var(--text-2)]">
              Waiting on {WEEK.received - WEEK.matchedAtStart} documents still to reconcile.
            </span>,
            <span key="ready" className="block text-[var(--text-1)]">
              Books agree. Ready to assemble.
            </span>,
            <span key="done" className="block text-[var(--text-0)]">
              <TypedText text={note} active={closed} delay={doneAt / 1000} speed={52} />
            </span>,
          ]}
        />
      </div>
    </ConsolePanel>
  );
});
