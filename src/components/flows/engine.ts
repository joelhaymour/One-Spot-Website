import { HUB, TOOLS, YOU, type Pt } from "@/components/hero/layout";
import type { FlowHop, FlowScenario } from "@/content/flows";
import type { ToolName } from "@/content/flows-tools";
import { EASE, gsap } from "@/lib/gsap";
import { lerp } from "@/lib/math";
import { HOME, arcDuration, arcPath, labelSide, linePath, toolIndex, type Cam, type FocusKey, type Path } from "./geometry";

/**
 * One scenario, played out. The picture below is the whole discrete state of the chapter (which tile is
 * lit, how many lines of the readout have appeared, how far the log has got); React renders it. The
 * continuous parts (the camera, the white dot) never touch React: one GSAP timeline moves them and
 * patches the picture at the right instants, so a pause freezes everything on the same clock.
 */

export type Stage =
  /** the full ring, the scenario's tiles at full opacity */
  | "overview"
  /** zoomed on a tile, its readout filling in */
  | "hop"
  /** the dot on its way; no readout showing */
  | "travel"
  /** on the mark: checks, then the recommendation */
  | "hub"
  /** on You: the decision */
  | "you"
  /** the finished picture at overview zoom */
  | "done";

export interface Picture {
  stage: Stage;
  /** index into the route (hops, then epilogue) of the tile in focus while `stage` is "hop" */
  hop: number;
  /** lines of the readout in focus that have appeared */
  lines: number;
  /** route hops completed: their tiles carry the check */
  done: number;
  /** the first action lit as if chosen (an epilogue follows) */
  chosen: boolean;
  /** log rows revealed so far */
  reached: number;
  /** what the dot carries, and the side of the dot the label rides on */
  carry: { text: string; side: "left" | "right" } | null;
}

export const OVERVIEW: Picture = { stage: "overview", hop: -1, lines: 0, done: 0, chosen: false, reached: 0, carry: null };

/** Every tile the scenario visits, in order: the hops, then the epilogue. */
export const routeOf = (s: FlowScenario): readonly FlowHop[] => (s.epilogue ? [...s.hops, ...s.epilogue] : s.hops);

export type LogRow =
  | { kind: "hop"; tool: ToolName; text: string }
  | { kind: "hub"; lines: readonly string[] }
  | { kind: "you"; actions: readonly string[] };

/** The log beside the drawing, in the order it fills: the hops, One Spot, You, then the epilogue. */
export function rowsOf(s: FlowScenario): LogRow[] {
  const hop = (h: FlowHop): LogRow => ({ kind: "hop", tool: h.tool, text: h.result });
  return [...s.hops.map(hop), { kind: "hub", lines: s.hub.recommendation }, { kind: "you", actions: s.you.actions }, ...(s.epilogue ?? []).map(hop)];
}

/** The still for reduced motion and the end of a run: everything that took part lit, the decision shown. */
export const finished = (s: FlowScenario): Picture => ({
  stage: "done",
  hop: -1,
  lines: 0,
  done: routeOf(s).length,
  chosen: Boolean(s.epilogue),
  reached: rowsOf(s).length,
  carry: null,
});

/** Seconds. */
const T = {
  overview: 1.2,
  pan: 0.8,
  lineIn: 0.15,
  line: 0.35,
  hold: 0.8,
  /** after the log row, before the dot leaves */
  leave: 0.25,
  spoke: 0.7,
  you: 0.7,
  check: 0.35,
  recHold: 1.4,
  youHold: 2.6,
  /** with an epilogue: how long You read the decision before the first action is chosen */
  choose: 1.2,
  /** after the choice, before One Spot moves */
  chosen: 0.6,
  /** each leg of an epilogue journey (down to the mark, out to the tile) */
  leg: 0.6,
  back: 1.0,
  /** the dot's fade in and out */
  dot: 0.2,
} as const;

export interface RunContext {
  scenario: FlowScenario;
  /** where the camera looks to show a card and what it sits beside */
  focus: (key: FocusKey) => Cam;
  /** writes the camera's transform */
  aim: (cam: Cam) => void;
  /** the white dot */
  dot: Element;
  moveDot: (p: Pt) => void;
  setPic: (update: (prev: Picture) => Picture) => void;
}

const tileAt = (tool: ToolName): Pt => TOOLS[toolIndex(tool)].b;

/** Builds the scenario's timeline, paused at 0. Playing it from the start resets the picture itself. */
export function buildRun(ctx: RunContext): gsap.core.Timeline {
  const { scenario, setPic } = ctx;
  const route = routeOf(scenario);
  const main = scenario.hops.length;
  const epilogue = scenario.epilogue ?? [];
  // hub and You rows sit between the hops and the epilogue in the log
  const rowOfHop = (i: number) => (i < main ? i : i + 2);
  const ROW_HUB = main;
  const ROW_YOU = main + 1;

  const tl = gsap.timeline({ paused: true });
  const cam: Cam = { ...HOME };
  const apply = () => ctx.aim(cam);

  const patch = (at: number, p: Partial<Picture>) => {
    tl.call(() => setPic((prev) => ({ ...prev, ...p })), [], at);
  };
  const pan = (at: number, to: Cam, duration: number) => {
    tl.to(cam, { x: to.x, y: to.y, s: to.s, duration, ease: EASE.camera, onUpdate: apply }, at);
  };
  /**
   * The dot along a path while the camera keeps it framed: the camera's offset from the dot eases from
   * the departure framing to the arrival framing, so both ends are exactly the focus the readouts use.
   */
  const travel = (at: number, path: Path, from: Cam, to: Cam, duration: number, fade = { in: true, out: true }) => {
    const a = path.at(0);
    const b = path.at(1);
    const off0 = [from.x - a[0], from.y - a[1]];
    const off1 = [to.x - b[0], to.y - b[1]];
    const st = { p: 0 };
    tl.to(
      st,
      {
        p: 1,
        duration,
        ease: EASE.camera,
        onUpdate: () => {
          const q = path.at(st.p);
          ctx.moveDot(q);
          cam.x = q[0] + lerp(off0[0], off1[0], st.p);
          cam.y = q[1] + lerp(off0[1], off1[1], st.p);
          cam.s = lerp(from.s, to.s, st.p);
          apply();
        },
      },
      at,
    );
    if (fade.in) tl.to(ctx.dot, { opacity: 1, duration: T.dot, ease: "power1.out" }, at);
    if (fade.out) tl.to(ctx.dot, { opacity: 0, duration: T.dot, ease: "power1.in" }, at + duration - T.dot);
  };
  /** The tile lit, its lines one by one, a hold, the log row. Returns when the dot may leave. */
  const readout = (index: number, at: number): number => {
    const hop = route[index];
    patch(at, { stage: "hop", hop: index, lines: 0, carry: null });
    const first = at + T.lineIn;
    hop.lines.forEach((_, n) => patch(first + n * T.line, { lines: n + 1 }));
    const last = first + (hop.lines.length - 1) * T.line;
    patch(last + T.hold, { reached: rowOfHop(index) + 1 });
    return last + T.hold + T.leave;
  };

  // The picture resets as the run starts (not at 0: a callback on the very first frame can be skipped).
  patch(0.01, OVERVIEW);
  let t: number = T.overview;

  const hopFocus = (i: number) => ctx.focus({ kind: "hop", index: i });
  const hubFocus = ctx.focus({ kind: "hub" });
  const markFocus = ctx.focus({ kind: "mark" });
  const youFocus = ctx.focus({ kind: "you" });

  // 1. the hops: zoom to the first; then each one hands on to the next around the ring
  scenario.hops.forEach((hop, i) => {
    if (i === 0) {
      pan(t, hopFocus(0), T.pan);
      t += T.pan;
    }
    t = readout(i, t);
    const next = i + 1 < main ? scenario.hops[i + 1] : null;
    const path = next ? arcPath(toolIndex(hop.tool), toolIndex(next.tool)) : linePath(tileAt(hop.tool), HUB.b);
    const carry = hop.carry ? { text: hop.carry, side: labelSide(path) } : null;
    patch(t, { stage: "travel", hop: -1, done: i + 1, carry });
    const duration = next ? arcDuration(path) : T.spoke;
    travel(t, path, hopFocus(i), next ? hopFocus(i + 1) : hubFocus, duration);
    t += duration;
  });

  // 2. One Spot connects the dots: the checks, then the recommendation
  {
    const checks = scenario.hub.checks.length;
    const rec = scenario.hub.recommendation.length;
    patch(t, { stage: "hub", hop: -1, lines: 0, carry: null });
    let tt = t + 0.3;
    for (let n = 0; n < checks; n += 1) patch(tt + n * T.check, { lines: n + 1 });
    tt += checks * T.check + 0.15;
    for (let n = 0; n < rec; n += 1) patch(tt + n * T.line, { lines: checks + n + 1 });
    tt += (rec - 1) * T.line;
    patch(tt + 0.1, { reached: ROW_HUB + 1 });
    t = tt + T.recHold;
  }

  // 3. up the line to You: one decision
  patch(t, { stage: "travel", hop: -1, carry: null });
  travel(t, linePath(HUB.b, YOU.b), hubFocus, youFocus, T.you);
  t += T.you;
  patch(t, { stage: "you" });
  patch(t + 0.5, { reached: ROW_YOU + 1 });

  // 4. an epilogue: the first action chosen, then One Spot coordinates the rest without You
  if (epilogue.length) {
    patch(t + T.choose, { chosen: true });
    t += T.choose + T.chosen;
    epilogue.forEach((hop, j) => {
      const index = main + j;
      const from: Pt = j === 0 ? YOU.b : tileAt(epilogue[j - 1].tool);
      const fromCam = j === 0 ? youFocus : hopFocus(index - 1);
      patch(t, { stage: "travel", hop: -1, done: index, carry: null });
      // one journey through the mark: the dot stays lit between the two legs
      travel(t, linePath(from, HUB.b), fromCam, markFocus, T.leg, { in: true, out: false });
      travel(t + T.leg, linePath(HUB.b, tileAt(hop.tool)), markFocus, hopFocus(index), T.leg, { in: false, out: true });
      t += 2 * T.leg;
      t = readout(index, t);
    });
  } else {
    t += T.youHold;
  }

  // 5. back out to the whole picture, and hold there
  patch(t, { stage: "done", hop: -1, done: route.length, carry: null });
  pan(t, HOME, T.back);

  return tl;
}
