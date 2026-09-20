"use client";

import { SCALING } from "@/content/copy";
import { useStory } from "@/components/motion/ScrollStory";
import { cn } from "@/lib/cn";

/**
 * The five beats as an ordered list: the scene's text equivalent, and its navigation.
 * Wide screens show the whole list beside the stage with the active beat opened. Narrow screens stack
 * every beat in one grid cell below the stage and show only the active one; the cell keeps the height
 * of the tallest caption so the stage above never resizes between beats.
 */
export function ScalingCaptions({ className }: { className?: string }) {
  const { step, steps, goTo } = useStory();
  return (
    <div className={className}>
      <div aria-hidden className="mb-2.5 flex items-center gap-3 md:hidden">
        <span className="t-label t-num text-[var(--text-1)]">
          0{step + 1} / 0{steps}
        </span>
        <span className="flex gap-1">
          {SCALING.beats.map((b, i) => (
            <span
              key={b.title}
              className="h-px w-5 transition-colors duration-500"
              style={{ background: i === step ? "rgb(var(--accent-rgb))" : "var(--line-strong)" }}
            />
          ))}
        </span>
      </div>

      <ol className="grid md:block">
        {SCALING.beats.map((b, i) => {
          const active = i === step;
          return (
            <li
              key={b.title}
              className={cn(
                "max-md:[grid-area:1/1] max-md:transition-[opacity,visibility] max-md:duration-500 max-md:ease-[var(--ease-out)]",
                "md:border-t md:border-[var(--line)] md:first:border-t-0",
                !active && "max-md:invisible max-md:opacity-0",
              )}
            >
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={active ? "step" : undefined}
                className="group flex w-full items-baseline gap-5 text-left md:py-5"
              >
                <span
                  className={cn(
                    "t-label t-num w-6 shrink-0 transition-colors duration-500 max-md:hidden",
                    active ? "text-[rgb(var(--accent-rgb))]" : "text-[var(--text-2)]",
                  )}
                >
                  0{i + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[1.2rem] font-medium leading-[1.15] tracking-[-0.03em] transition-colors duration-500 md:text-[clamp(1.25rem,1.9vw,1.7rem)]",
                      // Inactive beats stay readable text (4.5:1), not decoration.
                      active ? "text-[var(--text-0)]" : "text-[var(--text-0)] md:text-[var(--text-2)] md:group-hover:text-[var(--text-1)]",
                    )}
                  >
                    {b.title}
                  </span>
                  <span
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)] max-md:grid-rows-[1fr]",
                      active ? "md:grid-rows-[1fr] md:opacity-100" : "md:grid-rows-[0fr] md:opacity-0",
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="t-body block pt-1.5 max-md:text-[0.875rem] max-md:leading-[1.45]">{b.body}</span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
