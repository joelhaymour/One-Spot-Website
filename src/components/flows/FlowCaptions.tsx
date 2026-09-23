"use client";

import { FLOW_SCENARIOS } from "@/content/flows";
import { useStory } from "@/components/motion/ScrollStory";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { rowsOf } from "./engine";
import css from "./flows.module.css";

/**
 * The scenario in words: the rail to move between the three, the active one's title and summary, and a
 * log that fills in as the run plays (one row per completed hop, then One Spot's recommendation, then the
 * decision that reaches You). The log is the drawing's text equivalent: every row of the active scenario
 * is in the DOM from the start, visually hidden until reached, with no live region. Under reduced motion
 * the whole log is shown.
 */

const number = (i: number) => String(i + 1).padStart(2, "0");

export function FlowCaptions({ reached, className }: { reached: number; className?: string }) {
  const { step, goTo } = useStory();
  const reduced = useReducedMotion();
  const scenario = FLOW_SCENARIOS[step];
  const rows = rowsOf(scenario);
  const shown = reduced ? rows.length : reached;

  return (
    <div className={cn(css.captions, className)}>
      <nav aria-label="Scenarios" className={css.rail}>
        {FLOW_SCENARIOS.map((s, i) => {
          const active = i === step;
          return (
            <button key={s.id} type="button" onClick={() => goTo(i)} aria-current={active ? "step" : undefined} data-past={i < step} className={css.railItem}>
              <span aria-hidden className={css.railLine} />
              <span className={cn(css.railText, active ? "text-[var(--text-0)]" : "text-[var(--text-2)] hover:text-[var(--text-1)]")}>
                <span className="t-label t-num shrink-0 !text-[inherit]">{number(i)}</span>
                <span className={cn("t-label !text-[inherit] max-md:sr-only", css.railTitle)}>{s.title}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className={css.head}>
        {FLOW_SCENARIOS.map((s, i) => (
          <div key={s.id} className={cn(css.headItem, i === step && css.headOn)}>
            <h3 className={css.title}>{s.title}</h3>
            <p className={css.summary}>{s.summary}</p>
          </div>
        ))}
      </div>

      <ol className={css.log} aria-label="What happened">
        {rows.map((row, i) => (
          <li key={`${scenario.id}-${i}`} className={cn(css.row, i < shown ? "rise-in" : css.rowHidden)}>
            {row.kind === "hop" && (
              <>
                <span className={css.rowLabel}>{row.tool}</span>
                <span className={css.rowText}>{row.text}</span>
              </>
            )}
            {row.kind === "hub" && (
              <>
                <span className={css.rowLabel}>One Spot</span>
                <span className={css.rowText}>
                  {row.lines.map((line) => (
                    <span key={line} className={css.rowLine}>
                      {line}
                    </span>
                  ))}
                </span>
              </>
            )}
            {row.kind === "you" && (
              <>
                <span className={css.rowLabel}>You</span>
                <span className={css.rowText}>
                  <span className="sr-only">Your options: {row.actions.join(", ")}.</span>
                  <span className={css.rowChips} aria-hidden>
                    {row.actions.map((action, n) => (
                      <span key={action} className={cn(css.rowChip, n === 0 && css.rowChipPrimary)}>
                        {action}
                      </span>
                    ))}
                  </span>
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
