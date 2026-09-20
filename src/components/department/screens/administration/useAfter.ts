"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { Stage } from "../knowledge/kit";

/**
 * True `ms` after a step becomes active, for the things CSS cannot delay: text the agent types and
 * numbers that tick when a result lands. It follows the same rule as the kit's `lag`: only the active
 * step waits its turn. A step that was jumped past, or left half-way, settles at once, and going back
 * before the step resets it. Already-true stays true, so nothing is ever typed twice.
 */
export function useAfter(stage: Stage, ms: number): boolean {
  const reduce = useReducedMotion();
  const [fired, setFired] = useState(false);
  const delay = reduce ? 0 : ms;

  useEffect(() => {
    if (!stage.on) return;
    const timer = setTimeout(() => setFired(true), delay);
    return () => {
      clearTimeout(timer);
      setFired(false);
    };
  }, [stage.on, delay]);

  return stage.on && (fired || !stage.now);
}
