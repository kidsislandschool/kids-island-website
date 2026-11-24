import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native module (SQLite) must not be bundled by the server bundler.
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // CMS-managed uploads live in /public/uploads and are served as-is.
    remotePatterns: [],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
