import { ImageResponse } from "next/og";
import { HERO, SITE } from "@/content/copy";

export const alt = `${SITE.name}. ${HERO.headline.join(" ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Uses the typeface bundled with next/og (Geist Regular), so nothing is fetched at build time.
// Every element with more than one child needs an explicit display: flex (renderer constraint).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 84px",
          backgroundColor: "#040506",
          // the Spot's light spill, top left, where the mark sits
          backgroundImage: "radial-gradient(circle at 12% 14%, rgba(244,247,255,0.09), rgba(244,247,255,0) 46%)",
          color: "#f3f5f8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="56" height="56" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10.2" fill="none" stroke="#dbdee2" strokeWidth="1.25" />
            <circle cx="12" cy="12" r="2.6" fill="#f4f7ff" />
          </svg>
          <div style={{ marginLeft: 20, fontSize: 32, letterSpacing: -0.8 }}>{SITE.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: "#f4f7ff" }} />
            <div style={{ marginLeft: 16, fontSize: 21, letterSpacing: 3.4, textTransform: "uppercase", color: "#b4bac4" }}>
              {HERO.eyebrow}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 34, fontSize: 98, lineHeight: 1.02, letterSpacing: -4.2 }}>
            {HERO.headline.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
