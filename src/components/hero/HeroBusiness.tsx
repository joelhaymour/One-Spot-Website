"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BUSINESS, HERO } from "@/content/copy";
import { AgentSlot } from "@/components/agent/AgentSlot";
import { VirtualDisplay } from "@/components/display/VirtualDisplay";
import { BusinessHud, HUD_SIZE } from "@/components/hud/BusinessHud";
import { MobileBusiness } from "@/components/hud/MobileBusiness";
import { CinematicSlot } from "@/components/media/CinematicSlot";
import { useHudScript } from "@/components/hud/useHudScript";
import { ScrollStory, useStoryProgress } from "@/components/motion/ScrollStory";
import { registerStage } from "@/components/motion/Transition";
import { Eyebrow } from "@/components/ui/Section";
import { clamp, easeInOutCubic, lerp, segment } from "@/lib/math";
import { useMediaQuery } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";

/**
 * Hero and "The Business" are one continuous camera move.
 *
 * Landing: five words, the CEO Agent, and the top of a live display tilted away from you.
 * Scroll: the words leave, the display straightens and rises to fill the frame, the agent docks above
 * it and starts looking at whatever you point at. From there every department is a door.
 *
 * Desktop scrubs transforms from scroll progress (written straight to style: no React per frame).
 * Phones get the same HTML in normal flow: the display is atmosphere, the doors are a native list below.
 */

const NAV_H = 64;

interface Geometry {
  width: number;
  top: number;
  landingY: number;
  agentH: number;
  agentLandingX: number;
  agentLandingY: number;
  agentFinalScale: number;
  agentFinalY: number;
}

function measure(): Geometry {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const zone = clamp(vh * 0.17, 112, 176);
  const width = Math.min(vw * 0.94, 1560, ((vh - NAV_H - zone - 26) * HUD_SIZE.width) / HUD_SIZE.height);
  const top = NAV_H + zone;
  const agentH = clamp(vh * 0.52, 300, 520);
  const finalH = zone + 34;
  return {
    width,
    top,
    landingY: vh * 0.6 - top,
    agentH,
    agentLandingX: Math.min(vw * 0.23, 360),
    agentLandingY: vh * 0.085,
    agentFinalScale: finalH / agentH,
    agentFinalY: NAV_H - 14,
  };
}

function Scene() {
  const desktop = useMediaQuery("(min-width: 768px)");
  const text = useRef<HTMLDivElement>(null);
  const agent = useRef<HTMLDivElement>(null);
  const display = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const geo = useRef<Geometry | null>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(true);
  const stage = useRef<HTMLDivElement>(null);

  const { state, showRecommendation } = useHudScript(visible);

  const write = (p: number) => {
    const g = geo.current;
    if (!g || !display.current || !agent.current || !text.current || !heading.current) return;
    const t = easeInOutCubic(clamp(p / 0.56));
    const out = segment(p, 0, 0.2);
    text.current.style.opacity = String(1 - out);
    text.current.style.transform = `translate3d(0, ${-40 * out}px, 0)`;
    text.current.style.pointerEvents = out > 0.6 ? "none" : "auto";
    if (hint.current) hint.current.style.opacity = String(1 - segment(p, 0, 0.08));

    display.current.style.transform = `translate3d(-50%, ${lerp(g.landingY, 0, t)}px, 0) perspective(1800px) rotateX(${lerp(15, 0, t)}deg) scale(${lerp(1.05, 1, t)})`;

    const s = lerp(1, g.agentFinalScale, t);
    agent.current.style.transform = `translate3d(calc(-50% + ${lerp(g.agentLandingX, 0, t)}px), ${lerp(g.agentLandingY, g.agentFinalY, t)}px, 0) scale(${s})`;

    const inn = segment(p, 0.42, 0.58);
    heading.current.style.opacity = String(inn);
    heading.current.style.transform = `translate3d(0, ${(1 - inn) * 16}px, 0)`;
  };

  useLayoutEffect(() => {
    if (!desktop) {
      for (const el of [text.current, agent.current, display.current, heading.current]) el?.removeAttribute("style");
      return;
    }
    const apply = () => {
      geo.current = measure();
      const g = geo.current;
      if (display.current) {
        display.current.style.width = `${g.width}px`;
        display.current.style.top = `${g.top}px`;
      }
      if (agent.current) {
        agent.current.style.height = `${g.agentH}px`;
        agent.current.style.width = `${g.agentH * 0.95}px`;
      }
      if (heading.current) {
        heading.current.style.width = `${g.width}px`;
        heading.current.style.top = `${NAV_H + 8}px`;
        heading.current.style.height = `${g.top - NAV_H - 16}px`;
      }
      write(progress.current);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [desktop]);

  useStoryProgress((p) => {
    progress.current = p;
    if (desktop) write(p);
  });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    registerStage(el);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => {
      io.disconnect();
      registerStage(null);
    };
  }, []);

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
    <div ref={stage} className="relative h-full w-full max-md:flex max-md:flex-col max-md:items-center max-md:px-[var(--gutter)] max-md:pb-10 max-md:pt-[calc(var(--nav-h)+28px)]">
      <CinematicSlot slot="hero-room" className="max-md:hidden" />

      {/* words */}
      <div
        ref={text}
        className="z-10 max-w-[36rem] will-change-transform md:absolute md:left-[var(--gutter)] md:top-[clamp(96px,15svh,170px)] lg:left-[max(var(--gutter),calc(50vw-700px))]"
      >
        <Eyebrow>{HERO.eyebrow}</Eyebrow>
        <h1 className="t-display mt-7">
          {HERO.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="t-lead mt-7 max-w-[30rem]">{HERO.sub}</p>
      </div>

      {/* the CEO Agent */}
      <div
        ref={agent}
        className="hero-agent pointer-events-none z-20 origin-top will-change-transform max-md:mt-6 max-md:h-[300px] max-md:w-[285px] md:absolute md:left-1/2 md:top-0"
      >
        <AgentSlot agent="ceo" mood="idle" followHover pulseCount={state.spoke} className="h-full w-full" deferMs={500} />
      </div>

      {/* The Business: section label, revealed once the display has arrived */}
      <div ref={heading} className="pointer-events-none z-10 hidden items-end justify-between pb-3 opacity-0 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
        <div className="max-w-[25rem]">
          <Eyebrow>{BUSINESS.eyebrow}</Eyebrow>
          <h2 className="mt-3 text-[clamp(1.25rem,1.9vw,1.75rem)] font-medium leading-[1.1] tracking-[-0.03em]">{BUSINESS.heading}</h2>
        </div>
        <p className="max-w-[19rem] text-right text-[0.9rem] leading-[1.45] text-[var(--text-1)]">{BUSINESS.lead}</p>
      </div>

      {/* the display */}
      <div
        ref={display}
        className="hero-display z-0 origin-top will-change-transform max-md:mt-2 max-md:w-full md:absolute md:left-1/2"
        inert={!desktop}
      >
        <VirtualDisplay width={HUD_SIZE.width} height={HUD_SIZE.height} label="The Business: a live view of one company">
          <BusinessHud state={state} onPickRecommendation={showRecommendation} interactive={desktop} />
        </VirtualDisplay>
      </div>

      {/* the display sinks into the void at the bottom of the landing frame; the hint sits on that fade */}
      <div ref={hint} className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-[22svh] items-end justify-center bg-gradient-to-t from-[var(--void)] via-[rgba(4,5,6,0.82)] to-transparent pb-7 md:flex">
        <span className="t-label flex items-center gap-3 text-[var(--text-1)]">
          <span className="h-px w-8 bg-[var(--line-strong)]" />
          {HERO.hint}
          <span className="h-px w-8 bg-[var(--line-strong)]" />
        </span>
      </div>
    </div>
  );
}

export function HeroBusiness() {
  return (
    <div className="relative">
    <ScrollStory
      steps={2}
      stepLength={1}
      tail={0.9}
      aria-label="One Spot: your whole business on one display"
      className="max-md:!h-auto"
      stageClassName="max-md:!static max-md:!h-auto max-md:!overflow-visible"
    >
      {() => <Scene />}
    </ScrollStory>
      {/* Where "The Business" links land: the explore pose on desktop, the native door list on phones. */}
      <span id="business" aria-hidden className="block h-0 md:absolute md:top-[128svh]" />
      <MobileBusiness />
    </div>
  );
}
