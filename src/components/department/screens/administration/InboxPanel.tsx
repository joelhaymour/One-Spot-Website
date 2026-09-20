"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { InReport, LABEL, MONO, Meter, Show, Swap, lag, wait, type Stage } from "../knowledge/kit";
import { BUCKETS, EMAILS, INBOX, NEEDS_YOU } from "./data";

interface InboxPanelProps {
  sort: Stage;
  reported: boolean;
  active: boolean;
}

const ROW = "flex h-[29px] items-center gap-2 border-t border-[var(--line-faint)]";
const RACE = 1.6;
/** Every visible email is tagged first. Only then does the inbox give way to the nine. */
const TAG_EACH = 120;
const COLLAPSE = 300 + INBOX.length * TAG_EACH + 250;

/** Region B. 146 emails go in; the owner gets the nine that need a person, each with what it needs. */
export function InboxPanel({ sort, reported, active }: InboxPanelProps) {
  const sorted = sort.on;
  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="Inbox triage"
        right={
          <>
            <InReport on={reported} order={1} />
            <span className={LABEL}>
              <AnimatedNumber value={sorted ? 0 : EMAILS} duration={RACE} className="mr-1 text-[var(--text-0)]" />
              unsorted
            </span>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3">
        <div className="grid grid-cols-3 gap-4">
          {BUCKETS.map((b) => (
            <div key={b.id}>
              <AnimatedNumber
                value={sorted ? b.count : 0}
                duration={RACE}
                className="block text-[26px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]"
              />
              {/* the panel's one accent: the bucket that is the owner's */}
              <div
                className={cn(MONO, "mt-[7px]")}
                style={{ color: b.id === "Needs you" ? "rgb(var(--accent-rgb))" : "var(--text-2)" }}
              >
                {b.id}
              </div>
              <div className="mt-2">
                <Meter value={sorted ? b.count / EMAILS : 0} duration={RACE * 1000} />
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-3 min-h-0 flex-1">
          <div
            aria-hidden={sorted ? true : undefined}
            className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
            style={{
              opacity: sorted ? 0 : 1,
              transform: sorted ? "translate3d(0, -6px, 0)" : "none",
              transitionDelay: sorted ? wait(lag(sort, COLLAPSE)) : "0ms",
            }}
          >
            <div className="flex h-[22px] items-start justify-between">
              <span className={LABEL}>Inbox · newest first</span>
              <span className={LABEL}>Sorted into</span>
            </div>
            <ul>
              {INBOX.map((m, i) => (
                <li key={m.subject} className={ROW}>
                  <span className="w-[104px] shrink-0 truncate text-[11px] leading-[14px] text-[var(--text-1)]">{m.from}</span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] leading-[14px] text-[var(--text-0)]">{m.subject}</span>
                  <Swap
                    on={sorted}
                    delay={lag(sort, 300 + i * TAG_EACH)}
                    align="end"
                    className="w-[64px] shrink-0"
                    from={<span className={LABEL}>Unread</span>}
                    to={<span className={cn(MONO, m.bucket === "Needs you" ? "text-[var(--text-0)]" : "text-[var(--text-2)]")}>{m.bucket}</span>}
                  />
                </li>
              ))}
              <li className={ROW}>
                <span className={LABEL}>{EMAILS - INBOX.length} more below</span>
              </li>
            </ul>
          </div>

          <Show when={sorted} delay={lag(sort, COLLAPSE + 200)} y={8} className="absolute inset-0">
            <div className="flex h-[22px] items-start justify-between">
              <span className={cn(MONO, "text-[var(--text-1)]")}>Needs you · {NEEDS_YOU.length}</span>
              <span className={LABEL}>What it needs</span>
            </div>
            <ol>
              {NEEDS_YOU.map((m, i) => (
                <Show as="li" key={m.subject} when={sorted} delay={lag(sort, COLLAPSE + 300 + i * 70)} y={4} className={ROW}>
                  <span className="w-[104px] shrink-0 truncate text-[11px] leading-[14px] text-[var(--text-1)]">{m.from}</span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] leading-[14px] text-[var(--text-0)]">{m.subject}</span>
                  <span className={cn(MONO, "w-[56px] shrink-0 text-right text-[var(--text-1)]")}>{m.todo}</span>
                </Show>
              ))}
            </ol>
          </Show>
        </div>
      </div>
    </Panel>
  );
}
