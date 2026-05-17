import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for deployment platforms (Vercel handles this automatically,
  // but it also prevents Turbopack from over-bundling server-only modules).
  output: "standalone",

  // Prevent bundling of server-only Node.js packages and packages that
  // ship their own React copy, which causes duplicate-React crashes during
  // static page generation on Turbopack.
  serverExternalPackages: [
    "openai",
    "@prisma/client",
    "prisma",
    "bcryptjs",
    "@auth/prisma-adapter",
    "next-auth",
    "@auth/core",
  ],

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
