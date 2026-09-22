import type { MetadataRoute } from "next";

/* Missing until 22.09.2026; /robots.txt answered with the 404 page. Everything
   may be crawled, there is nothing here to hide. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://stromstrecke.de/sitemap.xml",
  };
}
