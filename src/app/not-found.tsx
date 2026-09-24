import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/ui/Mark";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="content" className="wrap flex min-h-svh flex-col items-start justify-center gap-7 py-[calc(var(--nav-h)+48px)]">
      <p className="flex items-center gap-3 text-[var(--ink)]">
        <Mark size={22} />
        <span className="t-small t-num">404</span>
      </p>
      <h1 className="t-h2 max-w-[16ch]">
        This page isn&rsquo;t <em>in one spot.</em>
      </h1>
      <p className="t-lead max-w-[32rem]">Nothing lives at this address. Everything else is right where you left it.</p>
      <Link href="/" className="btn btn-primary mt-2">
        Back to the homepage
      </Link>
    </main>
  );
}
