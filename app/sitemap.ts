import type { MetadataRoute } from "next";
import { catalogAsOf, getCars } from "@/lib/engine/evaluate";

/* With a trailing slash, as the pages are actually served: /berater redirects
   to /berater/, and a sitemap should not list redirects. No lastModified, it
   would change on every build without the page having changed. */
export const dynamic = "force-static";

const BASE = "https://stromstrecke.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const carPages = getCars().flatMap((car) => [`/auto/${car.id}/`, `/auto/${car.id}/rechner/`]);
  /* Car pages carry the catalogue date: it moves only when the data does. */
  const asOf = catalogAsOf();
  return ["/", "/berater/", "/auto/", ...carPages, "/impressum/", "/datenschutz/"].map((path) => ({
    url: `${BASE}${path}`,
    ...(asOf && path.startsWith("/auto/") ? { lastModified: asOf } : {}),
  }));
}
