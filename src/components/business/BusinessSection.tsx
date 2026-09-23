"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BUSINESS } from "@/content/copy";
import { AgentSlot } from "@/components/agent/AgentSlot";
import { VirtualDisplay } from "@/components/display/VirtualDisplay";
import { BusinessHud, HUD_SIZE, TAB_STEP, type HubTab } from "@/components/hud/BusinessHud";
import { MobileBusiness } from "@/components/hud/MobileBusiness";
import { CinematicSlot } from "@/components/media/CinematicSlot";
import { useHudScript } from "@/components/hud/useHudScript";
import { ScrollStory, useStory } from "@/components/motion/ScrollStory";
import { registerStage } from "@/components/motion/Transition";
import { Eyebrow } from "@/components/ui/Section";
import { useMediaQuery, useMounted } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";

/**
 * The Hub, chapter 02 (right after How we work): one display, two tabs, four beats.
 *
 * The frame never moves: the chapter heading sits in a compact row above the display, the CEO Agent
 * docks small between them, and the display fills what is left of the viewport. The story happens on
 * the screen: black and "See more.", then the Dashboard; black and "Do less.", then To Do. From the
 * Dashboard every department is a door.
 *
 * Desktop scrolls the story (a discrete step per beat; the fades inside are CSS). Phones get the same
 * HTML in normal flow: the display is atmosphere, and the two tabs repeat as a native stack below.
 */

function Scene({ index, step }: { index: string; step: number }) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();
  const stage = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const { goTo } = useStory();

  const { state } = useHudScript(visible);

  const selectTab = useCallback((tab: HubTab) => goTo(TAB_STEP[tab]), [goTo]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    registerStage(el);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => {
      io.disconnect();
      registerStage(null);
      // The store outlives this page: never come back to a door that still thinks it is hovered.
      const s = useExperience.getState();
      s.setHoveredDept(null);
      s.setGazeTarget(null);
    };
  }, []);

  // A door under a still pointer gets no leave event when the Dashboard fades out from under it.
  useEffect(() => {
    if (step === TAB_STEP.dashboard) return;
    const s = useExperience.getState();
    s.setHoveredDept(null);
    s.setGazeTarget(null);
  }, [step]);

  // Coming back out of a department: the display settles from slightly too close.
  const phase = useExperience((s) => s.phase);
  useEffect(() => {
    const el = stage.current;
    if (phase !== "returning" || !el) return;
    const anim = el.animate(
      [
        { transform: "scale(1.12)", opacity: 0.4 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 1100, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    return () => anim.cancel();
  }, [phase]);

  return (
    <div ref={stage} className="stage-hub relative h-full w-full max-md:flex max-md:flex-col max-md:items-center max-md:px-[var(--gutter)] max-md:pb-6 max-md:pt-24">
      <CinematicSlot slot="business-room" className="max-md:hidden" />

      {/* the chapter heading: the chapter's own title on phones, a compact row above the display from md up.
          The two blocks stay clear of the middle, where the agent docks. */}
      <div className="stage-heading z-10 max-md:max-w-[46rem] md:absolute md:left-1/2 md:flex md:-translate-x-1/2 md:items-end md:justify-between md:pb-3">
        <div className="md:max-w-[min(25rem,34%)]">
          <Eyebrow index={index}>{BUSINESS.eyebrow}</Eyebrow>
          <h2
            id="business-heading"
            className="t-title mt-7 md:mt-3 md:text-[clamp(1.25rem,1.9vw,1.75rem)] md:leading-[1.1] md:tracking-[-0.03em] md:text-[var(--text-0)]"
          >
            {BUSINESS.heading}
          </h2>
        </div>
        <p className="t-lead mt-6 max-w-[30rem] md:mt-0 md:max-w-[min(19rem,30%)] md:text-right md:text-[0.9rem] md:leading-[1.45]">{BUSINESS.lead}</p>
      </div>

      {/* the CEO Agent, docked small between the heading and the lead */}
      <div className="stage-agent pointer-events-none z-20 max-md:mt-6 max-md:h-[300px] max-md:w-[285px] md:absolute md:left-1/2 md:-translate-x-1/2">
        <AgentSlot agent="ceo" mood="idle" followHover pulseCount={state.spoke} className="h-full w-full" deferMs={500} />
      </div>

      {/* the display */}
      <div className="stage-display z-0 max-md:mt-2 max-md:w-full md:absolute md:left-1/2 md:-translate-x-1/2" inert={mounted && !desktop}>
        <VirtualDisplay width={HUD_SIZE.width} height={HUD_SIZE.height} label="One Spot Hub: a live view of one company">
          {/* Before mount (and without JS) the still is the Dashboard: revenue, metrics and seven real doors.
              Phones have no story and stay on 0; the display shows the Dashboard by CSS there. */}
          <BusinessHud state={state} step={!mounted ? TAB_STEP.dashboard : desktop ? step : 0} interactive={desktop} onSelectTab={selectTab} />
        </VirtualDisplay>
      </div>
    </div>
  );
}

export function BusinessSection({ index = "02" }: { index?: string }) {
  return (
    <section id="business" className="relative" aria-labelledby="business-heading">
      <ScrollStory
        steps={4}
        stepLength={0.9}
        tail={0.6}
        aria-label="One Spot Hub: your whole company on one display"
        className="max-md:!h-auto"
        stageClassName="max-md:!static max-md:!h-auto max-md:!overflow-visible"
      >
        {({ step }) => <Scene index={index} step={step} />}
      </ScrollStory>
      {/* "The doors": where Back to the Hub and keyboard focus land, which must be the Dashboard step.
          Where ScrollStory.goTo(1) lands: the stage is stuck for 4 x 0.9 + 0.6 = 4.2 viewports, the
          steps end at 3.6 / 4.2 of that, and goTo aims 0.35 into the step, so
          4.2 x (3.6 / 4.2) x (1.35 / 4) = 1.215 viewports, rounded to 122svh. On phones: the native list. */}
      <span id="business-doors" aria-hidden className="block h-0 md:absolute md:top-[122svh]" />
      {/* Phones: the display above is atmosphere; both tabs repeat here at native size. */}
      <MobileBusiness heading={false} />
    </section>
  );
}
