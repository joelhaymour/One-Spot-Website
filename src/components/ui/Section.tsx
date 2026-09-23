import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  index?: string;
}

/** Mono label with the spot. Opens every section. */
export function Eyebrow({ children, className, index }: EyebrowProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="spot" />
      {index && <span className="t-label text-[var(--text-3)]">{index}</span>}
      <span className="t-label text-[var(--text-1)]">{children}</span>
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  index?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, index, title, lead, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-[46rem] flex-col gap-6", align === "center" && "mx-auto items-center text-center", className)}>
      <Reveal>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="t-title">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.16}>
          <p className="t-lead max-w-[38rem]">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}

/**
 * A full-screen pause. One sentence, nothing moving.
 * The film breathes here before the next scene.
 */
export function Statement({
  children,
  kicker,
  support,
  id,
  className,
}: {
  children: ReactNode;
  kicker?: string;
  /** One quieter line under the statement, for the rare pause that needs a second sentence. */
  support?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative flex min-h-[92svh] items-center justify-center px-[var(--gutter)] py-32", className)}>
      <div className="mx-auto flex max-w-[62rem] flex-col items-center gap-8 text-center">
        {kicker && (
          <Reveal>
            <Eyebrow>{kicker}</Eyebrow>
          </Reveal>
        )}
        <Reveal delay={0.1} y={26}>
          <p className="t-statement">{children}</p>
        </Reveal>
        {support && (
          <Reveal delay={0.24}>
            <p className="t-lead max-w-[34rem]">{support}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
