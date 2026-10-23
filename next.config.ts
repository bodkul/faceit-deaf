import type { NextConfig } from "next";

/** @type {import("next").NextConfig} */
const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "distribution.faceit-cdn.net",
        pathname: "/images/**",
      },
      new URL("https://assets.faceit-cdn.net/**"),
      new URL("https://flagcdn.com/w*/**.png"),
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
