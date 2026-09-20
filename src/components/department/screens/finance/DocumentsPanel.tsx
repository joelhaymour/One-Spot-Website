"use client";

import { memo, type ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { DOCS, WEEK, type DocRow } from "./data";
import { Appear, ConsolePanel, InReport, MONO, Meter, StatusWord, Swap, wait } from "./kit";

interface DocumentsPanelProps {
  active: boolean;
  scanning: boolean;
  /** The week's documents have just landed: mark the newest ones. */
  fresh: boolean;
  /** Invoice 4471 is open in the document check. */
  open: boolean;
  read: boolean;
  held: boolean;
  reconciled: boolean;
  reported: boolean;
}

const COLS = "minmax(0,1fr) 98px 46px 72px 80px 120px 116px";
const ACCENT = "rgb(var(--accent-rgb))";

/** Matching runs down the list quickly, one row after another: ms each row waits for its turn. */
const MATCH_WAIT = DOCS.map((row, i) => (row.fate === "match" ? 100 + DOCS.slice(0, i).filter((r) => r.fate === "match").length * 85 : 0));

function Stat({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-[7px] border-l border-[var(--line-faint)] pl-3.5 first:border-l-0 first:pl-0", className)}>
      <span className={cn(MONO, "text-[var(--text-2)]")}>{label}</span>
      <div className="flex items-baseline gap-2 text-[22px] leading-none tracking-[-0.02em] text-[var(--text-0)]">{children}</div>
    </div>
  );
}

const received = <StatusWord className="text-[var(--text-2)]">Received</StatusWord>;
const matched = (
  <StatusWord color="var(--ok)" className="text-[var(--text-1)]">
    Matched
  </StatusWord>
);
const reading = (
  <StatusWord color={ACCENT} className="text-[var(--text-0)]">
    Reading
  </StatusWord>
);
const heldChip = <StatusChip tone="warn">Held for review</StatusChip>;

function statusOf(row: DocRow, s: { open: boolean; held: boolean; reconciled: boolean }): { items: ReactNode[]; index: number } {
  switch (row.fate) {
    case "duplicate":
      return { items: [received, reading, heldChip], index: s.held ? 2 : s.open ? 1 : 0 };
    case "bank":
      return { items: [received, heldChip], index: s.held ? 1 : 0 };
    case "match":
      return { items: [received, matched], index: s.reconciled ? 1 : 0 };
    case "settled":
      return { items: [matched], index: 0 };
  }
}

export const DocumentsPanel = memo(function DocumentsPanel({
  active,
  scanning,
  fresh,
  open,
  read,
  held,
  reconciled,
  reported,
}: DocumentsPanelProps) {
  const matchedCount = reconciled ? WEEK.matchedAtEnd : WEEK.matchedAtStart;

  return (
    <ConsolePanel
      label="Documents · this week"
      active={active}
      scanning={scanning}
      right={
        <>
          <InReport on={reported} order={0} />
          <Swap
            index={held ? 1 : 0}
            className="justify-items-end"
            items={[
              <StatusChip key="open">{WEEK.received - WEEK.matchedAtStart} to reconcile</StatusChip>,
              <StatusChip key="held" tone="warn">
                {WEEK.held} held for review
              </StatusChip>,
            ]}
          />
        </>
      }
    >
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] pt-0.5">
        <Stat label="Received">
          <span className="t-num">{WEEK.received}</span>
          <span className="text-[10px] tracking-normal text-[var(--text-2)]">
            {WEEK.sources.map((s) => `${s.label} ${s.count}`).join(" · ")}
          </span>
        </Stat>
        <Stat label="Read">
          <AnimatedNumber value={read ? WEEK.received : WEEK.matchedAtStart} duration={1.4} />
          <span className="text-[10px] tracking-normal text-[var(--text-2)]">every field</span>
        </Stat>
        <Stat label="Matched">
          <AnimatedNumber value={matchedCount} duration={1.7} />
          <span className="t-num text-[10px] tracking-normal text-[var(--text-2)]">of {WEEK.received}</span>
        </Stat>
        <Stat label="Held">
          <AnimatedNumber
            value={held ? WEEK.held : 0}
            duration={0.5}
            className={cn("transition-colors duration-500", held ? "text-[var(--warn)]" : "text-[var(--text-2)]")}
          />
          <span className="text-[10px] tracking-normal text-[var(--text-2)]">for a person</span>
        </Stat>
      </div>

      <Meter value={matchedCount / WEEK.received} duration={1700} className="my-[9px]" />

      <div role="table" aria-label="Documents received this week">
        <div
          role="row"
          className={cn("grid h-[22px] items-center gap-x-2.5 border-b border-[var(--line-faint)] text-[var(--text-2)]", MONO)}
          style={{ gridTemplateColumns: COLS }}
        >
          <span role="columnheader">Vendor</span>
          <span role="columnheader">Document</span>
          <span role="columnheader">Date</span>
          <span role="columnheader">Source</span>
          <span role="columnheader" className="text-right">
            Amount
          </span>
          <span role="columnheader">Match</span>
          <span role="columnheader">Status</span>
        </div>

        {DOCS.map((row, i) => {
          const status = statusOf(row, { open, held, reconciled });
          const isHeldRow = row.fate === "duplicate" || row.fate === "bank";
          const turn = MATCH_WAIT[i];
          const matchOn = row.fate === "settled" || (row.fate === "match" && reconciled) || (isHeldRow && held);
          return (
            <div
              key={row.doc}
              role="row"
              className="relative isolate grid h-[27px] items-center gap-x-2.5 border-b border-[var(--line-faint)] text-[10.5px] last:border-b-0"
              style={{ gridTemplateColumns: COLS }}
            >
              {row.fate === "duplicate" && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-1.5 inset-y-px -z-10 rounded-[5px] bg-white/[0.045] transition-opacity duration-500 ease-[var(--ease-out)]"
                  style={{ opacity: open && !held ? 1 : 0 }}
                >
                  <span className="absolute inset-y-1 left-0 w-[2px] rounded-full" style={{ background: ACCENT }} />
                </span>
              )}
              {i < 3 && (
                <span
                  aria-hidden
                  className="absolute -left-[9px] top-1/2 h-1 w-1 -translate-y-1/2 rounded-full transition-opacity duration-500 ease-[var(--ease-out)]"
                  style={{ background: ACCENT, opacity: fresh ? 1 : 0, transitionDelay: fresh ? wait(300 + i * 140) : "0ms" }}
                />
              )}
              <span role="cell" className="truncate text-[11.5px] text-[var(--text-0)]">
                {row.vendor}
              </span>
              <span role="cell" className="t-num truncate text-[var(--text-1)]">
                {row.doc}
              </span>
              <span role="cell" className="t-num text-[var(--text-2)]">
                {row.date}
              </span>
              <span role="cell" className="text-[var(--text-2)]">
                {row.source}
              </span>
              <span role="cell" className="t-num text-right text-[11px] text-[var(--text-0)]">
                {row.amount}
              </span>
              <span role="cell" className="min-w-0">
                <Appear
                  as="span"
                  on={matchOn}
                  delay={turn}
                  y={3}
                  className={cn("t-num block truncate", isHeldRow ? "text-[var(--warn)]" : "text-[var(--text-1)]")}
                >
                  {row.match}
                </Appear>
              </span>
              <span role="cell" className="flex items-center">
                <Swap index={status.index} items={status.items} delay={reconciled ? turn : 0} itemClassName="flex items-center" />
              </span>
            </div>
          );
        })}
      </div>
    </ConsolePanel>
  );
});
