"use client";

import { useEffect, useReducer } from "react";
import { HUD_SCRIPT, KEY_METRICS, RECOMMENDATIONS, REVENUE, TODOS, type HudEvent } from "@/content/hud";
import { DEPARTMENT_BY_ID, type DepartmentId } from "@/content/departments";
import { useExperience } from "@/state/experience";
import { useReducedMotion } from "@/lib/useReducedMotion";

export interface ActivityLine {
  key: number;
  dept: DepartmentId;
  agent: string;
  line: string;
}

export interface HudState {
  cursor: number;
  revenue: number;
  revenueNote: string | null;
  metrics: Record<string, number>;
  done: string[];
  activity: ActivityLine[];
  recommendation: number;
  /** Bumps whenever the CEO Agent says something new, so the agent can pulse with it. */
  spoke: number;
  /** Which department acted most recently: its tile flashes once. */
  lastDept: DepartmentId | null;
}

const seedActivity: ActivityLine[] = [
  { key: -1, dept: "sales", agent: DEPARTMENT_BY_ID.sales.agentName, line: "Drafted a proposal for Hartwell Partners." },
  { key: -2, dept: "finance", agent: DEPARTMENT_BY_ID.finance.agentName, line: "Updated the 13-week cash forecast." },
  { key: -3, dept: "operations", agent: DEPARTMENT_BY_ID.operations.agentName, line: "Drafted a reorder at the best vendor price." },
];

export const initialHudState: HudState = {
  cursor: 0,
  revenue: REVENUE.booked,
  revenueNote: null,
  metrics: Object.fromEntries(KEY_METRICS.map((m) => [m.id, m.value])),
  done: TODOS.filter((t) => t.done).map((t) => t.id),
  activity: seedActivity,
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
      return {
        ...next,
        lastDept: event.dept,
        activity: [{ key: state.cursor, dept: event.dept, agent: DEPARTMENT_BY_ID[event.dept].agentName, line: event.line }, ...state.activity].slice(0, 3),
      };
    case "todo":
      return state.done.includes(event.id) ? next : { ...next, done: [...state.done, event.id] };
    case "recommend":
      return { ...next, recommendation: (state.recommendation + 1) % RECOMMENDATIONS.length, spoke: state.spoke + 1 };
  }
}

function reducer(state: HudState, action: { type: "tick" } | { type: "recommend"; index: number }): HudState {
  if (action.type === "recommend") return { ...state, recommendation: action.index, spoke: state.spoke + 1 };
  // One lap of the script is one "day". Start the next lap from a clean desk so numbers never run away.
  if (state.cursor > 0 && state.cursor % HUD_SCRIPT.length === 0 && state.done.length) {
    return apply({ ...state, done: [], revenue: REVENUE.booked, metrics: initialHudState.metrics }, HUD_SCRIPT[0]);
  }
  return apply(state, HUD_SCRIPT[state.cursor % HUD_SCRIPT.length]);
}

/**
 * The display's heartbeat: one scripted event roughly every 2.6 s, never two at once.
 * Stops when the display is off screen, during route transitions, when the visitor pauses motion,
 * and for reduced-motion visitors (who get the still, fully legible first frame).
 */
export function useHudScript(running: boolean) {
  const [state, dispatch] = useReducer(reducer, initialHudState);
  const paused = useExperience((s) => s.paused);
  const phase = useExperience((s) => s.phase);
  const reduce = useReducedMotion();
  const live = running && !paused && !reduce && phase === "idle";

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (!document.hidden) dispatch({ type: "tick" });
    }, 2600);
    return () => window.clearInterval(id);
  }, [live]);

  return { state, showRecommendation: (index: number) => dispatch({ type: "recommend", index }) };
}
