import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCalculator } from "@/components/advisor/CarCalculator";
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
  const title = `${fillCopy(AUTO_PAGE.calcMetaTitle, { car: name })} · Stromstrecke`;
  const description = fillCopy(AUTO_PAGE.calcMetaDescription, { car: name });
  return {
    title,
    description,
    alternates: { canonical: `/auto/${car.id}/rechner/` },
    openGraph: { title, description },
  };
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
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-gold">
        <Link href={`/auto/${car.id}/`} className="hover:text-accent">
          {fillCopy(AUTO_PAGE.calcBack, { car: name })}
        </Link>
      </p>
      <h1 className="serif mt-2 text-3xl text-paper sm:text-4xl">
        {fillCopy(AUTO_PAGE.calcH1, { car: name })}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">{AUTO_PAGE.calcLead}</p>
      <p className="mt-1 max-w-2xl text-sm text-muted">{COPY.notCertified}</p>
      <div className="mt-6 sm:mt-10">
        <CarCalculator
          carId={car.id}
          compareIds={compare.map((c) => c.id)}
          initialTripKm={tripKm}
        />
      </div>
    </div>
  );
}
