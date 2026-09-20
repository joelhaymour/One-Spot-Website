"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { clamp } from "@/lib/math";
import { cn } from "@/lib/cn";
import { useLenis } from "./SmoothScroll";

/**
 * ScrollStory — the scroll-film engine.
 *
 * A tall section with a CSS-sticky stage (no pin-spacers, no layout thrash, fine on iOS).
 * Scroll position picks a DISCRETE step; whatever happens inside a step is time-based,
 * so nothing can be left half-animated by a fast flick. Only camera-like moves should
 * subscribe to the continuous progress.
 *
 *   <ScrollStory steps={5} stepLength={0.9}>
 *     {({ step }) => <Stage step={step} />}
 *   </ScrollStory>
 */

type ProgressListener = (progress: number, stepProgress: number, step: number) => void;

interface StoryContextValue {
  step: number;
  steps: number;
  /** Subscribe to continuous progress without re-rendering React. Returns an unsubscribe. */
  subscribe: (fn: ProgressListener) => () => void;
  /** Smooth-scroll the page so that `step` becomes active (keyboard / rail navigation). */
  goTo: (step: number) => void;
}

const StoryContext = createContext<StoryContextValue | null>(null);

export function useStory(): StoryContextValue {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory must be used inside <ScrollStory>");
  return ctx;
}

/** Run `fn` every time scroll progress changes. `fn` must be cheap: write transforms, never setState. */
export function useStoryProgress(fn: ProgressListener) {
  const { subscribe } = useStory();
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => subscribe((p, sp, s) => ref.current(p, sp, s)), [subscribe]);
}

interface ScrollStoryProps {
  steps: number;
  /** Scroll distance per step, in viewport heights. */
  stepLength?: number;
  /** Extra scroll held on the last step before the stage releases, in viewport heights. */
  tail?: number;
  id?: string;
  className?: string;
  stageClassName?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  onStepChange?: (step: number) => void;
  children: (state: { step: number; steps: number }) => ReactNode;
}

export function ScrollStory({
  steps,
  stepLength = 0.9,
  tail = 0.35,
  id,
  className,
  stageClassName,
  style,
  onStepChange,
  children,
  ...aria
}: ScrollStoryProps) {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const listeners = useRef(new Set<ProgressListener>());
  const last = useRef({ progress: 0, stepProgress: 0, step: 0 });
  const [step, setStep] = useState(0);
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  });

  // Total scroll travel while the stage is stuck, in viewport heights.
  const travel = steps * stepLength + tail;
  const storyEnd = (steps * stepLength) / travel; // progress at which the last step completes

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = clamp(self.progress / storyEnd);
          const scaled = p * steps;
          const s = Math.min(steps - 1, Math.floor(scaled));
          const sp = clamp(scaled - s);
          last.current = { progress: p, stepProgress: sp, step: s };
          listeners.current.forEach((fn) => fn(p, sp, s));
          setStep((prev) => (prev === s ? prev : s));
        },
      });
      return () => trigger.kill();
    },
    { scope: root, dependencies: [steps, storyEnd] },
  );

  useEffect(() => {
    onStepChangeRef.current?.(step);
  }, [step]);

  const subscribe = useCallback((fn: ProgressListener) => {
    listeners.current.add(fn);
    const { progress, stepProgress, step: s } = last.current;
    fn(progress, stepProgress, s);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  const goTo = useCallback(
    (target: number) => {
      const el = root.current;
      if (!el) return;
      const s = clamp(target, 0, steps - 1);
      const stuck = el.offsetHeight - window.innerHeight;
      // Land a little inside the step so the index is unambiguous.
      const y = el.getBoundingClientRect().top + window.scrollY + stuck * storyEnd * ((s + 0.35) / steps);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (lenis && !reduce) lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    },
    [steps, storyEnd, lenis],
  );

  const value = useMemo(() => ({ step, steps, subscribe, goTo }), [step, steps, subscribe, goTo]);

  return (
    <section
      ref={root}
      id={id}
      className={cn("relative", className)}
      style={{ height: `calc(${travel + 1} * 100svh)`, ...style }}
      {...aria}
    >
      <div className={cn("sticky top-0 h-[100svh] w-full overflow-clip", stageClassName)}>
        <StoryContext.Provider value={value}>{children({ step, steps })}</StoryContext.Provider>
      </div>
    </section>
  );
}
