import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { DEPARTMENTS } from "@/content/departments";

const BASE = SITE_URL;

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
