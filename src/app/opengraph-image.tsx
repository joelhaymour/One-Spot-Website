import { ImageResponse } from "next/og";
import { SITE } from "@/content/site";

export const alt = "One Spot. Look better. Work smarter. Get on with it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Uses the typeface bundled with next/og, so nothing is fetched at build time.
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
          padding: "72px 84px",
          backgroundColor: "#faf9f5",
          backgroundImage: "radial-gradient(circle at 88% 20%, rgba(189,70,39,0.12), rgba(189,70,39,0) 42%)",
          color: "#242621",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="56" height="56" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10.2" fill="none" stroke="#242621" strokeWidth="1.7" />
            <circle cx="12" cy="12" r="3.6" fill="#bd4627" />
          </svg>
          <div style={{ marginLeft: 20, fontSize: 34, letterSpacing: -1 }}>{SITE.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, lineHeight: 1.0, letterSpacing: -4.5 }}>
            <div>Look better.</div>
            <div style={{ color: "#bd4627" }}>Work smarter.</div>
          </div>
          <div style={{ marginTop: 30, fontSize: 28, color: "#4a4f57", letterSpacing: -0.4 }}>Better websites. Less busywork.</div>
        </div>
      </div>
    ),
    size,
  );
}
