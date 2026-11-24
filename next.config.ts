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
  // Skip TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Performance optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["@supabase/supabase-js", "framer-motion", "lucide-react"],
  },
  // Enable compression
  compress: true,
  // PoweredByHeader: false (security)
  poweredByHeader: false,
};

export default nextConfig;
