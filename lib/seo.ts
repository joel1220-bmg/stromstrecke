import type { Metadata } from "next";

/*
 * Per-page metadata in one shape. Added 11.11.2026: a page that sets its own
 * `openGraph` replaces the layout's object completely, so every car page lost
 * its preview image, site name and locale, and kept the landing page's twitter
 * text. This builds the whole set for a page. The title suffix is added only
 * while the result stays within what search results show (about 60 signs).
 */
export const SITE = "Stromstrecke";
export const BASE_URL = "https://stromstrecke.de";
const TITLE_MAX = 60;

export function withSuffix(title: string): string {
  const full = `${title} · ${SITE}`;
  return full.length <= TITLE_MAX ? full : title;
}

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE,
      locale: "de_DE",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

/** German date for an ISO day, without Date: "2026-09-13" -> "13.09.2026". */
export function isoToDe(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.path}`,
    })),
  };
}
