"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export type NumberFormat = "int" | "currency" | "compact-currency" | "percent" | "decimal1" | "decimal2";

const formatters: Record<NumberFormat, (v: number) => string> = {
  int: (v) => Math.round(v).toLocaleString("en-US"),
  currency: (v) => "$" + Math.round(v).toLocaleString("en-US"),
  "compact-currency": (v) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 10_000 ? `$${(v / 1000).toFixed(1)}K` : "$" + Math.round(v).toLocaleString("en-US"),
  percent: (v) => `${v.toFixed(1)}%`,
  decimal1: (v) => v.toFixed(1),
  decimal2: (v) => v.toFixed(2),
};

export const formatNumber = (v: number, format: NumberFormat = "int") => formatters[format](v);

interface AnimatedNumberProps {
  value: number;
  format?: NumberFormat;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/** Tweens to each new value by writing textContent directly: no React render per frame. */
export function AnimatedNumber({ value, format = "int", duration = 0.9, className, prefix = "", suffix = "" }: AnimatedNumberProps) {
  const el = useRef<HTMLSpanElement>(null);
  const current = useRef({ v: value });
  // React renders this text once. After that the tween below is the only writer, so a new value can
  // never flash on screen for a frame before the count reaches it.
  const [initial] = useState(() => prefix + formatters[format](value) + suffix);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const write = () => {
      node.textContent = prefix + formatters[format](current.current.v) + suffix;
    };
    if (reduce || current.current.v === value) {
      current.current.v = value;
      write();
      return;
    }
    const tween = gsap.to(current.current, { v: value, duration, ease: "power2.out", onUpdate: write });
    return () => {
      tween.kill();
    };
  }, [value, format, duration, prefix, suffix]);

  return (
    <span ref={el} className={cn("t-num", className)} suppressHydrationWarning>
      {initial}
    </span>
  );
}
