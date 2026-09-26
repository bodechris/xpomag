import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers/app-providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xpomag-frontend.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "XpoMag", template: "%s · XpoMag" },
  description: "A social magazine for discovering the businesses, people, places and stories shaping where you live.",
  applicationName: "XpoMag",
  creator: "XpoMag",
  publisher: "XpoMag",
  category: "magazine",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "XpoMag",
    description: "Your city, curated as a magazine.",
    type: "website",
    siteName: "XpoMag",
  },
  twitter: {
    card: "summary_large_image",
    title: "XpoMag",
    description: "Your city, curated as a magazine.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/api/editorial-fonts" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
