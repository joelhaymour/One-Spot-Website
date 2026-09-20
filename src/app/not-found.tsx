import type { Metadata } from "next";
import { SITE } from "@/content/copy";
import { Mark } from "@/components/agent/AgentSvg";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="content" className="relative flex min-h-svh items-center px-[var(--gutter)] py-[calc(var(--nav-h)_+_48px)]">
      <div className="mx-auto flex w-full max-w-[62rem] flex-col items-start gap-8">
        <p className="flex items-center gap-3 text-[var(--text-0)]">
          <Mark size={20} />
          <span className="t-label t-num text-[var(--text-1)]">404 · {SITE.name}</span>
        </p>
        <h1 className="t-statement max-w-[18ch]">This page isn&rsquo;t part of the business.</h1>
        <p className="t-lead max-w-[34rem]">Nothing is filed at this address. Everything else is where you left it.</p>
        <LinkButton href="/" arrow className="mt-2">
          Back to {SITE.name}
        </LinkButton>
      </div>
    </main>
  );
}
