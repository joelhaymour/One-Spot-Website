"use client";

import { useEffect } from "react";

/** Last resort for a render error anywhere on the page. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="content" className="wrap flex min-h-svh flex-col items-start justify-center gap-7">
      <p className="t-eyebrow">Something stopped</p>
      <h1 className="t-h3 max-w-[36rem]">This page hit a problem it couldn&rsquo;t recover from.</h1>
      <p className="t-lead max-w-[32rem]">Nothing you did. Try again, and if it keeps happening, reload the page.</p>
      <button type="button" onClick={reset} className="btn btn-primary">
        Try again
      </button>
    </main>
  );
}
