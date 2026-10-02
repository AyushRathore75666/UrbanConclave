import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari, Source_Serif_4 } from "next/font/google";
import { getLocale } from "@/lib/content";
import "./globals.css";

const sans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Madhya Pradesh Urban Growth Conclave 2.0",
    template: "%s | Urban Growth Conclave 2.0",
  },
  description: "Building Urban Momentum Towards GIS 2027. 28 October 2026, Brilliant Convention Centre, Indore.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale === "hi" ? "hi" : "en"} className={`${sans.variable} ${devanagari.variable} ${serif.variable}`}>
      <body className="bg-sand font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
