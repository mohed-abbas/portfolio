import type { Metadata } from "next";
import { Doppio_One } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { AccentColorProvider } from "@/lib/AccentColorContext";
import { LenisProvider } from "@/lib/LenisProvider";
import siteMetadata from "@/data/site-metadata.json";

const doppioOne = Doppio_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-navbar",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  openGraph: {
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
    type: siteMetadata.openGraph.type as "website",
    locale: siteMetadata.openGraph.locale,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={doppioOne.variable}>
        <Script id="scroll-restore" strategy="beforeInteractive">{`if("scrollRestoration"in history){history.scrollRestoration="manual"}window.scrollTo(0,0);`}</Script>
        <LenisProvider>
          <AccentColorProvider>
            <CustomCursor />
            {children}
          </AccentColorProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
