import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers/app-providers";


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
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
