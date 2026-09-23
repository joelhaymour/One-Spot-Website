"use client";

import { useState } from "react";
import { FLOWS } from "@/content/copy";
import { FLOW_SCENARIOS } from "@/content/flows";
import { ScrollStory } from "@/components/motion/ScrollStory";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { FlowCaptions } from "./FlowCaptions";
import { FlowStage } from "./FlowStage";
import { OVERVIEW, type Picture } from "./engine";

/**
 * In action. The after ring from the hero, with three things that happen in every business routed
 * around it as full animations, one per scroll step. Each follows the same five beats (the pattern under
 * the heading): something happens, One Spot finds the relevant information, work moves between the right
 * systems, One Spot connects the dots, you receive one clear decision. Only the systems a scenario names
 * take part; the rest stay dimmed.
 */

function Stage({ step }: { step: number }) {
  // The picture of the run, shared by the drawing (which writes it) and the captions (which read the log).
  const [pic, setPic] = useState<Picture>(OVERVIEW);
  // A new step resets the ring before its run begins, in the same render, so nothing of the last one shows.
  const [seen, setSeen] = useState(step);
  if (seen !== step) {
    setSeen(step);
    setPic(OVERVIEW);
  }
  return (
    <div className="mx-auto grid h-full w-full max-w-[1320px] gap-x-12 gap-y-3 px-[var(--gutter)] pb-4 pt-[calc(var(--nav-h)+8px)] max-md:grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.7fr)] md:grid-rows-[minmax(0,1fr)] md:items-center md:gap-y-4 md:pb-8 md:pt-[calc(var(--nav-h)+16px)]">
      <FlowCaptions reached={pic.reached} className="min-h-0 max-md:order-2" />
      <div className="flex min-h-0 items-center justify-center max-md:order-1 md:h-full">
        <FlowStage step={step} pic={pic} setPic={setPic} />
      </div>
    </div>
  );
}

export function FlowsSection({ index = "05" }: { index?: string }) {
  return (
    <section id="in-action" className="relative" aria-labelledby="in-action-heading">
      <div className="mx-auto max-w-[1320px] px-[var(--gutter)] pb-8 pt-28 md:pt-40">
        <SectionHeading eyebrow={FLOWS.eyebrow} index={index} title={<span id="in-action-heading">{FLOWS.heading}</span>} lead={FLOWS.lead} />
        {/* the five beats every scenario follows */}
        <Reveal delay={0.24}>
          <ol className="mt-7 flex max-w-[46rem] flex-wrap items-center gap-x-2.5 gap-y-2" aria-label="The pattern every scenario follows">
            {FLOWS.pattern.map((beat, i) => (
              <li key={beat} className="flex items-center gap-2.5">
                {i > 0 && (
                  <span aria-hidden className="font-mono text-[0.75rem] leading-none text-[var(--text-3)]">
                    {"→"}
                  </span>
                )}
                <span className="t-label">{beat}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <ScrollStory steps={FLOW_SCENARIOS.length} stepLength={1.1} tail={0.5} aria-label="Three things that happen in every business, routed by One Spot">
        {({ step }) => <Stage step={step} />}
      </ScrollStory>

      <div className="h-20 md:h-32" aria-hidden />
    </section>
  );
}
