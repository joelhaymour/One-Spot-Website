"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/** 216 -> "3m 36s". Seconds are padded so the figure keeps its width while it falls. */
const format = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};

interface AnimatedDurationProps {
  /** Seconds. */
  value: number;
  duration?: number;
  className?: string;
}

/**
 * AnimatedNumber for a length of time. The foundation's formats stop at plain numbers, and a median
 * response reads as minutes and seconds. Same technique: tween a value, write textContent, no renders.
 */
export function AnimatedDuration({ value, duration = 1.4, className }: AnimatedDurationProps) {
  const el = useRef<HTMLSpanElement>(null);
  const current = useRef({ v: value });

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const state = current.current;
    const write = () => {
      node.textContent = format(state.v);
    };
    if (state.v === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.v = value;
      write();
      return;
    }
    const tween = gsap.to(state, { v: value, duration, ease: "power2.out", onUpdate: write });
    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return (
    <span ref={el} className={cn("t-num", className)}>
      {format(value)}
    </span>
  );
}
