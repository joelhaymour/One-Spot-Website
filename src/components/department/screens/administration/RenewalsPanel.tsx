"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader, toneColor } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { InReport, LABEL, MONO, Show, Swap, Tick, lag, wait, type Stage } from "../knowledge/kit";
import { ADDED, HORIZON_DAYS, RENEWALS, TODO_BEFORE, type Renewal } from "./data";
import { useAfter } from "./useAfter";

interface RenewalsPanelProps {
  reminds: Stage;
  reported: boolean;
  active: boolean;
}

const AXIS = [0, 15, 30, 45, 60];
/** One renewal at a time: notice it on the timeline, mark the row, write the to-do. */
const EACH = 1500;
const NOTICED = 250;
const MARKED = 650;
const WRITTEN = 950;

const REMINDERS = RENEWALS.filter((r) => r.remind).sort((a, b) => (a.remind?.order ?? 0) - (b.remind?.order ?? 0));
const startOf = (r: Renewal) => (r.remind?.order ?? 0) * EACH;

/** Region C. What renews or lapses in the next 60 days, and the two the owner now has on a list. */
export function RenewalsPanel({ reminds, reported, active }: RenewalsPanelProps) {
  // The to-do count ticks as each line is written, so two timers rather than one tween.
  const first = useAfter(reminds, WRITTEN);
  const second = useAfter(reminds, EACH + WRITTEN);
  const written = [first, second];

  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="Renewals"
        right={
          <>
            <InReport on={reported} order={2} />
            <span className={LABEL}>Next {HORIZON_DAYS} days</span>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3">
        <Timeline reminds={reminds} />

        <ul>
          {RENEWALS.map((r) => (
            <li key={r.name} className="flex h-[25px] items-center gap-2 border-t border-[var(--line-faint)]">
              <span className="min-w-0 flex-1 truncate text-[11.5px] leading-[14px] text-[var(--text-0)]">{r.name}</span>
              <span className="t-num w-[46px] shrink-0 text-right font-mono text-[10px] leading-none text-[var(--text-1)]">{r.days} days</span>
              <span className="flex w-[152px] shrink-0 justify-end">
                {r.remind ? (
                  <Swap
                    on={reminds.on}
                    delay={lag(reminds, startOf(r) + MARKED)}
                    align="end"
                    from={<span className={MONO} style={{ color: r.status === "Lapsing" ? toneColor.warn : "var(--text-2)" }}>{r.status}</span>}
                    to={
                      <span className={cn(MONO, "flex items-center gap-1")} style={{ color: "rgb(var(--accent-rgb))" }}>
                        <Tick />
                        {ADDED}
                      </span>
                    }
                  />
                ) : (
                  <span className={LABEL}>{r.status}</span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[var(--line-faint)] pt-[7px]">
          <div className="flex items-center justify-between">
            <span className={LABEL}>Owner to-do</span>
            <span className={LABEL}>
              <AnimatedNumber value={TODO_BEFORE + written.filter(Boolean).length} duration={0.4} className="mr-1 text-[var(--text-0)]" />
              open
            </span>
          </div>
          <ul className="mt-[6px]">
            {REMINDERS.map((r, i) => (
              <Show
                as="li"
                key={r.name}
                when={reminds.on}
                delay={lag(reminds, startOf(r) + WRITTEN - 150)}
                y={4}
                className="flex h-[17px] items-center gap-2"
              >
                <span aria-hidden className="h-[9px] w-[9px] shrink-0 rounded-[2.5px] border border-[var(--line-strong)]" />
                <span className="truncate text-[11px] leading-[14px] text-[var(--text-0)]">
                  <TypedText text={r.remind?.todo ?? ""} active={written[i]} speed={56} />
                </span>
              </Show>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

/** Sixty days on one line. The two amber marks are the ones a person would have forgotten. */
function Timeline({ reminds }: { reminds: Stage }) {
  return (
    <div className="relative mx-1 h-[42px] shrink-0" aria-hidden>
      <span className="absolute inset-x-0 top-[19px] h-px bg-[var(--line-strong)]" />
      {AXIS.map((d) => (
        <span key={d} className="absolute top-[19px]" style={{ left: `${(d / HORIZON_DAYS) * 100}%` }}>
          <span className="absolute left-0 top-0 h-[4px] w-px bg-[var(--line-strong)]" />
          <span
            className={cn(MONO, "t-num absolute top-[9px] whitespace-nowrap text-[var(--text-2)]")}
            style={{ transform: d === 0 ? "none" : d === HORIZON_DAYS ? "translateX(-100%)" : "translateX(-50%)" }}
          >
            {d === 0 ? "Today" : `${d} d`}
          </span>
        </span>
      ))}
      {RENEWALS.map((r) => {
        const urgent = r.tone === "warn";
        const noticed = reminds.on && Boolean(r.remind);
        return (
          <span key={r.name} className="absolute top-[19px]" style={{ left: `${(r.days / HORIZON_DAYS) * 100}%` }}>
            <span className="t-num absolute -top-[19px] left-0 -translate-x-1/2 font-mono text-[9.5px] leading-none text-[var(--text-1)]">{r.days}</span>
            <span
              className="absolute -left-[3.5px] -top-[3.5px] h-[7px] w-[7px] rounded-full border"
              style={{
                borderColor: urgent ? toneColor.warn : "var(--line-strong)",
                background: urgent ? toneColor.warn : "var(--bg-2)",
              }}
            />
            {/* the agent's attention lands on the mark before it acts on the row */}
            <span
              className="absolute -left-[7.5px] -top-[7.5px] h-[15px] w-[15px] rounded-full border transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
              style={{
                borderColor: toneColor.warn,
                opacity: noticed ? 0.7 : 0,
                transform: noticed ? "none" : "scale(0.6)",
                transitionDelay: noticed ? wait(lag(reminds, startOf(r) + NOTICED)) : "0ms",
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
