import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent bundling of server-only Node.js packages
  serverExternalPackages: [
    "openai",
    "@prisma/client",
    "prisma",
    "bcryptjs",
    "@auth/prisma-adapter",
    "next-auth",
  ],

  // Provide a dummy DATABASE_URL at build time so Prisma client
  // can be instantiated without crashing during static analysis.
  // The real value is injected at runtime via environment variables.
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://build:build@localhost:5432/build",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/share/:shareId",
        destination: "/shared/:shareId",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
