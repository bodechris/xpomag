import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { AppProviders } from "./providers/app-providers";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XpoMag Business",
  description: "Manage your XpoMag business profile, stories and promotions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
