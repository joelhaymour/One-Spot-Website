import type { CSSProperties } from "react";
import { PROBLEM } from "@/content/site";
import { ScrollFill } from "@/components/motion/ScrollFill";
import { Icon, type IconName } from "@/components/ui/Icons";

/** 01 · The handoff problem, in the owner's own words. */
export function Problem() {
  return (
    <section id="why" aria-labelledby="why-title" className="section">
      <div className="wrap">
        <h2 id="why-title" className="t-eyebrow" data-reveal>
          {PROBLEM.eyebrow}
        </h2>
        <ScrollFill
          text={PROBLEM.statement.replace("handoff", "*handoff*")}
          className="mt-10 max-w-[64rem] font-[family-name:var(--font-serif)] text-[clamp(2rem,4.3vw,4rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)] [text-wrap:pretty]"
        />

        <ul className="mt-20 grid gap-4 sm:grid-cols-2 lg:mt-28 lg:grid-cols-4">
          {PROBLEM.pains.map((pain, i) => (
            <li
              key={pain.quote}
              data-reveal
              style={{ "--reveal-delay": `${i * 0.08}s` } as CSSProperties}
              className="group relative flex min-h-[15rem] flex-col justify-between rounded-[22px] border border-[var(--line)] bg-[var(--paper-2)] p-6 transition-[background-color,transform,box-shadow] duration-500 ease-[var(--ease-out)] hover:-translate-y-1 hover:bg-[var(--card)] hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink-2)] transition-colors duration-500 group-hover:border-transparent group-hover:bg-[var(--spot)] group-hover:text-white">
                <Icon name={pain.icon as IconName} size={20} />
              </span>
              <p className="mt-10 text-[1.2rem] leading-[1.38] tracking-[-0.018em] text-[var(--ink)]">&ldquo;{pain.quote}&rdquo;</p>
            </li>
          ))}
        </ul>

        <p className="mt-16 max-w-[40rem] text-[clamp(1.25rem,1.8vw,1.6rem)] leading-[1.4] tracking-[-0.016em] text-[var(--ink)] lg:ml-auto lg:mt-20" data-reveal>
          {PROBLEM.close}
        </p>
      </div>
    </section>
  );
}
