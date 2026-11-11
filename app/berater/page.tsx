import type { Metadata } from "next";
import { AdvisorApp } from "@/components/advisor/AdvisorApp";
import { COPY, SEO_PAGE } from "@/lib/copy";
import { pageMeta, withSuffix } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: withSuffix(SEO_PAGE.beraterTitle),
  description: SEO_PAGE.beraterDescription,
  path: "/berater/",
});

export default function BeraterPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:pt-12">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-gold">Berater</p>
      <h1 className="serif mt-2 text-3xl text-paper sm:text-4xl">Passende Neuwagen finden</h1>
      <p className="mt-3 max-w-xl text-muted">{COPY.underCta}</p>
      <p className="mt-2 max-w-xl text-sm text-muted">{SEO_PAGE.beraterIntro}</p>
      <div className="mt-6 sm:mt-10">
        <AdvisorApp />
      </div>
    </div>
  );
}
