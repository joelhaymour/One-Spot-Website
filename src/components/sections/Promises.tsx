import type { CSSProperties } from "react";
import { PROMISES } from "@/content/site";
import { Split } from "@/components/motion/Split";

/** 04 · What stays in your hands: the rules every One Spot build follows, set like a table of contents. */
export function Promises() {
  return (
    <section aria-labelledby="promises-title" className="section pb-[clamp(64px,8vw,112px)]">
      <div className="wrap">
        <p className="t-eyebrow" data-reveal>
          {PROMISES.eyebrow}
        </p>
        <Split id="promises-title" lines={PROMISES.headline} className="t-h2 mt-6" />

        <ol className="mt-12 border-t border-[var(--line)] lg:mt-16">
          {PROMISES.items.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              style={{ "--reveal-delay": `${i * 0.06}s` } as CSSProperties}
              className="group relative grid grid-cols-[2.75rem_1fr] items-baseline gap-x-4 gap-y-2 border-b border-[var(--line)] py-6 md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-8 md:py-8"
            >
              {/* the spot slides in under the row on hover */}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 bg-[var(--spot)] transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-x-100" />
              <span className="t-num text-[0.85rem] font-medium text-[var(--ink-3)] transition-colors duration-500 group-hover:text-[var(--spot)]">0{i + 1}</span>
              <h3 className="t-h3 transition-transform duration-700 ease-[var(--ease-out)] md:group-hover:translate-x-2">{item.title}</h3>
              <p className="t-body col-start-2 max-w-[28rem] text-[1.075rem] md:col-start-3">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
