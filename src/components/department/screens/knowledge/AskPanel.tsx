"use client";

import { Mark } from "@/components/agent/AgentSvg";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { EARLIER_ANSWERS, QUESTION } from "./data";
import { DocGlyph, InReport, LABEL, Show, lag, type Stage } from "./kit";

const QUESTION_H = 52;
const ANSWER_H = 128;
const GAP = 8;
/** How far the thread scrolls when the new question arrives. Fixed heights, so no measuring. */
const THREAD_SHIFT = QUESTION_H + ANSWER_H + GAP * 2;

interface AskPanelProps {
  asked: Stage;
  /** Questions answered this month, for people and agents. */
  answered: number;
  reported: boolean;
  active: boolean;
}

/** Region B. A person asks in plain words; the answer arrives in seconds with its source attached. */
export function AskPanel({ asked, answered, reported, active }: AskPanelProps) {
  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="Ask"
        right={
          <>
            <InReport on={reported} order={1} />
            <span className={LABEL}>
              Answered this month <AnimatedNumber value={answered} className="ml-1 text-[var(--text-0)]" />
            </span>
          </>
        }
      />

      {/* A thread anchored to its newest message. Older answers scroll up and out under a soft edge. */}
      <div
        className="relative mx-3.5 min-h-0 flex-1 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0, #000 30px)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 30px)",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col transition-transform duration-[800ms] ease-[var(--ease-out)]"
          style={{ gap: GAP, transform: asked.on ? "none" : `translate3d(0, ${THREAD_SHIFT}px, 0)` }}
        >
          {EARLIER_ANSWERS.map((e) => (
            <div key={e.q} className="flex h-[62px] shrink-0 flex-col justify-center rounded-[9px] border border-[var(--line-faint)] px-3">
              <div className="truncate text-[11.5px] leading-none text-[var(--text-2)]">
                {e.who}: {e.q}
              </div>
              <div className="mt-[7px] truncate text-[12px] leading-none text-[var(--text-0)]">{e.a}</div>
              <div className={cn(LABEL, "mt-[8px] truncate")}>
                {e.source} · {e.took}
              </div>
            </div>
          ))}

          <Show when={asked.on} delay={lag(asked, 200)} className="flex shrink-0 items-start gap-2.5 px-3 pt-1.5" style={{ height: QUESTION_H }}>
            <span
              aria-hidden
              className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-white/[0.04] font-mono text-[9px] text-[var(--text-1)]"
            >
              {QUESTION.initials}
            </span>
            <div className="min-w-0">
              <div className={LABEL}>{QUESTION.from}</div>
              <p className="mt-[7px] text-[13px] leading-[1.3] text-[var(--text-0)]">{QUESTION.text}</p>
            </div>
          </Show>

          <Show
            when={asked.on}
            delay={lag(asked, 700)}
            className="flex shrink-0 items-start gap-2.5 rounded-[9px] border border-[var(--line)] bg-white/[0.025] px-3 pt-2.5"
            style={{ height: ANSWER_H }}
          >
            <Mark size={20} className="mt-px shrink-0 text-[var(--text-1)]" />
            <div className="min-w-0">
              <div className={LABEL}>Knowledge Agent</div>
              <p className="mt-[7px] text-[12.5px] leading-[1.45] text-[var(--text-0)]">
                <TypedText text={QUESTION.answer} active={asked.on} delay={0.9} speed={58} />
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <Show as="span" when={asked.on} delay={lag(asked, 3150)} y={0} className="inline-flex">
                  <span
                    className="inline-flex h-[20px] items-center gap-1.5 rounded-[5px] border px-1.5 text-[10.5px] leading-none"
                    style={{
                      color: "rgb(var(--accent-rgb))",
                      borderColor: "rgba(var(--accent-rgb), 0.32)",
                      background: "rgba(var(--accent-rgb), 0.08)",
                    }}
                  >
                    <DocGlyph />
                    {QUESTION.source}
                  </span>
                </Show>
                <Show as="span" when={asked.on} delay={lag(asked, 3400)} y={0} className="inline-flex">
                  <StatusChip tone="ok">{QUESTION.took}</StatusChip>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </div>

      <div
        aria-hidden
        className="mx-3.5 mb-3 mt-2.5 flex h-[38px] shrink-0 items-center justify-between rounded-[9px] border border-[var(--line)] bg-white/[0.02] px-3"
      >
        <span className="text-[12px] text-[var(--text-2)]">Ask in plain words</span>
        <span className={LABEL}>Enter</span>
      </div>
    </Panel>
  );
}
