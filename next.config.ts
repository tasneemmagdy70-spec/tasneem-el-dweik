import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // dev only: lets a phone on the same Wi-Fi load the site (http://192.168.1.14:3000).
  // If the laptop's network address changes, put the new one here and restart `npm run dev`.
  allowedDevOrigins: ["192.168.1.14"],
  // the dev-only "N" badge would sit on top of the floating "Let's talk" / the orbit counter — hide it (errors still show)
  devIndicators: false,
  // don't advertise the framework/version in every response
  poweredByHeader: false,
  // Security headers for every page. The site has no logins, forms or stored data, so the
  // real risks are being framed by another site (clickjacking) and browser-level hardening.
  // (A script-src CSP is left out on purpose: it would need per-request nonces, which would
  // turn this static site into a server-rendered one for no real gain.)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 95 for the portrait: faces lose detail fast under heavy compression.
    qualities: [75, 95],
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
