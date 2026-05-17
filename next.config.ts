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

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Redirect /share/:id to /shared/:id for backwards compatibility
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
