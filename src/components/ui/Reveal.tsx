"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** seconds */
  delay?: number;
  /** px of upward travel */
  y?: number;
  once?: boolean;
  style?: CSSProperties;
}

/** Quiet entrance for editorial content: fade and a short rise, once, when it enters the viewport. */
export function Reveal({ children, as = "div", className, delay = 0, y = 18, once = true, style }: RevealProps) {
  // Polymorphic tag, typed as a div: every tag we pass accepts the same props.
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) setShown(false);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={cn("transition-[opacity,transform,filter] duration-[1100ms] ease-[var(--ease-out)]", className)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translate3d(0, ${y}px, 0)`,
        filter: shown ? "none" : "blur(6px)",
        transitionDelay: `${delay}s`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
