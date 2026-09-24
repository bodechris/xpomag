import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const magazineSrc = path.resolve(__dirname, "../../packages/magazine/src");

const nextConfig = {
  devIndicators: false,
  transpilePackages: ["@xpomag/ui", "@xpomag/magazine"],
  turbopack: {
    resolveAlias: {
      "@xpomag/magazine": path.join(magazineSrc, "index.ts"),
      "@xpomag/magazine/renderer": path.join(magazineSrc, "renderer.tsx"),
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@xpomag/magazine": path.join(magazineSrc, "index.ts"),
      "@xpomag/magazine/renderer": path.join(magazineSrc, "renderer.tsx"),
    };
    return config;
  },
};

export default nextConfig;
