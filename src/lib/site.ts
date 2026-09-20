/**
 * The site's public origin, resolved once for metadata, robots and the sitemap.
 * Order: explicit NEXT_PUBLIC_SITE_URL, then Vercel's production domain, then localhost.
 * An empty string counts as unset (`??` would not catch it and `new URL("")` throws).
 */
const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

export const SITE_URL = (explicit || (vercel ? `https://${vercel}` : "") || "http://localhost:3000").replace(/\/+$/, "");

if (process.env.NODE_ENV === "production" && !explicit && !vercel) {
  console.warn(
    "[one-spot] NEXT_PUBLIC_SITE_URL is not set. Sitemap, robots and Open Graph URLs will point at http://localhost:3000. Set it and rebuild before launch.",
  );
}
