import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Follow symlinks for the sentence-grid source
  webpack: (config) => {
    config.resolve.symlinks = true;
    return config;
  },
  // Allow server actions for the remix API
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
