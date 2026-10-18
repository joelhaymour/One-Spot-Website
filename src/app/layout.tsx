import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Footer } from "@/components/chrome/Footer";
import { Intro } from "@/components/chrome/Intro";
import { Nav } from "@/components/chrome/Nav";
import { Reveals } from "@/components/motion/Reveals";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SITE } from "@/content/site";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Inter carries the page, as it does in the One Spot HUD. Instrument Serif survives only as the fictional
// store's own type in the Websites mockups.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", axes: ["opsz"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
    url: "./",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ec",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-svh">
        {/* Runs before first paint. Arms the reveal starting states and the opening logo cover only when
            JS and motion are both available, and disarms both if the app never boots, so copy can never
            be stranded invisible and no visitor can be stranded behind the cover. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: no-preference)').matches){d.dataset.motion='on';if(!location.hash)d.dataset.intro='on';setTimeout(function(){if(!window.__osReady){delete d.dataset.motion;delete d.dataset.intro}},4000)}}catch(e){}",
          }}
        />
        {/* First in the body: the cover's markup travels in the first bytes, so the page cannot paint before it. */}
        <Intro />
        <SmoothScroll>
          <a
            href="#content"
            className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)] focus:translate-y-0"
          >
            Skip to content
          </a>
          <Nav />
          {children}
          <Footer />
          <Reveals />
        </SmoothScroll>
      </body>
    </html>
  );
}
