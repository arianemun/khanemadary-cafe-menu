import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import { elementBorderRadiusToCssVars } from "@/lib/element-radius";
import { menuMaxWidthToCss } from "@/lib/menu-width";
import {
  buildSiteIcons,
  getCafeDisplayName,
  getMetadataBase,
  getSiteDescription,
} from "@/lib/site-metadata";
import "./globals.css";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings("fa");
  const title = getCafeDisplayName(settings);
  return {
    metadataBase: getMetadataBase(),
    title,
    description: getSiteDescription(settings),
    icons: buildSiteIcons(settings.favicon),
  };
}

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      suppressHydrationWarning
      style={
        {
          "--accent-color": settings.menuColor,
          "--menu-max-width": menuMaxWidthToCss(settings.menuMaxWidth),
          ...elementBorderRadiusToCssVars(settings.elementBorderRadius),
        } as CSSProperties
      }
    >
      <body className={`${vazirmatn.variable} antialiased`}>{children}</body>
    </html>
  );
}
