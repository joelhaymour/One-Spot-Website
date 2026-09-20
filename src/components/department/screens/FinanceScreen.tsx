"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { Region, storyFlags, type ScreenProps } from "../contract";
import { DocumentCheckPanel } from "./finance/DocumentCheckPanel";
import { DocumentsPanel } from "./finance/DocumentsPanel";
import { ForecastPanel } from "./finance/ForecastPanel";
import { MonthEndPanel } from "./finance/MonthEndPanel";
import { covers, motionScale } from "./finance/kit";

/**
 * Finance Console: regions A to D of the Finance Agent's workstation.
 *
 *   A  Documents        the week's 214 invoices, receipts and statements; 212 matched, 2 held for review
 *   B  Document check   invoice 4471 read field by field against its purchase order; the two exceptions
 *   C  Month-end        profit and loss, cash position, overdue receivables, assembled in 4 minutes
 *   D  Cash forecast    13 weeks, corrected for customers paying 11 days late, low point marked
 *
 * A pure function of `step`. Nothing here listens to scroll: a step flips flags, and CSS transitions,
 * TypedText and AnimatedNumber play the change on time. Earlier results persist; scrolling back reverses them.
 */
export default function FinanceScreen({ department, step, current, live }: ScreenProps) {
  const reduce = useReducedMotion();

  // Until the workstation has arrived, hold the resting state of step 0.
  const f = storyFlags(department, live ? step : 0);
  const focus = live ? current.focus : null;
  const logOf = (id: string) => department.story.find((s) => s.id === id)?.log ?? "";

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-[12px] leading-[1.35] text-[var(--text-1)]" style={motionScale(reduce)}>
      <Region id="A">
        <DocumentsPanel
          active={covers(focus, "A")}
          scanning={live && f.is("documents")}
          fresh={live && f.is("documents")}
          open={f.reached("reads")}
          read={f.reached("reads")}
          held={f.reached("mismatch")}
          reconciled={f.reached("reconcile")}
          reported={f.reached("report")}
        />
      </Region>
      <Region id="B">
        <DocumentCheckPanel
          active={covers(focus, "B")}
          scanning={f.is("reads")}
          read={f.reached("reads")}
          flagged={f.reached("mismatch")}
          reported={f.reached("report")}
        />
      </Region>
      <Region id="C">
        <MonthEndPanel
          active={covers(focus, "C")}
          ready={f.reached("reconcile")}
          closed={f.reached("close")}
          reported={f.reached("report")}
          note={logOf("close")}
        />
      </Region>
      <Region id="D">
        <ForecastPanel active={covers(focus, "D")} learned={f.reached("forecast")} reported={f.reached("report")} note={logOf("forecast")} />
      </Region>
    </div>
  );
}
