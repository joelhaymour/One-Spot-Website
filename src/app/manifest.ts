import type { MetadataRoute } from "next";
import { SITE } from "@/content/copy";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "minimal-ui",
    background_color: "#040506",
    theme_color: "#040506",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" }],
  };
}
