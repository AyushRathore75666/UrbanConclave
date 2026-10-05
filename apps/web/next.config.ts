import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/agenda", destination: "/#agenda", permanent: true },
      { source: "/sectors", destination: "/#sessions", permanent: true },
      { source: "/sectors/:path*", destination: "/#sessions", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
      { source: "/why-invest", destination: "/#why", permanent: true },
      { source: "/downloads", destination: "/", permanent: true },
      { source: "/media", destination: "/", permanent: true },
      { source: "/support", destination: "/invest", permanent: true },
    ];
  },
  async rewrites() {
    const api = process.env.API_INTERNAL_URL || "http://127.0.0.1:4000";
    return [{ source: "/backend/:path*", destination: `${api}/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
