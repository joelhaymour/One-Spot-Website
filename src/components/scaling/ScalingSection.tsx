"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SCALING } from "@/content/copy";
import { DEPARTMENT_BY_ID } from "@/content/departments";
import { ScrollStory } from "@/components/motion/ScrollStory";
import { SectionHeading } from "@/components/ui/Section";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { ScalingAgents } from "./ScalingAgents";
import { ScalingCaptions } from "./ScalingCaptions";
import { WorkSurface } from "./WorkSurface";
import { useQueueSim } from "./useQueueSim";

/**
 * Autonomous scaling: one agent, one queue, then a team.
 * The visitor should get it without reading: work piles up, the agent says so, two specialists take
 * their place beside it, and the same cards sort themselves into a lane under each.
 */

const marketing = DEPARTMENT_BY_ID.marketing;

const accentVars = { "--accent": marketing.accent, "--accent-rgb": marketing.accentRgb } as CSSProperties;

function Stage({ step }: { step: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [near, setNear] = useState(false);
  const reduce = useReducedMotion();
  const paused = useExperience((s) => s.paused);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onScreen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    // One screen early, once: time to fetch the 3D chunk and compile shaders before the stage sticks.
    const approaching = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        approaching.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    onScreen.observe(el);
    approaching.observe(el);
    return () => {
      onScreen.disconnect();
      approaching.disconnect();
    };
  }, []);

  const snapshot = useQueueSim(step, visible, reduce || paused);

  return (
    <div
      ref={root}
      className="mx-auto grid h-full w-full max-w-[1320px] gap-x-12 gap-y-4 px-[var(--gutter)] pb-5 pt-[calc(var(--nav-h)+8px)] max-md:grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.7fr)] md:grid-rows-[minmax(0,1fr)] md:items-center md:pb-8 md:pt-[calc(var(--nav-h)+16px)]"
      style={accentVars}
    >
      <ScalingCaptions className="max-md:order-2" />
      <div className="flex min-h-0 flex-col gap-3 max-md:order-1 md:h-full md:max-h-[860px] md:gap-4">
        <ScalingAgents step={step} near={near} className="max-md:h-[23svh] max-md:min-h-[132px] max-md:shrink-0 md:min-h-0 md:flex-[0.8]" />
        <WorkSurface step={step} snapshot={snapshot} className="flex-1" />
      </div>
    </div>
  );
}

interface ScalingSectionProps {
  /** Section number shown in the eyebrow. */
  index?: string;
}

export function ScalingSection({ index = "03" }: ScalingSectionProps) {
  return (
    <section id="scaling" className="relative" aria-labelledby="scaling-heading">
      <div className="mx-auto max-w-[1320px] px-[var(--gutter)] pb-8 pt-28 md:pt-40">
        <SectionHeading eyebrow={SCALING.eyebrow} index={index} title={<span id="scaling-heading">{SCALING.heading}</span>} lead={SCALING.lead} />
      </div>

      <ScrollStory steps={SCALING.beats.length} stepLength={0.95} tail={0.4} aria-label="One agent becomes a team, in five beats">
        {({ step }) => <Stage step={step} />}
      </ScrollStory>

      <div className="h-20 md:h-32" aria-hidden />
    </section>
  );
}
