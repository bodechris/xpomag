"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
var local_1 = require("next/font/local");
require("./globals.css");
var app_providers_1 = require("./providers/app-providers");
var geistSans = (0, local_1.default)({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", display: "swap" });
var geistMono = (0, local_1.default)({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", display: "swap" });
exports.metadata = {
    metadataBase: new URL((_a = process.env.NEXT_PUBLIC_SITE_URL) !== null && _a !== void 0 ? _a : "http://localhost:3000"),
    title: { default: "XpoMag", template: "%s · XpoMag" },
    description: "A city magazine for discovering the businesses, people and stories shaping where you live.",
    openGraph: { title: "XpoMag", description: "Your city, curated as a magazine.", type: "website" }
};
function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en">
      <head>
        <link rel="stylesheet" href="/api/editorial-fonts"/>
      </head>
      <body className={"".concat(geistSans.variable, " ").concat(geistMono.variable)}>
        <app_providers_1.AppProviders>{children}</app_providers_1.AppProviders>
      </body>
    </html>);
}
