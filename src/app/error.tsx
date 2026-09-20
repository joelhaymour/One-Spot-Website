"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";

/** Last resort. The 3D layer has its own boundary and falls back to SVG agents long before this. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="content" className="flex min-h-svh flex-col items-start justify-center gap-7 px-[var(--gutter)]">
      <Eyebrow>Something stopped</Eyebrow>
      <h1 className="t-title max-w-[36rem]">This page hit a problem it could not recover from.</h1>
      <p className="t-lead max-w-[32rem]">Nothing you did. Try it again, and if it keeps happening the rest of the site still works.</p>
      <Button onClick={reset} arrow>
        Try again
      </Button>
    </main>
  );
}
