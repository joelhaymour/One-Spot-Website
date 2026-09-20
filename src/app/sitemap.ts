import type { MetadataRoute } from "next";
import { DEPARTMENTS } from "@/content/departments";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://onespot.example").replace(/\/+$/, "");

// No lastModified: a build-time date would claim every page changed on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    ...DEPARTMENTS.map((d) => ({
      url: `${BASE}/departments/${d.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
