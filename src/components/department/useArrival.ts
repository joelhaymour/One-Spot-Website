"use client";

import { useState, type RefObject } from "react";
import { gsap, useGSAP, EASE } from "@/lib/gsap";
import { useExperience } from "@/state/experience";

/** True while the visitor is falling through the display into this page (the cover is still up). */
const steppingIn = () => {
  const { phase } = useExperience.getState();
  return phase === "entering" || phase === "arriving";
};

/**
 * The arrival: the workstation settles out of the dive and the agent lowers into place while the
 * transition cover lifts. Returns `live`, which stays false until the move has finished, so the
 * console and the agent hold their resting state and only start working once the visitor can see them.
 *
 * On a direct load, a reduced-motion visit or a department-to-department link there is no dive, so
 * nothing plays and `live` is true from the first render (server HTML included).
 *
 * Targets are found by `data-arrive="display" | "agent"` inside `scope`. The store's phase belongs to
 * the TransitionLayer; this only reads it.
 */
export function useArrival(scope: RefObject<HTMLElement | null>): boolean {
  const [live, setLive] = useState(() => !steppingIn());

  useGSAP(
    () => {
      if (live) return;
      const root = scope.current;
      const display = root?.querySelector<HTMLElement>("[data-arrive='display']");
      const agent = root?.querySelector<HTMLElement>("[data-arrive='agent']");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!display || reduce) {
        gsap.delayedCall(0, () => setLive(true));
        return;
      }

      // clearProps on both: a leftover transform would give the display its own containing block
      // and keep a compositor layer alive for the rest of the visit.
      // Scale from the top edge: that is the part of the display in view when the visitor lands.
      gsap.set(display, { transformOrigin: "50% 0%" });
      const tl = gsap.timeline({ delay: 0.2, onComplete: () => setLive(true) });
      tl.fromTo(
        display,
        { scale: 1.06, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.0, ease: EASE.camera, clearProps: "transform,transformOrigin,opacity" },
        0,
      );
      if (agent) {
        tl.fromTo(
          agent,
          { y: -24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: EASE.enter, clearProps: "transform,opacity" },
          0.2,
        );
      }
    },
    { scope, dependencies: [] },
  );

  return live;
}
