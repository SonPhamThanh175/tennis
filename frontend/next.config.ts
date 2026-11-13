import type { NextConfig } from "next";

const backend = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://tennis-api-o1df.onrender.com'
).replace(/\/+$/, '');

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    if (!backend.startsWith('http')) return [];
    return [{ source: '/backend/:path*', destination: `${backend}/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
