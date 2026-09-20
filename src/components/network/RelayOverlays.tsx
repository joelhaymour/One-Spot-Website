import type { CSSProperties } from "react";
import { CEO } from "@/content/departments";
import { cn } from "@/lib/cn";
import type { ChipAnchor } from "./flat";
import { RELAY, accentRgbOf, agentSlot } from "./relay";
import styles from "./network.module.css";

/**
 * What is being said, next to whoever is saying it. Visual only (aria-hidden): the caption list carries
 * the same lines for assistive technology, in order, whatever the scroll position.
 */

interface RelayChipsProps {
  step: number;
  /** AGENT_ORDER slots, percent of the frame. Only used from 768px; below that every chip shares one slot at the foot of the scene. */
  anchors: ChipAnchor[];
  /** Seconds into each step at which its speaker speaks. Index 0 is step 1. */
  delays: number[];
}

export function RelayChips({ step, anchors, delays }: RelayChipsProps) {
  return (
    <>
      {RELAY.map((beat, i) => {
        if (beat.to === "owner") return null;
        const on = step === i + 1;
        const anchor = anchors[agentSlot(beat.from)];
        return (
          <div
            key={beat.line}
            aria-hidden
            className={cn(styles.chip, "z-10")}
            data-align={anchor.align}
            style={{ "--x": `${anchor.x}%`, "--y": `${anchor.y}%`, "--accent-rgb": accentRgbOf(beat.from) } as CSSProperties}
          >
            <div
              className={cn(
                "glass rounded-[10px] px-3.5 py-3 transition-[opacity,transform] duration-[420ms] ease-[var(--ease-out)]",
                on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
              )}
              style={{ transitionDelay: on ? `${Math.round(delays[i] * 1000)}ms` : "0ms" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="spot" />
                <span className="t-label !text-[var(--text-1)]">{beat.speaker}</span>
              </div>
              <p className="t-num mt-2 text-[0.9375rem] leading-snug tracking-[-0.01em] text-[var(--text-0)]">{beat.line}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}

const ACTIONS = ["Approve", "Review", "Not now"] as const;

interface OwnerNotificationProps {
  step: number;
  /** Seconds into the step at which word reaches the owner. */
  delay: number;
}

/** The last beat leaves the scene: the message is for the visitor, so it arrives as interface, not as light. */
export function OwnerNotification({ step, delay }: OwnerNotificationProps) {
  const index = RELAY.findIndex((beat) => beat.to === "owner");
  if (index < 0) return null;
  const beat = RELAY[index];
  const on = step === index + 1;

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-3 z-20 flex justify-center lg:bottom-6" aria-hidden={!on}>
      <div
        role="group"
        aria-label={`${beat.speaker}, from the ${CEO.name}`}
        className={cn(
          "glass w-full max-w-[27rem] rounded-[14px] p-4 transition-[opacity,transform] duration-[480ms] ease-[var(--ease-out)] sm:p-5",
          on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
        style={{ transitionDelay: on ? `${Math.round(delay * 1000)}ms` : "0ms" }}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2.5">
            <span className="spot" />
            <span className="t-label !text-[var(--text-0)]">{beat.speaker}</span>
          </span>
          <span className="t-label">{CEO.name}</span>
        </div>
        <p className="t-num mt-3 text-[1rem] leading-snug tracking-[-0.012em] text-[var(--text-0)]">{beat.line}</p>
        {/* A picture of a decision, not a control: nothing here can be operated, so nothing here takes focus. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {ACTIONS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-disabled="true"
              tabIndex={-1}
              className={cn(
                "h-8 cursor-default whitespace-nowrap rounded-[8px] border px-3 text-[0.8125rem]",
                i === 0 ? "border-transparent bg-[var(--text-0)] font-medium text-[#08090b]" : "border-[var(--line-strong)] text-[var(--text-1)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
