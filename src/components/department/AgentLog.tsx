"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { StoryStep } from "@/content/departments";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { gsap, EASE } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { logTime } from "./story";

interface AgentLogProps {
  story: StoryStep[];
  step: number;
  /** The agent only starts writing once the workstation has arrived. */
  live: boolean;
}

/**
 * Region E of every console: what the agent writes down while it works.
 * One line per step reached, newest at the bottom and typed in front of the visitor; earlier lines
 * dim and scroll away under the header like a terminal.
 */
export function AgentLog({ story, step, live }: AgentLogProps) {
  const list = useRef<HTMLOListElement>(null);
  const height = useRef<number | null>(null);
  const lines = story.slice(0, step + 1);

  // FLIP for the whole list: the new line changes layout once, then the list slides by exactly that
  // much, so the log scrolls with a transform instead of jumping.
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const next = el.offsetHeight;
    const delta = height.current === null ? 0 : next - height.current;
    height.current = next;
    if (delta === 0) return;
    // A fast flick can land here mid-slide: carry the offset over so the list never jumps.
    const carried = Number(gsap.getProperty(el, "y")) || 0;
    gsap.killTweensOf(el);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { clearProps: "transform" });
      return;
    }
    gsap.fromTo(el, { y: carried + delta }, { y: 0, duration: 0.42, ease: EASE.ui, clearProps: "transform" });
  }, [step]);

  useEffect(() => {
    const el = list.current;
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  return (
    <Panel active={story[step]?.focus === "E"} className="flex h-full w-full flex-col overflow-hidden">
      <PanelHeader
        label="Agent log"
        right={
          <span className="t-label t-num">
            {lines.length} {lines.length === 1 ? "entry" : "entries"}
          </span>
        }
      />
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ maskImage: "linear-gradient(180deg, transparent 0, #000 30px)", WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 30px)" }}
      >
        <ol ref={list} className="absolute inset-x-3.5 bottom-3.5 flex flex-col gap-[7px]">
          {lines.map((s, i) => {
            const newest = i === lines.length - 1;
            return (
              <li key={s.id} className="grid grid-cols-[36px_minmax(0,1fr)] gap-2.5 font-mono text-[10.5px] leading-[1.5]">
                <span className={cn("t-num transition-colors duration-500", newest ? "text-[rgb(var(--accent-rgb))]" : "text-[var(--text-3)]")}>
                  {logTime(i)}
                </span>
                <span className={cn("transition-colors duration-500", newest ? "text-[var(--text-0)]" : "text-[var(--text-2)]")}>
                  {newest ? <TypedText text={s.log} active={live} speed={54} /> : s.log}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </Panel>
  );
}
