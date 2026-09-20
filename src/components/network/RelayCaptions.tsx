"use client";

import type { CSSProperties } from "react";
import { CEO, DEPARTMENT_BY_ID } from "@/content/departments";
import { useStory } from "@/components/motion/ScrollStory";
import { cn } from "@/lib/cn";
import { RELAY, accentRgbOf, isDepartment, type RelayParty } from "./relay";

/**
 * The relay in words: an ordered list, always in the DOM, always complete. It is the text equivalent
 * of the canvas and the way to move through the story from the keyboard.
 *
 * Below 1024px the four buttons form a rail and the active caption shows beneath it (all four share
 * one grid cell, so the block never changes height). From 1024px it is a side list with the active beat lit.
 */

const partyName = (id: RelayParty) => (id === "owner" ? "You" : isDepartment(id) ? DEPARTMENT_BY_ID[id].name : CEO.name);

const TEXT_CELL: CSSProperties = { gridColumn: "1 / -1", gridRow: 2 };

export function RelayCaptions({ step, className }: { step: number; className?: string }) {
  const { goTo } = useStory();

  return (
    <div className={cn("grid grid-cols-4 gap-x-2 gap-y-4 lg:block", className)}>
      {/* At rest nobody is talking. The one who would hear it first introduces itself. */}
      <p
        style={TEXT_CELL}
        className={cn(
          "transition-opacity duration-500 ease-[var(--ease-out)] lg:mb-7 lg:border-l lg:border-[var(--line)] lg:pl-5",
          step === 0 ? "opacity-100" : "opacity-0 lg:opacity-100",
        )}
      >
        <span className="t-label block">{CEO.name}</span>
        <span className={cn("t-body mt-2.5 block transition-colors duration-500", step === 0 ? "!text-[var(--text-0)]" : "lg:!text-[var(--text-2)]")}>{CEO.oneLiner}</span>
      </p>

      <ol className="contents lg:block lg:border-l lg:border-[var(--line)]">
        {RELAY.map((beat, i) => {
          const n = i + 1;
          const active = step === n;
          const route = `${partyName(beat.from)} to ${partyName(beat.to)}`;
          return (
            <li key={beat.line} className="contents lg:relative lg:block lg:pl-5" style={{ "--accent-rgb": accentRgbOf(beat.from) } as CSSProperties}>
              {/* The lit edge: one hairline of the speaker's colour, the only accent in the list. */}
              <span
                aria-hidden
                className={cn(
                  "absolute -left-px top-0 hidden h-full w-px bg-[rgb(var(--accent-rgb))] transition-opacity duration-500 ease-[var(--ease-out)] lg:block",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <button
                type="button"
                onClick={() => goTo(n)}
                aria-current={active ? "step" : undefined}
                style={{ gridColumn: n, gridRow: 1 }}
                className={cn(
                  "group flex items-center gap-3 border-t py-3.5 text-left outline-none transition-colors duration-300 ease-[var(--ease-out)] focus-visible:ring-1 focus-visible:ring-[var(--text-1)] lg:w-full lg:border-t-0 lg:pb-0 lg:pt-5",
                  active ? "border-[var(--text-0)]" : step > n ? "border-[var(--line-strong)]" : "border-[var(--line)]",
                )}
              >
                <span className={cn("t-label t-num transition-colors duration-300", active ? "!text-[var(--text-0)]" : "group-hover:!text-[var(--text-1)]")}>
                  {String(n).padStart(2, "0")}
                </span>
                <span className={cn("t-label sr-only transition-colors duration-300 lg:not-sr-only", active ? "lg:!text-[var(--text-1)]" : "group-hover:!text-[var(--text-1)]")}>
                  {route}
                </span>
              </button>
              <div
                style={TEXT_CELL}
                className={cn("transition-opacity duration-500 ease-[var(--ease-out)] lg:pb-5 lg:pt-2.5 lg:opacity-100", active ? "opacity-100" : "pointer-events-none opacity-0 lg:pointer-events-auto")}
              >
                <span aria-hidden className="t-label mb-2.5 block lg:hidden">
                  {route}
                </span>
                <p className={cn("t-body transition-colors duration-500", active ? "!text-[var(--text-0)]" : step > n ? "!text-[var(--text-1)]" : "!text-[var(--text-2)]")}>{beat.caption}</p>
                <p className={cn("t-num mt-1.5 font-mono text-[0.75rem] leading-relaxed transition-colors duration-500", active ? "text-[var(--text-1)]" : "text-[var(--text-2)]")}>
                  {beat.speaker}: {beat.line}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
