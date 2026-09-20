"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Single registration point. Import gsap from here, never from "gsap" directly,
// so plugins are registered exactly once and tree-shaking keeps them.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.6 });
  // Address-bar show/hide on mobile must not re-measure every pinned story.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Shared easing vocabulary. Camera moves breathe; UI responds. */
export const EASE = {
  ui: "power3.out",
  enter: "expo.out",
  camera: "power3.inOut",
  settle: "power2.out",
} as const;

export { gsap, ScrollTrigger, useGSAP };
