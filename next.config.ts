import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    staleTimes: {
      dynamic: 30,   // cache dynamic pages for 30s on client nav
      static: 180,   // cache static pages for 3min on client nav
    },
  },
};

export default nextConfig;
