import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Inter_Tight, JetBrains_Mono } from "next/font/google";
import CosmosStage from "@/components/CosmosStage";
import CustomCursor from "@/components/CustomCursor";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/content/site";
import "./globals.css";

const display = Inter_Tight({ subsets: ["latin"], variable: "--ff-display" });
const thai = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600"], variable: "--ff-thai" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--ff-mono" });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s — ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#04050a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${display.variable} ${thai.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          ข้ามไปยังเนื้อหา
        </a>
        <CosmosStage />
        <CustomCursor />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <noscript>
          <style>{`.loader{display:none}.intro-char,.intro-fade,.reveal{opacity:1!important;transform:none!important;filter:none!important;animation:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
