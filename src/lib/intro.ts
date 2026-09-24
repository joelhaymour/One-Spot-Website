"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the opening logo sequence has lifted. Entrances under the cover (hero copy, the loose chips,
 * every scroll reveal) wait for this, so nothing plays while it cannot be seen.
 */
let done = false;
const listeners = new Set<() => void>();

export function setIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((fn) => fn());
}

export const isIntroDone = () => done;

export function onIntroDone(fn: () => void): () => void {
  if (done) {
    fn();
    return () => undefined;
  }
  const once = () => {
    listeners.delete(once);
    fn();
  };
  listeners.add(once);
  return () => listeners.delete(once);
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const useIntroDone = () =>
  useSyncExternalStore(
    subscribe,
    () => done,
    () => false,
  );
