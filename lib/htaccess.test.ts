/**
 * The production security headers live in two places, and must say the same.
 *
 * stromstrecke.de is a static export: no Node server, so `headers()` in
 * `next.config.ts` never reaches a visitor. lima-city's Apache sends the
 * headers from `public/.htaccess` instead, while `next dev` still uses the
 * config. A CSP tightened in one file and forgotten in the other would pass
 * every local check and ship the old policy, or the other way round, break
 * the live site while dev keeps working. This walks both.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import config, { securityHeaders } from "../next.config";

const htaccess = readFileSync("public/.htaccess", "utf8");

function htaccessHeader(name: string): string | undefined {
  const m = htaccess.match(new RegExp(`^\\s*Header always set ${name} "([^"]*)"`, "m"));
  return m?.[1];
}

describe("public/.htaccess sends what next.config.ts declares", () => {
  for (const { key, value } of securityHeaders(false)) {
    it(`sends ${key} unchanged`, () => {
      expect(htaccessHeader(key), `${key} missing or different in .htaccess`).toBe(value);
    });
  }

  it("sends no production header that next.config.ts does not know", () => {
    const known = new Set(securityHeaders(false).map((h) => h.key));
    const set = [...htaccess.matchAll(/^\s*Header always set (\S+)/gm)].map((m) => m[1]);
    expect(set.filter((k) => !known.has(k))).toEqual([]);
  });

  it("never allows eval outside development", () => {
    const csp = securityHeaders(false).find((h) => h.key === "Content-Security-Policy")!;
    expect(csp.value).not.toContain("unsafe-eval");
  });
});

describe("the export matches how the server serves it", () => {
  it("is a static export with trailing slashes", () => {
    /* lima-city serves /berater/ from berater/index.html and redirects
       /berater to it. Without trailingSlash the export writes berater.html,
       and every internal link would 404. */
    expect(config.output).toBe("export");
    expect(config.trailingSlash).toBe(true);
  });

  it("answers unknown paths with the export's own 404 page", () => {
    expect(htaccess).toMatch(/^ErrorDocument 404 \/404\.html$/m);
  });
});
