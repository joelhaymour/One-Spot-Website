"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface TypedTextProps {
  text: string;
  /** Typing starts when this becomes true and resets when it becomes false. */
  active?: boolean;
  /** Characters per second. Agents write quickly but legibly. */
  speed?: number;
  delay?: number;
  caret?: boolean;
  className?: string;
  onDone?: () => void;
}

/**
 * Text that an agent writes in front of you. Time-based, so it always finishes.
 * The full string is always in the DOM for screen readers and search engines;
 * only the visible portion is animated.
 */
export function TypedText({ text, active = true, speed = 46, delay = 0, caret = true, className, onDone }: TypedTextProps) {
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      onDoneRef.current?.();
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now + delay * 1000;
      const elapsed = Math.max(0, now - start) / 1000;
      const next = Math.min(text.length, Math.floor(elapsed * speed));
      setCount((prev) => (prev === next ? prev : next));
      if (next < text.length) raf = requestAnimationFrame(tick);
      else onDoneRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, speed, delay]);

  const done = count >= text.length;
  return (
    <span className={cn("relative", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, count)}
        {caret && active && (
          <span
            className="ml-[1px] inline-block h-[1em] w-[0.5em] translate-y-[0.14em] rounded-[1px]"
            style={{
              background: "rgb(var(--accent-rgb))",
              animation: done ? "caret-blink 1s steps(1) 3" : undefined,
              opacity: done ? 0 : 0.9,
            }}
          />
        )}
        {/* reserve final layout so nothing reflows while typing */}
        <span className="invisible">{text.slice(count)}</span>
      </span>
    </span>
  );
}
