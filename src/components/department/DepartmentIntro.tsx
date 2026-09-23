"use client";

import { BUSINESS } from "@/content/copy";
import { useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { type Department } from "@/content/departments";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useLeave } from "./useLeave";

const QUIET_LINK =
  "t-label text-[var(--text-1)]! underline decoration-[var(--line-strong)] underline-offset-[5px] transition-colors duration-300 ease-[var(--ease-out)] hover:text-[var(--text-0)]! hover:decoration-[var(--text-1)]";

/**
 * First viewport of a department: where the visitor is in the organisation, who works here and what
 * it handles. Kept short on purpose, so the agent and the top edge of its workstation are already
 * in frame underneath when the transition cover lifts.
 */
export function DepartmentIntro({ department }: { department: Department }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const lenis = useLenis();
  const onLeave = useLeave();

  // A client-side route change does not move focus: put screen readers on the new page's title.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  // Jump, never glide: a smooth scroll to the end would play the whole film on fast-forward.
  const skip = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("report");
    if (!target) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else target.scrollIntoView();
    document.getElementById("report-title")?.focus({ preventScroll: true });
  };

  return (
    <header className="relative px-[var(--gutter)] pb-[clamp(28px,5svh,64px)] pt-[calc(var(--nav-h)+clamp(28px,7svh,88px))]">
      <div className="mx-auto w-full max-w-[1888px]">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <li>
              <Link href="/#business-doors" onClick={onLeave} className={QUIET_LINK}>
                {BUSINESS.short}
              </Link>
            </li>
            <li aria-hidden className="t-label">
              →
            </li>
            <li aria-current="page" className="flex items-center gap-2.5">
              <span className="spot" />
              <span className="t-label text-[var(--text-0)]!">{department.agentName}</span>
            </li>
          </ol>
        </nav>

        <h1 ref={heading} tabIndex={-1} className="t-display mt-6 outline-none md:mt-8">
          {department.agentName}
        </h1>
        <p className="t-lead mt-5 max-w-[36rem] md:mt-6">{department.oneLiner}</p>

        <ul aria-label="What it handles" className="mt-7 flex max-w-[44rem] flex-wrap gap-2">
          {department.handles.map((item) => (
            <li
              key={item}
              className="rounded-full border border-[var(--line)] px-3 py-[7px] font-mono text-[0.6875rem] uppercase leading-none tracking-[0.08em] text-[var(--text-1)]"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <p className="t-label flex items-center gap-3">
            <span aria-hidden className="block h-6 w-px bg-[var(--line-strong)]" />
            Scroll through a full shift
          </p>
          <a href="#report" onClick={skip} className={`${QUIET_LINK} -my-3 inline-block py-3`}>
            Skip sequence
          </a>
        </div>
      </div>
    </header>
  );
}
