import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// No lastModified: a build-time date would claim the page changed on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 }];
}
