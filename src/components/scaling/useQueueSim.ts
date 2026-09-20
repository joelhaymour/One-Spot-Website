"use client";

import { useEffect, useRef, useState } from "react";
import { FLOW, MAX_CARDS, STILLS, taskAt, type QueueCardData, type QueueSnapshot } from "./script";

/**
 * The ambient work queue. Time-based and event-driven: React only hears about it when a card
 * arrives, completes or is retired, never per frame. The scroll step picks the arrival and
 * completion rates; what happens inside a beat is the queue doing what queues do.
 */

/** Seconds a completed card takes to slide out before it is dropped from the DOM. */
const LEAVE_S = 0.46;
const BURST_IN = 0.2;
const BURST_OUT = 0.2;
const LANES_STEP = 4;
/** Seconds the single queue takes to fan out into three lanes. */
const SPLIT_S = 0.9;

interface Model {
  step: number;
  clock: number;
  cards: QueueCardData[];
  /** id -> clock time at which the card started leaving */
  leftAt: Map<number, number>;
  overflow: number;
  done: number;
  seq: number;
  nextId: number;
  arrivalIn: number;
  serviceIn: number;
  laneCursor: number;
}

function createModel(step: number, nextId: number): Model {
  const still = STILLS[step];
  return {
    step,
    clock: 0,
    cards: still.cards,
    leftAt: new Map(),
    overflow: still.overflow,
    done: still.done,
    seq: still.cards.length + still.overflow + step,
    nextId,
    // Half a period apart, so an arrival and a completion never land on the same frame.
    arrivalIn: FLOW[step].arrival / 2,
    serviceIn: FLOW[step].service,
    laneCursor: 0,
  };
}

const live = (m: Model) => m.cards.length - m.leftAt.size;

function pushCard(m: Model) {
  m.cards = [...m.cards, { id: m.nextId++, ...taskAt(m.seq++), fresh: true, leaving: false }];
}

function completeOne(m: Model, lanes: boolean): boolean {
  let head: QueueCardData | undefined;
  if (lanes) {
    // Three agents take turns, each clearing the head of its own lane.
    for (let k = 0; k < 3 && !head; k++) {
      const lane = (m.laneCursor + k) % 3;
      head = m.cards.find((c) => !c.leaving && c.lane === lane);
      if (head) m.laneCursor = (lane + 1) % 3;
    }
  } else {
    head = m.cards.find((c) => !c.leaving);
  }
  if (!head) return false;
  const id = head.id;
  m.cards = m.cards.map((c) => (c.id === id ? { ...c, leaving: true } : c));
  m.leftAt.set(id, m.clock);
  m.done++;
  if (m.overflow > 0) {
    m.overflow--;
    pushCard(m);
  }
  return true;
}

/** Advance the queue by dt seconds. Returns true when something visible changed. */
function advance(m: Model, step: number, dt: number): boolean {
  const flow = FLOW[step];
  let changed = false;
  m.clock += dt;

  if (m.step !== step) {
    const split = step >= LANES_STEP && m.step < LANES_STEP;
    m.step = step;
    // A backlog this beat cannot hold is absorbed at once; the depth readout counts it down.
    m.overflow = Math.min(m.overflow, Math.max(0, flow.max - live(m)));
    const depth = live(m) + m.overflow;
    m.arrivalIn = Math.min(m.arrivalIn, depth < flow.min ? BURST_IN : flow.arrival);
    m.serviceIn = Math.min(m.serviceIn, depth > flow.max ? BURST_OUT : flow.service);
    if (split) {
      // One thing at a time: the cards finish sliding into their lanes before any of them leaves.
      m.serviceIn = SPLIT_S;
      m.arrivalIn = SPLIT_S + 0.4;
    }
    changed = true;
  }

  for (const [id, at] of m.leftAt) {
    if (m.clock - at < LEAVE_S) continue;
    m.leftAt.delete(id);
    m.cards = m.cards.filter((c) => c.id !== id);
    changed = true;
  }

  m.arrivalIn -= dt;
  if (m.arrivalIn <= 0) {
    const depth = live(m) + m.overflow;
    if (depth < flow.max) {
      if (live(m) < MAX_CARDS) pushCard(m);
      else m.overflow++;
      changed = true;
    }
    m.arrivalIn = depth + 1 < flow.min ? BURST_IN : flow.arrival;
  }

  m.serviceIn -= dt;
  if (m.serviceIn <= 0) {
    const depth = live(m) + m.overflow;
    if (depth > flow.min && completeOne(m, step >= LANES_STEP)) changed = true;
    m.serviceIn = depth - 1 > flow.max ? BURST_OUT : flow.service;
  }

  return changed;
}

/**
 * @param visible the section is on screen
 * @param frozen  reduced motion, or the visitor paused motion: show the beat's still instead
 */
export function useQueueSim(step: number, visible: boolean, frozen: boolean): QueueSnapshot {
  const [snapshot, setSnapshot] = useState<QueueSnapshot>(STILLS[0]);
  // True until the live queue has published since the last freeze: a snapshot from before a pause, or
  // from before the section was first seen, may belong to another beat and must never reach the screen.
  const [stale, setStale] = useState(true);
  if (frozen && !stale) setStale(true);
  const model = useRef<Model | null>(null);
  const stepRef = useRef(step);
  const resync = useRef(false);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    if (frozen) {
      // While frozen the visitor sees stills. Resume from the still on screen, not from a stale queue.
      resync.current = true;
      return;
    }
    if (!visible) return;

    let m = model.current;
    let dirty = false;
    if (!m || resync.current) {
      m = createModel(stepRef.current, m?.nextId ?? 1000);
      model.current = m;
      resync.current = false;
      dirty = true;
    }
    const sim = m;

    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      if (advance(sim, stepRef.current, dt) || dirty) {
        setSnapshot({ cards: sim.cards, overflow: sim.overflow, done: sim.done });
        if (dirty) setStale(false);
        dirty = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, frozen]);

  return frozen || stale ? STILLS[step] : snapshot;
}
