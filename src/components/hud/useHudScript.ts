"use client";

import { useEffect, useReducer } from "react";
import { HUD_SCRIPT, KEY_METRICS, RECOMMENDATIONS, REVENUE, TODOS, type HudEvent } from "@/content/hud";
import type { DepartmentId } from "@/content/departments";
import { useExperience } from "@/state/experience";
import { useReducedMotion } from "@/lib/useReducedMotion";

export interface HudState {
  cursor: number;
  revenue: number;
  revenueNote: string | null;
  metrics: Record<string, number>;
  done: string[];
  /** Which recommendation the CEO Agent is on. The To Do cards are static; this only drives `spoke`. */
  recommendation: number;
  /** Bumps whenever the CEO Agent says something new, so the agent can pulse with it. */
  spoke: number;
  /** Which department acted most recently: its tile flashes once. */
  lastDept: DepartmentId | null;
}

export const initialHudState: HudState = {
  cursor: 0,
  revenue: REVENUE.booked,
  revenueNote: null,
  metrics: Object.fromEntries(KEY_METRICS.map((m) => [m.id, m.value])),
  done: TODOS.filter((t) => t.done).map((t) => t.id),
  recommendation: 0,
  spoke: 0,
  lastDept: null,
};

function apply(state: HudState, event: HudEvent): HudState {
  const next = { ...state, cursor: state.cursor + 1, revenueNote: null as string | null, lastDept: null as DepartmentId | null };
  switch (event.type) {
    case "revenue":
      return { ...next, revenue: state.revenue + event.add, revenueNote: event.note };
    case "metric":
      return { ...next, metrics: { ...state.metrics, [event.id]: (state.metrics[event.id] ?? 0) + event.add } };
    case "activity":
      return { ...next, lastDept: event.dept };
    case "todo":
      return state.done.includes(event.id) ? next : { ...next, done: [...state.done, event.id] };
    case "recommend":
      return { ...next, recommendation: (state.recommendation + 1) % RECOMMENDATIONS.length, spoke: state.spoke + 1 };
  }
}

function tick(state: HudState): HudState {
  // One lap of the script is one "day". Start the next lap from a clean desk so numbers never run away.
  if (state.cursor > 0 && state.cursor % HUD_SCRIPT.length === 0 && state.done.length) {
    return apply({ ...state, done: [], revenue: REVENUE.booked, metrics: initialHudState.metrics }, HUD_SCRIPT[0]);
  }
  return apply(state, HUD_SCRIPT[state.cursor % HUD_SCRIPT.length]);
}

/**
 * The display's heartbeat: one scripted event roughly every 2.6 s, never two at once.
 * Waits for the opening logo sequence, then stops when the display is off screen, during route
 * transitions, when the visitor pauses motion, and for reduced-motion visitors (who get the still,
 * fully legible first frame).
 */
export function useHudScript(running: boolean) {
  const [state, dispatch] = useReducer(tick, initialHudState);
  const paused = useExperience((s) => s.paused);
  const phase = useExperience((s) => s.phase);
  const intro = useExperience((s) => s.intro);
  const reduce = useReducedMotion();
  const live = running && intro === "done" && !paused && !reduce && phase === "idle";

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (!document.hidden) dispatch();
    }, 2600);
    return () => window.clearInterval(id);
  }, [live]);

  return { state };
}
