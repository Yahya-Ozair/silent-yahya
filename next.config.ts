import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thedesifood.com",
      },
    ],
  },
};

export default nextConfig;