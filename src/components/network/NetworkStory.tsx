"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { ScrollStory } from "@/components/motion/ScrollStory";
import { GlBoundary } from "@/components/agent/GlBoundary";
import { cn } from "@/lib/cn";
import { useMediaQuery, useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { COMPACT_FLAT, WIDE_FLAT } from "./flat";
import { NetworkSvg } from "./NetworkSvg";
import { RelayCaptions } from "./RelayCaptions";
import { OwnerNotification, RelayChips } from "./RelayOverlays";
import { RELAY, STEPS } from "./relay";
import { COMPACT_TIMELINES, WIDE_TIMELINES } from "./timeline";
import styles from "./network.module.css";

// The only doorway to three.js for this scene. Never fetched on the static tier.
const NetworkStage = dynamic(() => import("@/gl/NetworkStage"), { ssr: false });

const FRAME_ASPECTS = { "--a-wide": WIDE_FLAT.aspect, "--a-compact": COMPACT_FLAT.aspect } as CSSProperties;
/** Without the 3D performance there is nothing to wait for: overlays follow the step directly. */
const NO_DELAYS = RELAY.map(() => 0);
const OWNER_INDEX = RELAY.findIndex((beat) => beat.to === "owner");
/** The card starts to appear while the bead is still fading toward the visitor, so one hands over to the other. */
const OWNER_LEAD = 0.3;

function Stage({ step }: { step: number }) {
  const tier = useExperience((s) => s.tier);
  const paused = useExperience((s) => s.paused);
  const reduced = useReducedMotion();
  // Must match the 768px switch in network.module.css: the portrait floor plan goes with the portrait frame.
  const wide = useMediaQuery("(min-width: 768px)");
  const live = (tier === "full" || tier === "lite") && !reduced;

  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  // Fetch the 3D scene when the visitor is about a screen away, not at page load.
  useEffect(() => {
    const el = root.current;
    if (!el || !live || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "120% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [live, near]);

  // If the 3D layer fails later (context lost, render error) the tier drops and the SVG composition returns.
  const showGl = live && near && ready;
  const performing = showGl && !paused;
  const timelines = wide ? WIDE_TIMELINES : COMPACT_TIMELINES;
  const delays = performing ? timelines.map((t) => t.speak) : NO_DELAYS;
  const ownerDelay = performing && OWNER_INDEX >= 0 ? Math.max(0, timelines[OWNER_INDEX].land - OWNER_LEAD) : 0;

  return (
    <div ref={root} className={styles.stage}>
      <div className={styles.scene}>
        <div className={styles.canvas}>
          {live && near && (
            <GlBoundary>
            <NetworkStage
              step={step}
              tier={tier}
              compact={!wide}
              frame={frame}
              onReady={() => setReady(true)}
              className={cn("absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out)]", showGl ? "opacity-100" : "opacity-0")}
            />
            </GlBoundary>
          )}
          <div className={styles.fadeTop} />
          <div className={styles.fadeBottom} />
        </div>

        <div className={styles.holder}>
          <div ref={frame} className={styles.frame} style={FRAME_ASPECTS}>
            <div aria-hidden className={cn("relative transition-[opacity,visibility] duration-700 ease-[var(--ease-out)]", showGl && "invisible opacity-0")}>
              <NetworkSvg scene={COMPACT_FLAT} step={step} className="md:hidden" />
              <NetworkSvg scene={WIDE_FLAT} step={step} className="hidden md:block" />
            </div>
            <RelayChips step={step} anchors={WIDE_FLAT.chips} delays={delays} />
          </div>
          <OwnerNotification step={step} delay={ownerDelay} />
        </div>
      </div>

      <RelayCaptions step={step} className={styles.captions} />
    </div>
  );
}

export function NetworkStory() {
  return (
    <ScrollStory steps={STEPS} stepLength={0.9} tail={0.4} aria-label="The relay, step by step">
      {({ step }) => <Stage step={step} />}
    </ScrollStory>
  );
}
