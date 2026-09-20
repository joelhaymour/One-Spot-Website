"use client";

import { Dot, Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { ColumnLabel, Fade, Initials, Swap, Tick } from "../sales/kit";
import { HANDOFF, HANDOFF_DELAY_S, HANDOFF_DONE_MS, HANDOFF_SPEED, ON_SHIFT } from "./data";

/* Why it is handed over, to whom, with what, and only then the words the agent suggests. */
const AT = { customer: 250, upset: 650, value: 850, to: 1150, context: 1450 };

const ASSIGNEE = ON_SHIFT[0];

interface EscalationProps {
  /** The agent is handing (or has handed) the upset customer to a person. */
  escalated: boolean;
  active: boolean;
}

/** Region D. Who is on shift at rest; one hand-off, with the whole story attached, once the agent escalates. */
export function Escalation({ escalated, active }: EscalationProps) {
  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="Escalation"
        right={
          <Swap
            flipped={escalated}
            delayMs={HANDOFF_DONE_MS}
            align="end"
            first={<span className="t-label">{ON_SHIFT.length} on shift</span>}
            second={<StatusChip tone="neutral">Handed to Priya</StatusChip>}
          />
        }
      />
      <div className="relative h-[218px]">
        <Fade on={!escalated} y={0} className="absolute inset-0">
          <OnShift />
        </Fade>
        <Fade on={escalated} y={8} delayMs={150} className="absolute inset-0">
          <HandOff on={escalated} />
        </Fade>
      </div>
    </Panel>
  );
}

function OnShift() {
  return (
    <div className="px-3.5">
      <ul>
        {ON_SHIFT.map((person) => (
          <li key={person.name} className="flex items-center gap-3 border-t border-[var(--line-faint)] py-[9px] first:border-t-0">
            <Initials name={person.name} size={28} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] text-[var(--text-0)]">{person.name}</span>
              <span className="block truncate text-[10.5px] text-[var(--text-2)]">{person.role}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="flex items-center justify-end gap-1.5 text-[11px] text-[var(--text-1)]">
                <Dot tone={person.status === "Available" ? "ok" : "neutral"} />
                {person.status}
              </span>
              <span className="t-num block font-mono text-[10px] text-[var(--text-2)]">{person.open} open</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-1 border-t border-[var(--line-faint)] pt-2.5">
        <ColumnLabel>Goes to a person when</ColumnLabel>
        <p className="mt-1.5 text-[11px] text-[var(--text-1)]">The customer is upset, high value, or outside policy.</p>
      </div>
    </div>
  );
}

function HandOff({ on }: { on: boolean }) {
  return (
    <div className="px-3.5">
      <Fade on={on} y={4} delayMs={AT.customer} className="flex items-center gap-3 border-b border-[var(--line-faint)] pb-2.5">
        <Initials name={HANDOFF.customer} size={28} />
        <span className="min-w-0">
          <span className="block text-[12px] text-[var(--text-0)]">{HANDOFF.customer}</span>
          <span className="block truncate text-[10.5px] text-[var(--text-2)]">{HANDOFF.facts}</span>
        </span>
      </Fade>

      <div className="mt-2.5 flex items-center gap-1.5">
        {/* amber for the one thing that is wrong: how the customer feels */}
        <Fade as="span" on={on} y={0} delayMs={AT.upset} className="inline-flex">
          <StatusChip tone="warn">Upset</StatusChip>
        </Fade>
        <Fade as="span" on={on} y={0} delayMs={AT.value} className="inline-flex">
          <StatusChip tone="neutral">High value</StatusChip>
        </Fade>
        <Fade as="span" on={on} y={0} delayMs={AT.to} className="ml-auto truncate text-[10.5px] text-[var(--text-2)]">
          To <span className="text-[var(--text-0)]">{HANDOFF.to}</span> · {ASSIGNEE.role}
        </Fade>
      </div>

      <Fade on={on} y={0} delayMs={AT.context} className="mt-2 flex items-center gap-2">
        <Tick on={on} delayMs={AT.context + 150} />
        <span className="text-[11.5px] text-[var(--text-0)]">Context attached</span>
        <span className="ml-auto truncate text-[10.5px] text-[var(--text-2)]">{HANDOFF.context}</span>
      </Fade>

      {/* what the agent suggests the person says: theirs to send, or to change */}
      <Fade on={on} y={4} delayMs={AT.context + 250} className="mt-2.5 rounded-[9px] border border-[var(--line-strong)] bg-white/[0.04] px-3 py-2">
        <div className="t-label !text-[9px] !text-[var(--text-1)]">Suggested reply · for Priya to send</div>
        <p className="mt-1.5 text-[11px] leading-[15px] text-[var(--text-0)]">
          <TypedText text={HANDOFF.reply} active={on} speed={HANDOFF_SPEED} delay={HANDOFF_DELAY_S} />
        </p>
      </Fade>
    </div>
  );
}
