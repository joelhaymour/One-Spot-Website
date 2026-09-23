import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/chrome/Footer";
import { Intro } from "@/components/chrome/Intro";
import { MotionToggle } from "@/components/chrome/MotionToggle";
import { Nav } from "@/components/chrome/Nav";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TransitionLayer } from "@/components/motion/Transition";
import { HERO, SITE } from "@/content/copy";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${HERO.headline.join(" ")}`,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
    url: "./",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#040506",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-svh">
        {/* Runs before first paint. Arms the reveal starting state and the opening logo cover only when
            JS and motion are both available, and disarms both if the app never boots, so copy can never
            be stranded invisible and no visitor can be stranded behind the cover. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: no-preference)').matches){d.dataset.motion='on';d.dataset.intro='on';setTimeout(function(){if(!window.__osReady){delete d.dataset.motion;delete d.dataset.intro}},4000)}}catch(e){}",
          }}
        />
        {/* First in the body on purpose: the cover's markup travels in the first bytes, so on a slow
            connection the page cannot paint before the cover exists. It is fixed and z-[100]; order costs nothing. */}
        <Intro />
        <SmoothScroll>
          <Nav />
          {children}
          <Footer />
          <MotionToggle />
          <TransitionLayer />
        </SmoothScroll>
        {/* film grain over everything: breaks up near-black banding and ties DOM and WebGL together */}
        <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[70]" />
      </body>
    </html>
  );
}
