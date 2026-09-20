"use client";

import { Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { ColumnLabel, Fade, Swap } from "./kit";
import { PROPOSAL, PROPOSAL_QUEUE } from "./data";

interface ProposalDocProps {
  /** The agent is assembling (or has assembled) the Hartwell Partners proposal. */
  drafted: boolean;
  active: boolean;
}

/* Section by section, in reading order: scope, then pricing, then terms, then the hand-over to a person. */
const AT = { title: 250, scope: 650, pricing: 1250, terms: 2050, review: 2700 };

/** Region D. The proposals in flight at rest; one document, assembled from templates, once the agent writes it. */
export function ProposalDoc({ drafted, active }: ProposalDocProps) {
  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="Proposal"
        right={
          <Swap
            flipped={drafted}
            delayMs={AT.review}
            align="end"
            first={<span className="t-label">3 in flight</span>}
            second={<StatusChip tone="accent">Awaiting review</StatusChip>}
          />
        }
      />
      <div className="relative h-[218px]">
        <Fade on={!drafted} y={0} className="absolute inset-0">
          <InFlight />
        </Fade>
        <Fade on={drafted} y={8} delayMs={150} className="absolute inset-0">
          <Document on={drafted} />
        </Fade>
      </div>
    </Panel>
  );
}

function InFlight() {
  return (
    <div className="px-3.5">
      <ul>
        {PROPOSAL_QUEUE.map((p) => (
          <li key={p.account} className="flex items-center justify-between gap-3 border-t border-[var(--line-faint)] py-[10px] first:border-t-0">
            <span className="min-w-0">
              <span className="block truncate text-[12px] text-[var(--text-0)]">{p.account}</span>
              <span className="block truncate text-[10.5px] text-[var(--text-2)]">{p.detail}</span>
            </span>
            <StatusChip tone={p.status === "Won" ? "ok" : "neutral"}>{p.status}</StatusChip>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-[var(--line-faint)] pt-3">
        <ColumnLabel>Templates</ColumnLabel>
        <div className="mt-2 truncate text-[10.5px] text-[var(--text-1)]">{PROPOSAL.sources}</div>
      </div>
    </div>
  );
}

function Document({ on }: { on: boolean }) {
  return (
    <div className="mx-3.5 flex h-[206px] flex-col rounded-[8px] border border-[var(--line)] bg-white/[0.03] px-3.5 py-2.5">
      <Fade on={on} y={4} delayMs={AT.title} className="flex items-baseline justify-between border-b border-[var(--line-faint)] pb-1.5">
        <span className="text-[12.5px] font-medium tracking-[-0.01em] text-[var(--text-0)]">Proposal for {PROPOSAL.account}</span>
        <span className="t-num font-mono text-[9.5px] tracking-[0.06em] text-[var(--text-2)]">{PROPOSAL.ref}</span>
      </Fade>

      <div className="mt-2 grid grid-cols-[150px_minmax(0,1fr)] gap-x-4">
        <div>
          <Fade on={on} y={4} delayMs={AT.scope}>
            <ColumnLabel>Scope</ColumnLabel>
            <ul className="mt-1.5 space-y-1">
              {PROPOSAL.scope.map((line) => (
                <li key={line} className="flex gap-1.5 text-[10.5px] leading-[14px] text-[var(--text-1)]">
                  <span aria-hidden className="mt-[7px] h-px w-[5px] shrink-0 bg-[var(--text-3)]" />
                  {line}
                </li>
              ))}
            </ul>
          </Fade>
          <Fade on={on} y={4} delayMs={AT.terms} className="mt-2.5">
            <ColumnLabel>Terms</ColumnLabel>
            <p className="mt-1.5 text-[10.5px] leading-[14px] text-[var(--text-1)]">{PROPOSAL.terms}</p>
          </Fade>
        </div>

        <div>
          <Fade on={on} y={4} delayMs={AT.pricing}>
            <ColumnLabel>Pricing, per month</ColumnLabel>
          </Fade>
          <ul className="mt-1">
            {PROPOSAL.pricing.map((row, i) => (
              <Fade
                as="li"
                key={row.item}
                on={on}
                y={3}
                delayMs={AT.pricing + 120 + i * 130}
                className="flex items-baseline justify-between border-b border-[var(--line-faint)] py-1 text-[10.5px] leading-[14px]"
              >
                <span className="text-[var(--text-1)]">{row.item}</span>
                <span className="t-num font-mono text-[var(--text-0)]">{row.amount}</span>
              </Fade>
            ))}
          </ul>
          <Fade on={on} y={3} delayMs={AT.pricing + 560} className="flex items-baseline justify-between pt-1.5 text-[11px] leading-[14px]">
            <span className="text-[var(--text-0)]">Total</span>
            <span className="t-num font-mono text-[12px] text-[var(--text-0)]">{PROPOSAL.total}</span>
          </Fade>
        </div>
      </div>

      <Fade on={on} y={0} delayMs={AT.review} className="mt-auto truncate border-t border-[var(--line-faint)] pt-1.5 text-[9.5px] leading-[13px] text-[var(--text-2)]">
        Built from {PROPOSAL.sources}
      </Fade>
    </div>
  );
}
