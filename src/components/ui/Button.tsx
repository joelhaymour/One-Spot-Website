"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToId } from "@/components/motion/SmoothScroll";
import { cn } from "@/lib/cn";
import { Icon } from "./Icons";

type Variant = "primary" | "ghost" | "light";

interface AnchorButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "sm";
  arrow?: "right" | "down" | false;
  className?: string;
  onNavigate?: () => void;
}

/** In-page link ("#contact") that scrolls smoothly and still works as a plain anchor without JS. */
export function AnchorButton({ href, children, variant = "primary", size = "md", arrow = "right", className, onNavigate }: AnchorButtonProps) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (!href.startsWith("#") || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    scrollToId(href.slice(1));
  };

  return (
    <a href={href} onClick={onClick} className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}>
      {children}
      {arrow && <Icon name={arrow === "down" ? "arrowDown" : "arrow"} size={17} strokeWidth={1.8} className={cn("btn-arrow", arrow === "down" && "btn-arrow-down")} />}
    </a>
  );
}

/** Plain in-page text link with the same smooth scroll. */
export function AnchorLink({ href, children, className, onNavigate, ...rest }: { href: string; children: ReactNode; className?: string; onNavigate?: () => void } & Record<`aria-${string}`, string | undefined>) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (!href.startsWith("#") || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    scrollToId(href.slice(1));
  };
  return (
    <a href={href} onClick={onClick} className={className} {...rest}>
      {children}
    </a>
  );
}
