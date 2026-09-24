"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Q = (selector: string) => HTMLElement[];

/**
 * A small illustration that plays its story each time it becomes the active one. The timeline is built
 * once, paused at its opening state; activation restarts it. Without motion it simply shows its end.
 * The server HTML is the end state too, so nothing is ever stranded hidden.
 */
export function useScene<T extends HTMLElement = HTMLDivElement>(active: boolean, build: (tl: gsap.core.Timeline, q: Q, root: T) => void) {
  const ref = useRef<T>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const buildRef = useRef(build);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const q = gsap.utils.selector(root) as unknown as Q;
      const tl = gsap.timeline({ paused: true });
      buildRef.current(tl, q, root);
      tlRef.current = tl;
      const still = document.documentElement.dataset.motion !== "on";
      if (still) tl.progress(1);
      else tl.progress(0);
    },
    { scope: ref },
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || document.documentElement.dataset.motion !== "on") return;
    if (active) tl.restart();
  }, [active]);

  return ref;
}
