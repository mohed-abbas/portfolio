import type { Metadata } from "next";
import { Doppio_One } from "next/font/google";
import "./globals.css";

const doppioOne = Doppio_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-navbar",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MOHED ABBAS - Designer",
  description:
    "Portfolio of Mohed Abbas - UI/UX Designer specializing in brand strategy, interactive design, and digital products.",
  keywords: [
    "UI/UX Designer",
    "Brand Strategy",
    "Interactive Design",
    "Portfolio",
    "Mohed Abbas",
  ],
  authors: [{ name: "Mohed Abbas" }],
  openGraph: {
    title: "MOHED ABBAS - Designer",
    description:
      "Portfolio of Mohed Abbas - UI/UX Designer specializing in brand strategy, interactive design, and digital products.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={doppioOne.variable}>{children}</body>
    </html>
  );
}
