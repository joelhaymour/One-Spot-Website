import { BEATS, type Beat, type StoryStep } from "@/content/departments";
import { clamp } from "@/lib/math";

/**
 * Pure helpers that turn a department story into what the shell needs to show.
 * Everything is derived from the step index, so the server HTML, the first client render and any
 * scroll position always agree.
 */

export interface BeatSpan {
  id: Beat;
  label: string;
  /** Index of the first step of this beat, or -1 when a story skips it. */
  first: number;
  count: number;
}

/** Where each of the five beats sits in a story. Stories keep a beat's steps together. */
export function beatSpans(story: StoryStep[]): BeatSpan[] {
  return BEATS.map(({ id, label }) => ({
    id,
    label,
    first: story.findIndex((s) => s.beat === id),
    count: story.filter((s) => s.beat === id).length,
  }));
}

/**
 * Progress along the five-beat rail, 0..1, measured dot to dot.
 * Beats own equal lengths of rail however many steps they hold, so the line always reaches a
 * beat's dot at the moment that beat begins.
 */
export function railProgress(spans: BeatSpan[], step: number, stepProgress: number): number {
  const b = spans.findIndex((s) => s.count > 0 && step >= s.first && step < s.first + s.count);
  if (b < 0) return 0;
  const within = (step - spans[b].first + stepProgress) / spans[b].count;
  return clamp((b + within) / (spans.length - 1));
}

const LOAD_RAMP = [0.35, 0.6, 0.85];

/** The seam gauge climbs through a run of consecutive "act" steps and rests everywhere else. */
export function agentLoad(story: StoryStep[], step: number): number {
  if (story[step]?.beat !== "act") return 0;
  let run = 0;
  for (let i = step; i >= 0 && story[i].beat === "act"; i--) run++;
  return LOAD_RAMP[Math.min(run, LOAD_RAMP.length) - 1];
}

/** How many steps of the given beat have started, the current one included. */
export function reachedCount(story: StoryStep[], step: number, beat: Beat): number {
  let n = 0;
  for (let i = 0; i <= step && i < story.length; i++) if (story[i].beat === beat) n++;
  return n;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * The console clock for a step: a working morning that starts at 09:14.
 * Integer arithmetic only (no Date, no Math.sin), so every engine prints the same string.
 */
export function logTime(index: number): string {
  const minutes = 9 * 60 + 14 + index * 4 + ((index * 7) % 3);
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
}

/** The clock shown for a step: the step's own time when the console's content pins one, else the running clock. */
export function stepTime(story: StoryStep[], index: number): string {
  const i = Math.min(index, story.length - 1);
  return story[i]?.time ?? logTime(index);
}
