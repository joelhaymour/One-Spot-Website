"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { ColumnLabel, Fade, Swap, Tag, Tick, useDelayed, useStepped } from "./kit";
import { CRM, LOGGED_ACTIVITY, STALE_ACTIVITY, type Activity } from "./data";

const ROW_H = 28;
const WINDOW = 5;

interface CrmActivityProps {
  /** The agent is logging (or has logged) the morning's activity. */
  logged: boolean;
  active: boolean;
}

/** Region C. What people left half-filled at rest; the agent's entries push it out, one at a time. */
export function CrmActivity({ logged, active }: CrmActivityProps) {
  const entries = useStepped(logged, LOGGED_ACTIVITY.length, 300, 350);
  const clean = useDelayed(logged, 1900);

  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="CRM activity"
        right={
          <Swap
            flipped={clean}
            align="end"
            first={<span className="t-label">Last full update Mon</span>}
            second={<StatusChip tone="ok">Up to date</StatusChip>}
          />
        }
      />

      <div className="flex items-start justify-between gap-3 px-3.5">
        <div className="min-w-0">
          <ColumnLabel>Logged this morning</ColumnLabel>
          <div className="mt-2 flex items-baseline gap-2">
            <AnimatedNumber value={logged ? CRM.logged : 0} duration={1.7} className="text-[24px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]" />
            <Fade as="span" on={logged} y={0} delayMs={1500} className="truncate text-[10px] text-[var(--text-2)]">
              {CRM.breakdown}
            </Fade>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <ColumnLabel>Stale fields</ColumnLabel>
          {/* amber while something is wrong, and only then */}
          <div className="mt-2 transition-colors duration-700 ease-[var(--ease-out)]" style={{ color: clean ? "var(--text-0)" : "var(--warn)" }}>
            <AnimatedNumber value={clean ? 0 : CRM.stale} duration={1.2} className="text-[24px] font-medium leading-none tracking-[-0.03em]" />
          </div>
        </div>
      </div>

      <div className="mx-3.5 mt-3 overflow-hidden border-t border-[var(--line-faint)]" style={{ height: ROW_H * WINDOW }}>
        <ul
          className="transition-transform duration-[520ms] ease-[var(--ease-out)]"
          style={{ transform: `translate3d(0, ${-(LOGGED_ACTIVITY.length - entries) * ROW_H}px, 0)` }}
        >
          {LOGGED_ACTIVITY.map((a, i) => (
            <ActivityRow key={a.who} activity={a} done shown={entries >= LOGGED_ACTIVITY.length - i} />
          ))}
          {STALE_ACTIVITY.map((a) => (
            <ActivityRow key={a.who} activity={a} shown />
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function ActivityRow({ activity: a, done = false, shown }: { activity: Activity; done?: boolean; shown: boolean }) {
  return (
    <li className="flex items-center gap-2.5 border-b border-[var(--line-faint)]" style={{ height: ROW_H }} aria-hidden={shown ? undefined : true}>
      <Tag className="w-[40px] justify-center">{a.kind}</Tag>
      <span className="min-w-0 flex-1 truncate text-[11.5px]">
        <span className="text-[var(--text-0)]">{a.who}</span>
        <span className="text-[var(--text-2)]"> · {a.note}</span>
      </span>
      <span className="t-num font-mono text-[10px] text-[var(--text-2)]">{a.when}</span>
      {done ? (
        <Tick on={shown} delayMs={220} />
      ) : (
        // an open ring: the field a person never filled in
        <span aria-hidden className="h-[13px] w-[13px] shrink-0 rounded-[3.5px] border border-dashed border-[var(--line-strong)]" />
      )}
    </li>
  );
}
