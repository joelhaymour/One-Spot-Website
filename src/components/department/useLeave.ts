"use client";

import { useCallback, type MouseEvent } from "react";
import { useDepartmentTransition } from "@/components/motion/Transition";
import { useExperience } from "@/state/experience";

/**
 * Click handler for every "back to The Business" link on a department page.
 * The element stays a real link to /#business: without JS, on a modified click (new tab) or while
 * another transition is still running, the browser simply follows it. Otherwise the visitor steps
 * back out through the cover and lands where they left the display.
 */
export function useLeave() {
  const { leave } = useDepartmentTransition();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (useExperience.getState().phase !== "idle") return;
      event.preventDefault();
      leave();
    },
    [leave],
  );
}
