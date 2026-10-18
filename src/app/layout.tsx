import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Inter } from "next/font/google";
import { Footer } from "@/components/chrome/Footer";
import { Intro } from "@/components/chrome/Intro";
import { Nav } from "@/components/chrome/Nav";
import { Reveals } from "@/components/motion/Reveals";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SITE } from "@/content/site";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Inter carries the reading text. Big Shoulders, the condensed lettering of tags, bins and work orders,
// sets every headline, label and stamp (its optical sizes take it from field labels to the hero).
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", axes: ["opsz"] });
const bigShoulders = Big_Shoulders({ variable: "--font-big-shoulders", subsets: ["latin"], display: "swap", axes: ["opsz"] });

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
  themeColor: "#e8d5a3",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${bigShoulders.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-svh">
        {/* Runs before first paint. Arms the reveal starting states and the opening logo cover only when
            JS and motion are both available, and disarms both if the app never boots, so copy can never
            be stranded invisible and no visitor can be stranded behind the cover. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: no-preference)').matches){d.dataset.motion='on';var seen=0;try{seen=sessionStorage.getItem('os-intro')}catch(e){}if(!location.hash&&!seen)d.dataset.intro='on';setTimeout(function(){if(!window.__osReady){delete d.dataset.motion;delete d.dataset.intro}},4000)}}catch(e){}",
          }}
        />
        {/* First in the body: the cover's markup travels in the first bytes, so the page cannot paint before it. */}
        <Intro />
        <SmoothScroll>
          <a
            href="#content"
            className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-[4px] bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)] focus:translate-y-0"
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
