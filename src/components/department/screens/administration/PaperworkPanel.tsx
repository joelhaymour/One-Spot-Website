"use client";

import type { ReactNode } from "react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { DocGlyph, InReport, LABEL, MONO, Swap, Tick, lag, type Stage } from "../knowledge/kit";
import { CHECKED, PAPERS, PAPER_PACE, ROUTED, type Paper } from "./data";
import { useAfter } from "./useAfter";

interface PaperworkPanelProps {
  paperwork: Stage;
  reported: boolean;
  active: boolean;
}

/** Within one document: three fields in turn, then the check, then the hand-off. */
const FIRST_FIELD = 100;
const FIELD_EACH = 200;
const CHECK_AT = 780;
const ROUTE_AT = 1150;
const ALL_ROUTED = (PAPERS.length - 1) * PAPER_PACE + ROUTE_AT + 300;

/** Region D. Three documents people left half-done: filled from what the company already knows, checked, sent to sign. */
export function PaperworkPanel({ paperwork, reported, active }: PaperworkPanelProps) {
  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="Paperwork"
        right={
          <>
            <InReport on={reported} order={3} />
            <Swap
              on={paperwork.on}
              delay={lag(paperwork, ALL_ROUTED)}
              align="end"
              from={<span className={LABEL}>{PAPERS.length} to prepare</span>}
              to={<span className={cn(MONO, "text-[var(--text-1)]")}>{PAPERS.length} of {PAPERS.length} routed</span>}
            />
          </>
        }
      />

      <ul className="min-h-0 flex-1 px-3.5 pb-2">
        {PAPERS.map((p, i) => (
          <Document key={p.title} paper={p} stage={paperwork} start={i * PAPER_PACE} />
        ))}
      </ul>
    </Panel>
  );
}

function Document({ paper, stage, start }: { paper: Paper; stage: Stage; start: number }) {
  return (
    <li className="flex h-[70px] flex-col justify-center border-t border-[var(--line-faint)]">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <DocGlyph className="text-[var(--text-2)]" />
          <span className="truncate text-[12px] font-medium leading-[14px] text-[var(--text-0)]">{paper.title}</span>
        </span>
        <Swap
          on={stage.on}
          delay={lag(stage, start + CHECK_AT)}
          align="end"
          className="shrink-0"
          from={<span className={LABEL}>To prepare</span>}
          to={
            // the tick holds its place while the word beside it changes
            <span className="flex items-center gap-1">
              <Tick className="text-[var(--ok)]" />
              <Swap
                on={stage.on}
                delay={lag(stage, start + ROUTE_AT)}
                from={<span className={cn(MONO, "text-[var(--text-1)]")}>{CHECKED}</span>}
                to={
                  <span className={MONO} style={{ color: "rgb(var(--accent-rgb))" }}>
                    {ROUTED}
                  </span>
                }
              />
            </span>
          }
        />
      </div>

      <dl className="mt-[9px] grid grid-cols-[100px_repeat(3,minmax(0,1fr))] gap-x-2">
        <Field label={paper.about.label}>{paper.about.value}</Field>
        {paper.fields.map((f, j) => (
          <Blank key={f.label} label={f.label} value={f.value} stage={stage} at={start + FIRST_FIELD + j * FIELD_EACH} />
        ))}
      </dl>
    </li>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className={LABEL}>{label}</dt>
      {/* the rule is the blank on the form: it stays, the value is written on it */}
      <dd className="mt-[5px] h-[17px] truncate border-b border-dashed border-[var(--line-strong)] text-[11px] leading-[14px] text-[var(--text-0)]">
        {children}
      </dd>
    </div>
  );
}

/** A field nobody filled in. Its own timer, so each value is typed when its turn comes and never twice. */
function Blank({ label, value, stage, at }: { label: string; value: string; stage: Stage; at: number }) {
  const writing = useAfter(stage, at);
  return (
    <Field label={label}>
      <TypedText text={value} active={writing} speed={60} caret={false} />
    </Field>
  );
}
