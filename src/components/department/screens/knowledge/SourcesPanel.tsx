"use client";

import { AnimatedNumber, formatNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader, ScanLine, StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { SOURCES, TOTAL_BEFORE, TOTAL_DOCS, UNREAD_DOCS, UNSORTED_FILES, WARRANTY_VERSIONS, type Source } from "./data";
import { DocGlyph, Highlight, InReport, LABEL, MONO, Meter, Show, Swap, Tick, lag, wait, type Stage } from "./kit";

interface SourcesPanelProps {
  reads: Stage;
  connects: Stage;
  reported: boolean;
  active: boolean;
  scanning: boolean;
  /** Ambient lights may breathe. */
  ambient: boolean;
}

/** Seconds a source takes to index: the bigger the unread pile, the longer the count runs. */
const indexTime = (s: Source) => 0.7 + (1.5 * (s.docs - s.before)) / 1874;

/** Region A. What the company knows, where it lives, and which copy of an answer is the real one. */
export function SourcesPanel({ reads, connects, reported, active, scanning, ambient }: SourcesPanelProps) {
  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="Sources"
        right={
          <>
            <InReport on={reported} order={0} />
            <Swap
              on={reads.on}
              align="end"
              from={<StatusChip tone="neutral">5 of 7 read</StatusChip>}
              to={
                // "Indexing" holds for as long as the longest count runs, then settles.
                <Swap
                  on={reads.on}
                  delay={lag(reads, 2300)}
                  align="end"
                  from={
                    <StatusChip tone="neutral" pulse={ambient}>
                      Indexing
                    </StatusChip>
                  }
                  to={<StatusChip tone="ok">7 of 7 read</StatusChip>}
                />
              }
            />
          </>
        }
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex w-[330px] shrink-0 flex-col px-3.5 pb-3 pt-1.5">
          <div className="flex items-end justify-between">
            <div>
              <AnimatedNumber
                value={reads.on ? TOTAL_DOCS : TOTAL_BEFORE}
                duration={2.2}
                className="block text-[30px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]"
              />
              <div className={cn(LABEL, "mt-2")}>Documents indexed</div>
            </div>
            <div className="text-right">
              <div className="t-num text-[15px] leading-none text-[var(--text-0)]">{SOURCES.length}</div>
              <div className={cn(LABEL, "mt-2")}>Sources</div>
            </div>
          </div>

          <ul className="mt-3.5">
            {SOURCES.map((s) => (
              <SourceRow key={s.name} source={s} read={reads.on} />
            ))}
          </ul>
        </div>

        <div className="relative min-w-0 flex-1 border-l border-[var(--line-faint)]">
          <UnsortedFiles reads={reads} hidden={connects.on} />
          <WarrantyCluster connects={connects} />
        </div>
      </div>

      <ScanLine active={scanning} />
    </Panel>
  );
}

function SourceRow({ source, read }: { source: Source; read: boolean }) {
  const seconds = indexTime(source);
  return (
    <li className="flex h-[38px] flex-col justify-center border-t border-[var(--line-faint)]">
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] leading-none text-[var(--text-0)]">{source.name}</span>
        <AnimatedNumber
          value={read ? source.docs : source.before}
          duration={seconds}
          className="text-[12.5px] leading-none text-[var(--text-0)]"
        />
      </div>
      <div className="mt-[7px] flex items-center gap-3">
        <span className={cn(LABEL, "w-[132px] shrink-0 truncate")}>{source.where}</span>
        <Meter value={read ? 1 : source.before / source.docs} duration={seconds * 1000} />
      </div>
    </li>
  );
}

/** The shared drive nobody organised: the agent opens each file and says what it actually is. */
function UnsortedFiles({ reads, hidden }: { reads: Stage; hidden: boolean }) {
  return (
    <div
      aria-hidden={hidden ? true : undefined}
      className="absolute inset-0 px-3.5 pb-3 pt-1.5 transition-opacity duration-300 ease-[var(--ease-out)]"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <div className="flex h-[14px] items-center justify-between">
        <span className={LABEL}>Unsorted files</span>
        <Swap
          on={reads.on}
          delay={lag(reads, 2300)}
          align="end"
          from={<span className={LABEL}>{formatNumber(UNREAD_DOCS)} never read</span>}
          to={<span className={cn(MONO, "text-[var(--text-1)]")}>{formatNumber(UNREAD_DOCS)} read</span>}
        />
      </div>
      <ul className="mt-2">
        {UNSORTED_FILES.map((f, i) => (
          <li key={f.file} className="flex h-[47px] items-center gap-2.5 border-t border-[var(--line-faint)]">
            <DocGlyph className="text-[var(--text-2)]" />
            <div className="w-[182px] shrink-0">
              <div className="truncate font-mono text-[11px] leading-none text-[var(--text-1)]">{f.file}</div>
              <div className="mt-[7px] truncate text-[10.5px] leading-none text-[var(--text-2)]">{f.path}</div>
            </div>
            <Swap
              on={reads.on}
              delay={lag(reads, 350 + i * 300)}
              className="min-w-0 flex-1"
              from={<span className={LABEL}>Not read yet</span>}
              to={
                <span className="flex items-start gap-1.5 text-[11.5px] leading-[1.3] text-[var(--text-0)]">
                  <Tick className="mt-[3px] text-[var(--ok)]" />
                  {f.is}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One answer, four places, two of them wrong. The agent lines them up and marks the one that stands. */
function WarrantyCluster({ connects }: { connects: Stage }) {
  const on = connects.on;
  return (
    <Show when={on} delay={lag(connects, 250)} y={8} className="absolute inset-0 px-3.5 pb-3 pt-1.5">
      <div className="flex items-start justify-between">
        <div>
          <div className={cn(LABEL, "flex h-[14px] items-center")}>Same answer, four places</div>
          <div className="mt-2 text-[15px] font-medium leading-none tracking-[-0.01em] text-[var(--text-0)]">Warranty terms</div>
        </div>
        <Show when={on} delay={lag(connects, 1350)} y={0}>
          <StatusChip tone="warn">2 disagree</StatusChip>
        </Show>
      </div>

      <ol className="relative mt-3.5 flex flex-col gap-1.5 pl-5">
        {/* the spine that ties the four copies to one topic; it stops at the last card's centre */}
        <span aria-hidden className="absolute bottom-[31px] left-[6px] top-0 w-px bg-[var(--line-strong)]" />
        {WARRANTY_VERSIONS.map((v, i) => (
          <Show as="li" key={v.title} when={on} delay={lag(connects, 480 + i * 130)} className="relative">
            <span aria-hidden className="absolute -left-[14px] top-1/2 h-px w-[14px] bg-[var(--line-strong)]" />
            <div
              className="flex h-[62px] flex-col justify-center rounded-[8px] border border-[var(--line)] bg-white/[0.02] px-3 transition-opacity duration-700 ease-[var(--ease-out)]"
              style={{
                opacity: on && !v.current ? 0.6 : 1,
                transitionDelay: on ? wait(lag(connects, 2600)) : "0ms",
              }}
            >
              <div className="flex items-center justify-between">
                <span className={LABEL}>
                  {v.source} · {v.year}
                </span>
                <Show when={on} delay={lag(connects, v.current ? 2100 : 2350 + i * 90)} y={0} as="span" className="inline-flex">
                  {v.current ? <StatusChip tone="accent">Current</StatusChip> : <StatusChip tone="neutral">Superseded</StatusChip>}
                </Show>
              </div>
              <div className="mt-1 truncate text-[12px] leading-[1.3] text-[var(--text-0)]">{v.title}</div>
              <div className="mt-0.5 text-[11.5px] leading-[1.3] text-[var(--text-2)]">
                Refurbished units:{" "}
                <span className="ml-1 text-[var(--text-0)]">
                  {v.agrees ? v.value : <Highlight on={on} delay={lag(connects, 1350)}>{v.value}</Highlight>}
                </span>
              </div>
            </div>
          </Show>
        ))}
      </ol>
    </Show>
  );
}
