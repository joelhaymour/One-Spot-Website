"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useExperience } from "@/state/experience";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** seconds */
  delay?: number;
  /** px of upward travel */
  y?: number;
  style?: CSSProperties;
}

/**
 * Quiet entrance for editorial copy: a fade and a short rise, once, when it enters the viewport.
 * Progressive: the copy is visible in the server HTML, without JS, and if this chunk never loads.
 * The hidden starting state only exists under html[data-motion="on"] (set by the boot script in the
 * root layout), and is removed once the element has been seen and the opening logo sequence has
 * lifted, so copy enters as the cover goes rather than under it. See globals.css.
 * Nothing can be stranded by the wait: the intro forces its own end within 4.5 s, and the boot
 * script drops data-motion (the hidden state itself) if the app never boots.
 */
export function Reveal({ children, as = "div", className, delay = 0, y = 18, style }: RevealProps) {
  // Polymorphic tag, typed as a div: every tag we pass accepts the same props.
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const intro = useExperience((s) => s.intro);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-shown={shown && intro === "done" ? "" : undefined}
      className={cn(className)}
      style={{ ["--reveal-delay" as string]: `${delay}s`, ["--reveal-y" as string]: `${y}px`, ...style }}
    >
      {children}
    </Tag>
  );
}
