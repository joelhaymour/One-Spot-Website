"use client";

import { memo, type ReactNode } from "react";
import { StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { CHECKS, FIELDS, FIELD_STAGGER, INVOICE, type FieldId } from "./data";
import { Appear, ConsolePanel, InReport, MONO, Swap, Tick, useAmbient, wait } from "./kit";

interface DocumentCheckPanelProps {
  active: boolean;
  /** The agent is reading the invoice right now. */
  scanning: boolean;
  /** Fields have been extracted and checked against the purchase order. */
  read: boolean;
  /** The two exceptions have been found. */
  flagged: boolean;
  reported: boolean;
}

const ORDER = Object.fromEntries(FIELDS.map((f, i) => [f.id, i])) as Record<FieldId, number>;
/** The fields that make invoice 4471 a duplicate: same number series, same order. */
const SUSPECT: FieldId[] = ["number", "po"];

interface FieldProps {
  id: FieldId;
  read: boolean;
  flagged: boolean;
  block?: boolean;
  children: ReactNode;
}

/** A region of the document. The outline is the agent's eye landing on it. */
function Field({ id, read, flagged, block, children }: FieldProps) {
  const warn = flagged && SUSPECT.includes(id);
  return (
    <span className={cn("relative", block ? "block" : "inline-block")}>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-1 -inset-y-[3px] rounded-[3px] border transition-[opacity,transform,border-color,background-color] duration-500 ease-[var(--ease-out)]"
        style={{
          opacity: read ? 1 : 0,
          transform: read ? "none" : "scale(1.05)",
          borderColor: warn ? "var(--warn)" : "rgba(var(--accent-rgb), 0.55)",
          background: warn ? "color-mix(in srgb, var(--warn) 9%, transparent)" : "rgba(var(--accent-rgb), 0.06)",
          transitionDelay: read && !warn ? wait(ORDER[id] * FIELD_STAGGER) : "0ms",
        }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

const Invoice = memo(function Invoice({ read, flagged }: { read: boolean; flagged: boolean }) {
  const field = { read, flagged };
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[7px] border border-[var(--line)] bg-white/[0.035] px-3 py-3 text-[9.5px] leading-[1.4] text-[var(--text-1)]">
      <div>
        <Field id="vendor" {...field}>
          <span className="text-[11px] font-medium leading-tight text-[var(--text-0)]">{INVOICE.vendor}</span>
        </Field>
        <div className="mt-0.5 text-[var(--text-2)]">{INVOICE.address}</div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className={cn(MONO, "text-[var(--text-2)]")}>Invoice</span>
        <Field id="number" {...field}>
          <span className="t-num text-[var(--text-0)]">No. {INVOICE.number}</span>
        </Field>
      </div>

      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-[5px]">
        <dt className="text-[var(--text-2)]">Bill to</dt>
        <dd className="text-right">{INVOICE.billTo}</dd>
        <dt className="text-[var(--text-2)]">Date</dt>
        <dd className="text-right">
          <Field id="date" {...field}>
            <span className="t-num">{INVOICE.date}</span>
          </Field>
        </dd>
        <dt className="text-[var(--text-2)]">Terms</dt>
        <dd className="text-right">
          <Field id="terms" {...field}>
            {INVOICE.terms}
          </Field>
        </dd>
        <dt className="text-[var(--text-2)]">Order</dt>
        <dd className="text-right">
          <Field id="po" {...field}>
            <span className="t-num">{INVOICE.po}</span>
          </Field>
        </dd>
      </dl>

      <div className="mt-3 border-t border-[var(--line)] pt-2.5">
        <Field id="lines" block {...field}>
          <ul className="flex flex-col gap-[5px]">
            {INVOICE.lines.map((line) => (
              <li key={line.label} className="flex justify-between gap-2">
                <span className="truncate">{line.label}</span>
                <span className="t-num">{line.amount}</span>
              </li>
            ))}
          </ul>
        </Field>
      </div>

      <dl className="mt-2.5 grid grid-cols-[1fr_auto] gap-y-[5px] border-t border-[var(--line)] pt-2.5">
        <dt className="text-[var(--text-2)]">Subtotal</dt>
        <dd className="t-num text-right">{INVOICE.subtotal}</dd>
        <dt className="text-[var(--text-2)]">Tax 10%</dt>
        <dd className="t-num text-right">{INVOICE.tax}</dd>
        <dt className="pt-1 text-[var(--text-0)]">Total due</dt>
        <dd className="pt-1 text-right">
          <Field id="total" {...field}>
            <span className="t-num text-[11px] font-medium text-[var(--text-0)]">{INVOICE.total}</span>
          </Field>
        </dd>
      </dl>

      <p className="mt-auto text-[var(--text-2)]">Bank transfer within 30 days.</p>
    </div>
  );
});

export const DocumentCheckPanel = memo(function DocumentCheckPanel({ active, scanning, read, flagged, reported }: DocumentCheckPanelProps) {
  const ambient = useAmbient();
  const checkedAt = FIELDS.length * FIELD_STAGGER + 160;

  return (
    <ConsolePanel
      label="Document check"
      active={active}
      scanning={scanning}
      className="flex gap-3"
      right={
        <>
          <InReport on={reported} order={1} />
          <Swap
            index={flagged ? 2 : read ? 1 : 0}
            className="justify-items-end"
            items={[
              <StatusChip key="queue">Next in queue</StatusChip>,
              <StatusChip key="reading" pulse={ambient && scanning}>
                Reading
              </StatusChip>,
              <StatusChip key="held" tone="warn">
                2 held
              </StatusChip>,
            ]}
          />
        </>
      }
    >
      <div className="flex w-[200px] shrink-0 flex-col gap-2">
        <div className={cn(MONO, "flex h-3 items-center justify-between text-[var(--text-2)]")}>
          <span>Invoice {INVOICE.number} · 1 page</span>
          <span>Email</span>
        </div>
        <Invoice read={read} flagged={flagged} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className={cn(MONO, "flex h-3 items-center justify-between text-[var(--text-2)]")}>
          <span>Extracted</span>
          <span>Against {INVOICE.po}</span>
        </div>

        <dl className="mt-1.5">
          {FIELDS.map((f, i) => (
            <div key={f.id} className="flex h-[21px] items-center gap-2 border-b border-[var(--line-faint)]">
              <dt className={cn(MONO, "w-[50px] shrink-0 text-[var(--text-2)]")}>{f.label}</dt>
              <dd className="min-w-0 flex-1">
                <Appear as="span" on={read} delay={i * FIELD_STAGGER + 120} y={0} x={-6} className="t-num block truncate text-[10.5px] text-[var(--text-0)]">
                  {f.value}
                </Appear>
              </dd>
              <Tick on={read} delay={i * FIELD_STAGGER + 300} size={11} />
            </div>
          ))}
        </dl>

        <Appear on={read} delay={checkedAt} y={4} className="mt-2 flex items-center gap-2 text-[10.5px] text-[var(--text-1)]">
          <Tick on={read} delay={checkedAt + 120} />
          <span>Amount and 3 lines agree with {INVOICE.po}</span>
        </Appear>

        <div className="mt-auto flex flex-col gap-1.5">
          <div className={cn(MONO, "flex h-3 items-center text-[var(--text-2)]")}>Checks across the week</div>
          {CHECKS.map((check, i) => (
            <Swap
              key={check.id}
              block
              index={flagged ? 1 : 0}
              delay={flagged ? i * 420 : 0}
              items={[
                <span key="clear" className="flex items-start gap-2 py-[3px]">
                  <Tick on size={11} color="var(--text-2)" className="mt-px" />
                  <span className="flex flex-col gap-[3px]">
                    <span className="text-[10.5px] leading-tight text-[var(--text-1)]">{check.label}</span>
                    <span className="text-[10px] leading-tight text-[var(--text-2)]">{check.clear}</span>
                  </span>
                </span>,
                <span
                  key="flag"
                  className="flex flex-col gap-[5px] rounded-[6px] border px-2 py-[7px]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--warn) 34%, transparent)",
                    background: "color-mix(in srgb, var(--warn) 7%, transparent)",
                  }}
                >
                  <span className="text-[10.5px] leading-[1.3] text-[var(--text-0)]">{check.flag}</span>
                  <span className={cn(MONO, "flex items-center gap-1.5 text-[var(--text-2)]")}>
                    <span className="text-[var(--warn)]">Held</span>
                    <span aria-hidden>·</span>
                    <span>{check.detail}</span>
                  </span>
                </span>,
              ]}
            />
          ))}
        </div>
      </div>
    </ConsolePanel>
  );
});
