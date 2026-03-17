import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // pdf-parse uses Node.js built-ins; keep API routes on Node runtime
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
