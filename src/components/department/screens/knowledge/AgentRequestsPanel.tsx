"use client";

import { Dot, Panel, PanelHeader } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { SERVED_EARLIER, SERVED_NOW, type AgentRequest } from "./data";
import { InReport, LABEL, MONO, Show, Swap, Tick, lag, type Stage } from "./kit";

interface AgentRequestsPanelProps {
  serves: Stage;
  reported: boolean;
  active: boolean;
  ambient: boolean;
}

/**
 * Region D. The other agents ask the same source of truth the team does. Machine traffic reads as a
 * compact mono log, so it cannot be mistaken for the human conversation in the Ask panel.
 */
export function AgentRequestsPanel({ serves, reported, active, ambient }: AgentRequestsPanelProps) {
  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="Agent requests"
        right={
          <>
            <InReport on={reported} order={3} />
            <span className={LABEL}>6 agents connected</span>
          </>
        }
      />

      <ul className="min-h-0 flex-1 px-3.5">
        {SERVED_EARLIER.map((r) => (
          <li key={r.asked}>
            <RequestRow request={r} served />
          </li>
        ))}
        {/* one request at a time: it arrives, it is looked up, it is served; then the next */}
        {SERVED_NOW.map((r, i) => (
          <Show as="li" key={r.asked} when={serves.on} delay={lag(serves, 150 + i * 1100)} y={8}>
            <RequestRow request={r} served={serves.on} servedDelay={lag(serves, 700 + i * 1100)} fresh />
          </Show>
        ))}
      </ul>

      <div className="flex h-[30px] shrink-0 items-center gap-2 px-3.5 pb-1">
        <Dot tone="ok" pulse={ambient} />
        <span className={LABEL}>Listening · same sources the team sees</span>
      </div>
    </Panel>
  );
}

interface RequestRowProps {
  request: AgentRequest;
  served: boolean;
  servedDelay?: number;
  /** Arrived during this shift: carries the panel's one accent mark. */
  fresh?: boolean;
}

function RequestRow({ request, served, servedDelay = 0, fresh }: RequestRowProps) {
  return (
    <div className="relative flex h-[44px] flex-col justify-center border-t border-[var(--line-faint)] pl-2.5">
      {fresh && <span aria-hidden className="absolute bottom-[9px] left-0 top-[9px] w-[2px] rounded-full" style={{ background: "rgb(var(--accent-rgb))" }} />}
      <div className="flex items-center justify-between">
        <span className={cn(MONO, "text-[var(--text-1)]")}>
          <span className="t-num text-[var(--text-2)]">{request.time}</span>
          <span className="ml-2">{request.agent}</span>
        </span>
        <Swap
          on={served}
          delay={servedDelay}
          align="end"
          from={<span className={LABEL}>Looking up</span>}
          to={
            <span className={cn(LABEL, "flex items-center gap-1.5")}>
              Served · <span className="t-num">{request.latency}</span>
              <Tick className="text-[var(--ok)]" />
            </span>
          }
        />
      </div>
      <div className="mt-[7px] flex items-center gap-1.5 truncate font-mono text-[10.5px] leading-none">
        <span className="text-[var(--text-0)]">{request.asked}</span>
        <span aria-hidden className="text-[var(--text-3)]">
          →
        </span>
        <span className="truncate text-[var(--text-2)]">{request.source}</span>
      </div>
    </div>
  );
}
