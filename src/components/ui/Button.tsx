import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "quiet";

const base =
  "group relative inline-flex h-11 select-none items-center justify-center gap-2.5 rounded-full px-5 text-[0.875rem] font-medium tracking-[-0.01em] transition-[background,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out)] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--text-0)] text-[#08090b] hover:bg-white hover:shadow-[0_0_0_4px_rgba(255,255,255,0.08),0_10px_40px_-10px_rgba(var(--spot-rgb),0.55)]",
  ghost:
    "border border-[var(--line-strong)] bg-white/[0.02] text-[var(--text-0)] hover:border-white/30 hover:bg-white/[0.06]",
  quiet: "h-auto rounded-none px-0 text-[var(--text-1)] hover:text-[var(--text-0)]",
};

/** Arrow that travels a few pixels on hover. The only flourish a button gets. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className={cn("transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-0.5", className)}
    >
      <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CommonProps {
  variant?: Variant;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}

export function Button({ variant = "primary", arrow, children, className, ...rest }: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function LinkButton({ variant = "primary", arrow, children, className, ...rest }: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
