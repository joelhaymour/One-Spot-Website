import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "One Spot — The AI operating layer for your company", template: "%s — One Spot" },
  description:
    "One Spot designs and builds the AI operating layer for your company: AI agents that connect the people, software and processes you already have.",
  openGraph: {
    title: "One Spot — Your whole business. One spot.",
    description: "AI agents that work across the people and software you already have. They watch. They act. They report to you.",
    type: "website",
    siteName: "One Spot",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-svh">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
