"use client";

import type { CSSProperties } from "react";
import { SCALING } from "@/content/copy";
import { CEO } from "@/content/departments";
import { Dot } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { UI } from "./script";

const recommendation = SCALING.recommendation;
const ceoVars = { "--accent-rgb": CEO.accentRgb } as CSSProperties;

interface DecisionCardProps {
  /** Beat 4 is active: the card is on screen and the recommendation is being written. */
  show: boolean;
  /** The recommendation has been read in full. Only after this may the owner's approval land. */
  onTyped: () => void;
  /** The owner's approval, shown under the chips. It follows the recommendation, never overtakes it. */
  confirmed: boolean;
  className?: string;
}

/**
 * The governance moment. The CEO Agent recommends two specialists; only the visitor, the owner, can
 * grant them. A picture of a decision, not a control: the chips are decoration and take no focus.
 */
export function DecisionCard({ show, onTyped, confirmed, className }: DecisionCardProps) {
  return (
    <div
      className={cn(
        "glass w-full max-w-[24rem] rounded-[12px] px-3.5 py-3 transition-[opacity,transform] duration-[480ms] ease-[var(--ease-out)]",
        show ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0",
        className,
      )}
      style={{ ...ceoVars, transitionDelay: show ? "200ms" : "0ms" }}
      aria-hidden={!show}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="spot" />
          <span className="t-label !text-[10px] !text-[var(--text-0)]">{UI.decision}</span>
        </span>
        <span className="t-label !text-[10px]">{recommendation.speaker}</span>
      </div>
      <p className="mt-2.5 text-[13px] leading-[1.4] tracking-[-0.004em] text-[var(--text-0)]">
        <TypedText text={recommendation.line} active={show} speed={60} delay={0.4} onDone={onTyped} />
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2" aria-hidden>
        {recommendation.actions.map((label, i) => (
          <span
            key={label}
            className={cn(
              "inline-flex h-7 items-center whitespace-nowrap rounded-[8px] border px-2.5 text-[12px]",
              i === 0 ? "border-transparent bg-[var(--text-0)] font-medium text-[#08090b]" : "border-[var(--line-strong)] text-[var(--text-1)]",
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <p
        className="mt-2.5 flex items-center gap-1.5 transition-opacity duration-[420ms] ease-[var(--ease-out)]"
        style={{ opacity: confirmed ? 1 : 0 }}
        aria-hidden={!confirmed}
      >
        <Dot tone="ok" />
        <span className="t-label !text-[10px] !text-[var(--text-0)]">{recommendation.approved}</span>
      </p>
    </div>
  );
}
