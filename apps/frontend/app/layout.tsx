import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProviders } from "./providers/app-providers";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", display: "swap" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "XpoMag", template: "%s · XpoMag" },
  description: "A city magazine for discovering the businesses, people and stories shaping where you live.",
  openGraph: { title: "XpoMag", description: "Your city, curated as a magazine.", type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/api/editorial-fonts" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
