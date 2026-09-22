import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/*
 * stromstrecke.de is a static export served by lima-city (Apache behind
 * openresty). There is no Node server in production, so `headers()` below only
 * applies to `next dev`; in production the same headers come from
 * `public/.htaccess`. `lib/htaccess.test.ts` fails if the two drift apart.
 *
 * `output` and `trailingSlash` were in no commit before 22.09.2026. The site
 * had nonetheless been built this way: every live link ends in a slash and the
 * export's `404.html` answers unknown paths. Whatever built it lived outside
 * this repository, which is how the live legal pages came to differ from the
 * repo's once already.
 */
export function securityHeaders(dev: boolean): { key: string; value: string }[] {
  const csp = [
    "default-src 'self'",
    dev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
  ];
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  /* Only for `next dev`. A static export cannot send headers, and Next warns
     at build time if this is set while exporting. */
  ...(isDev
    ? {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders(true) }];
        },
      }
    : {}),
};

export default nextConfig;
