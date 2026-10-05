import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory would otherwise be picked as the workspace root.
  turbopack: { root: path.resolve(__dirname) },
  // Standalone sales demos live as static pages in public/demos; serve them without the .html suffix.
  async rewrites() {
    return [{ source: "/demos/:slug", destination: "/demos/:slug.html" }];
  },
};

export default nextConfig;
