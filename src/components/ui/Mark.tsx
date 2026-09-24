import { cn } from "@/lib/cn";

/** The logo: a spot inside a ring. Everything in the business, in one spot. */
export function Mark({ size = 24, spot = "var(--spot)", className }: { size?: number; spot?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" className={cn("block", className)}>
      <circle cx="12" cy="12" r="10.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.6" fill={spot} />
    </svg>
  );
}

/** Mark plus wordmark. The nav, the intro and the footer all use this exact lockup. */
export function Lockup({ className, size = 26 }: { className?: string; size?: number }) {
  return (
    <span className={cn("flex items-center gap-2.5 whitespace-nowrap", className)}>
      <Mark size={size} />
      <span className="text-[1.0625rem] font-semibold leading-[26px] tracking-[-0.03em]">One Spot</span>
    </span>
  );
}
