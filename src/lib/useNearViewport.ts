"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element has come within `margin` of the viewport (and stays true).
 * Used to hold back WebGL contexts and heavy chunks until the visitor is actually approaching them.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = "100% 0px"): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}
