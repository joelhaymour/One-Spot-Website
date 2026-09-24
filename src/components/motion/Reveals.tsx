"use client";

import { useEffect } from "react";
import { onIntroDone } from "@/lib/intro";

const SELECTOR = "[data-reveal]:not([data-shown]), [data-split]:not([data-shown])";

/**
 * One observer for every scroll reveal on the page. Server components opt in with an attribute
 * (data-reveal for a block, data-split for a word-by-word headline); this marks them data-shown as
 * they enter, and CSS does the rest. Nothing is observed until the opening logo sequence has lifted,
 * so the first screen plays its entrance where it can be seen. Late-mounted content (a switched tab)
 * is picked up by a mutation observer.
 */
export function Reveals() {
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;

    const stop = onIntroDone(() => {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.shown = "";
            io?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      const scan = (root: ParentNode) => root.querySelectorAll(SELECTOR).forEach((el) => io?.observe(el));
      scan(document);

      mo = new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            if (node.matches(SELECTOR)) io?.observe(node);
            scan(node);
          });
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    });

    return () => {
      stop();
      io?.disconnect();
      mo?.disconnect();
    };
  }, []);

  return null;
}
