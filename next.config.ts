import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.4'],
  experimental: {
    agentFeedback: true,
  },
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images:{
    remotePatterns:[
      {
        protocol : "https",
        hostname: "api-assets.clashofclans.com",
      }
    ]
  }
};

export default nextConfig;
