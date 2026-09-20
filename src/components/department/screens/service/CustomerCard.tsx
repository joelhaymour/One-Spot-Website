"use client";

import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Dot, Panel, PanelHeader, ScanLine, StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { ColumnLabel, HBar, Initials, Swap, Tag, useDelayed, wait } from "../sales/kit";
import { CUSTOMER, MESSAGE, REQUESTS } from "./data";

/* In reading order: her words, then who she is, then what she needs, how urgent, how sure. */
const AT = { words: 450, record: 1000, request: 1800, urgency: 2500, sure: 2900, verdict: 3500 };

const NEWEST = REQUESTS[0];

interface CustomerCardProps {
  /** The agent has read the newest request and looked the customer up. */
  understood: boolean;
  active: boolean;
  scanning: boolean;
}

/** Region B. The newest message at rest; the customer's record and the classified request once the agent has read it. */
export function CustomerCard({ understood, active, scanning }: CustomerCardProps) {
  const sure = useDelayed(understood, AT.sure);

  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="Customer"
        right={
          <Swap
            flipped={understood}
            delayMs={AT.verdict}
            align="end"
            first={<span className="t-label">Newest request</span>}
            second={<StatusChip tone="ok">{CUSTOMER.policy}</StatusChip>}
          />
        }
      />

      <div className="px-3.5">
        <div className="flex items-center gap-3 border-b border-[var(--line-faint)] pb-3 pt-1">
          <Initials name={CUSTOMER.name} size={30} />
          <span className="min-w-0">
            <span className="block text-[12.5px] text-[var(--text-0)]">{CUSTOMER.name}</span>
            <span className="block truncate text-[10.5px] text-[var(--text-2)]">{NEWEST.subject}</span>
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            <Tag>{NEWEST.channel}</Tag>
            <span className="t-num font-mono text-[10.5px] text-[var(--text-2)]">{NEWEST.received}</span>
          </span>
        </div>

        {/* what she wrote */}
        <div className="relative mt-3 overflow-hidden rounded-[9px] border border-[var(--line)] bg-white/[0.02] px-3 py-2.5">
          <div className="t-label !text-[9px]">Message</div>
          <p className="mt-2 text-[12px] leading-[1.5] text-[var(--text-1)]">
            {MESSAGE.map((part, i) =>
              part.key ? (
                // the words the request is classified from, marked as the agent picks them up
                <span
                  key={i}
                  className={cn(
                    "border-b transition-colors duration-700 ease-[var(--ease-out)]",
                    understood ? "border-[var(--line-strong)] text-[var(--text-0)]" : "border-transparent",
                  )}
                  style={{ transitionDelay: understood ? wait(AT.words + i * 90) : "0ms" }}
                >
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </p>
          <ScanLine active={scanning} duration={1.4} />
        </div>

        {/* who she is */}
        <div className="mt-3.5">
          <ColumnLabel>Record</ColumnLabel>
          <dl className="mt-1">
            {CUSTOMER.record.map((row, i) => (
              <div key={row.label} className="flex h-[25px] items-center justify-between gap-4 border-b border-[var(--line-faint)]">
                <dt className="shrink-0 text-[11px] text-[var(--text-2)]">{row.label}</dt>
                <dd className="min-w-0 text-[11.5px] text-[var(--text-0)]">
                  <Pending on={understood} delayMs={AT.record + i * 160} align="end">
                    {row.value}
                  </Pending>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* what the agent makes of it */}
        <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_88px_118px] gap-x-4 rounded-[9px] border border-[var(--line-strong)] bg-white/[0.04] px-3 py-2">
          <div className="min-w-0">
            <dt className="t-label !text-[9px] !text-[var(--text-1)]">Request</dt>
            <dd className="mt-1.5 text-[12px] leading-[16px] text-[var(--text-0)]">
              <Pending on={understood} delayMs={AT.request}>
                <TypedText text={CUSTOMER.intent} active={understood} speed={40} delay={AT.request / 1000} />
              </Pending>
            </dd>
          </div>
          <div>
            <dt className="t-label !text-[9px] !text-[var(--text-1)]">Urgency</dt>
            <dd className="mt-1.5 text-[12px] leading-[16px] text-[var(--text-0)]">
              <Pending on={understood} delayMs={AT.urgency}>
                <span className="inline-flex items-center gap-1.5">
                  <Dot tone="ok" />
                  {CUSTOMER.urgency}
                </span>
              </Pending>
            </dd>
          </div>
          <div>
            <dt className="t-label !text-[9px] !text-[var(--text-1)]">Confidence</dt>
            <dd className="mt-1.5 flex items-center gap-2 text-[12px] leading-[16px] text-[var(--text-0)]">
              <Pending on={sure}>
                <AnimatedNumber value={sure ? Math.round(CUSTOMER.confidence * 100) : 0} suffix="%" duration={0.9} />
              </Pending>
              <HBar value={CUSTOMER.confidence} on={sure} className="flex-1" />
            </dd>
          </div>
        </dl>
      </div>
    </Panel>
  );
}

/** A field the agent has not filled in yet: a quiet dash, then the value, in the same slot. */
function Pending({ on, delayMs, align, children }: { on: boolean; delayMs?: number; align?: "start" | "end"; children: ReactNode }) {
  return (
    <Swap
      flipped={on}
      delayMs={delayMs}
      align={align}
      first={
        <span aria-hidden className="text-[var(--text-3)]">
          —
        </span>
      }
      second={children}
    />
  );
}
