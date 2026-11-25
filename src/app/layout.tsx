import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/content";
import { siteOrigin } from "@/lib/site-url";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#12325c",
  width: "device-width",
  initialScale: 1,
};

export function generateMetadata(): Metadata {
  const site = getSiteSettings();
  const base = siteOrigin();
  return {
    metadataBase: new URL(base),
    title: {
      default: `${site.name}, Aligarh`,
      template: `%s | ${site.shortName}`,
    },
    description:
      "Kids Island Senior Secondary School, Aligarh — quality education from nursery to class 12 with experienced faculty, modern facilities and a caring campus.",
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_IN",
    },
    robots: { index: true, follow: true },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
