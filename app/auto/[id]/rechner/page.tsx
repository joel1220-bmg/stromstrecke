import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCalculator } from "@/components/advisor/CarCalculator";
import { JsonLd } from "@/components/JsonLd";
import { BASE_URL, breadcrumbs, pageMeta, withSuffix } from "@/lib/seo";
import { AUTO_ROUTE_ID, carById, comparableCars } from "@/lib/autopage";
import { AUTO_PAGE, COPY, fillCopy } from "@/lib/copy";
import { getCars, getRoute } from "@/lib/engine/evaluate";
import { formatCarName } from "@/lib/engine/labels";

/* The calculator for one car, as its own address so a search for
   "<Modell> Reichweitenrechner" can land on it. Built for every catalogue car;
   unknown ids are a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getCars().map((car) => ({ id: car.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = carById(id);
  if (!car) return {};
  const name = formatCarName(car);
  const title = withSuffix(fillCopy(AUTO_PAGE.calcMetaTitle, { car: name }));
  const description = fillCopy(AUTO_PAGE.calcMetaDescription, { car: name });
  return pageMeta({ title, description, path: `/auto/${car.id}/rechner/` });
}

export default async function AutoRechnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = carById(id);
  if (!car) notFound();
  const name = formatCarName(car);
  const compare = comparableCars(car, 3);
  const tripKm = getRoute(AUTO_ROUTE_ID)?.km ?? 500;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:pt-12">
      <JsonLd
        data={[
          breadcrumbs([
            { name: "Stromstrecke", path: "/" },
            { name: AUTO_PAGE.allCars, path: "/auto/" },
            { name, path: `/auto/${car.id}/` },
            { name: fillCopy(AUTO_PAGE.calcMetaTitle, { car: name }), path: `/auto/${car.id}/rechner/` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: fillCopy(AUTO_PAGE.calcH1, { car: name }),
            url: `${BASE_URL}/auto/${car.id}/rechner/`,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Browser",
            inLanguage: "de-DE",
            isAccessibleForFree: true,
          },
        ]}
      />
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-gold">
        <Link href={`/auto/${car.id}/`} className="hover:text-accent">
          {fillCopy(AUTO_PAGE.calcBack, { car: name })}
        </Link>
      </p>
      <h1 className="serif mt-2 text-3xl text-paper sm:text-4xl">
        {fillCopy(AUTO_PAGE.calcH1, { car: name })}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">{AUTO_PAGE.calcLead}</p>
      <p className="mt-2 max-w-2xl text-sm text-muted">{AUTO_PAGE.calcExplain}</p>
      <p className="mt-1 max-w-2xl text-sm text-muted">{COPY.notCertified}</p>
      <div className="mt-6 sm:mt-10">
        <CarCalculator
          carId={car.id}
          compareIds={compare.map((c) => c.id)}
          initialTripKm={tripKm}
        />
      </div>
      <section className="mt-12">
        <h2 className="serif text-xl text-paper">{AUTO_PAGE.calcCompareHeading}</h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {[car, ...compare].map((c) => (
            <li key={c.id}>
              <Link href={`/auto/${c.id}/`} className="text-accent underline-offset-4 hover:underline">
                {formatCarName(c)}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/auto/" className="text-accent underline-offset-4 hover:underline">
              {AUTO_PAGE.allCars}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
