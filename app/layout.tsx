import type { Metadata } from "next";
import { Source_Sans_3, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Harmonium Studio",
  description:
    "A minimal keyboard-driven harmonium built with Web Audio synthesis and motion-rich key feedback.",
};

/**
 * Root application layout and font configuration.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className="bg-ink-950" lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
