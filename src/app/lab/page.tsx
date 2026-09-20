import type { Metadata } from "next";
import { LabClient } from "./LabClient";

export const metadata: Metadata = { title: "Lab", robots: { index: false, follow: false } };

/** Internal bench for the agent family. Not linked from the site. */
export default function LabPage() {
  return <LabClient />;
}
