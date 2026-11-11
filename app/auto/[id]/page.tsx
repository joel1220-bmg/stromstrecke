import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import climateJson from "@/data/climate-months.de.json";
import { formatDeSpan, formatDeUnit } from "@/components/ui/Num";
import { JsonLd } from "@/components/JsonLd";
import { AUTO_MONTHS, AUTO_ROUTE_ID, autoPageData, carById, comparableCars } from "@/lib/autopage";
import { AUTO_PAGE, BODY_CHIP, COPY, MONTH_LABEL, fillCopy } from "@/lib/copy";
import { breadcrumbs, isoToDe, pageMeta, withSuffix } from "@/lib/seo";
import { catalogAsOf, getCars, getRoute } from "@/lib/engine/evaluate";
import { formatCarName } from "@/lib/engine/labels";

/* One page per catalogue car, written out at build time (static export). An
   id that is not in the catalogue is a 404, never a page built on the fly. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getCars().map((car) => ({ id: car.id }));
}

const climate = climateJson as { months: Record<string, number> };

function hm(min: number): string {
  const m = Math.round(min);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")} h`;
}

/** Typographic minus, as the rest of the site prints temperatures. */
function celsius(c: number): string {
  return `${c.toLocaleString("de-DE").replace("-", "\u2212")}\u00a0°C`;
}

function minutes(min: number): string {
  return min >= 60 ? hm(min) : formatDeUnit(Math.round(min), "Min.");
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
  const title = withSuffix(fillCopy(AUTO_PAGE.metaTitle, { car: name }));
  const description = fillCopy(AUTO_PAGE.metaDescription, {
    car: name,
    route: getRoute(AUTO_ROUTE_ID)?.name ?? "",
  });
  return pageMeta({ title, description, path: `/auto/${car.id}/` });
}

export default async function AutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = carById(id);
  if (!car) notFound();
  const data = autoPageData(car);
  const name = formatCarName(car);
  const asOf = catalogAsOf();
  const speed = (s: number) => formatDeUnit(s, "km/h");
  /* January at 130 km/h: the case beginners worry about, used for the facts,
     the comparison and the ranking below. */
  const hard = data.cells[1];
  const similar = comparableCars(car, 3).map((c) => ({ car: c, range: autoPageData(c).cells[1].range }));
  const group = [{ car, range: hard.range }, ...similar];
  const byMid = [...group].sort((a, b) => b.range.midKm - a.range.midKm);
  const pct = (km: number) => Math.round((km / car.wltpKm) * 100);

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:pt-12">
      <JsonLd
        data={breadcrumbs([
          { name: "Stromstrecke", path: "/" },
          { name: AUTO_PAGE.allCars, path: "/auto/" },
          { name, path: `/auto/${car.id}/` },
        ])}
      />
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-gold">
        <Link href="/auto/" className="hover:text-accent">
          {AUTO_PAGE.allCars}
        </Link>
      </p>
      <h1 className="serif mt-2 text-3xl text-paper sm:text-4xl">
        {fillCopy(AUTO_PAGE.h1, { car: name })}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink">
        {fillCopy(AUTO_PAGE.lead, { wltp: formatDeUnit(car.wltpKm, "km") })}
      </p>
      <p className="mt-2 text-sm text-muted">{COPY.wltpAlways}</p>

      <section className="mt-10">
        <h2 className="serif text-2xl text-paper">{AUTO_PAGE.rangeHeading}</h2>
        <p className="mt-2 text-muted">
          {fillCopy(AUTO_PAGE.rangeExplain, { persons: String(data.persons) })}
        </p>
        <dl className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface">
          {data.cells.map((cell) => (
            <div
              key={`${cell.month}-${cell.speedKph}`}
              className="flex items-baseline justify-between gap-4 px-5 py-4"
            >
              <dt className="text-ink">
                {fillCopy(AUTO_PAGE.rangeRow, {
                  month: MONTH_LABEL[cell.month],
                  speed: speed(cell.speedKph),
                })}
              </dt>
              <dd className="text-xl font-semibold text-paper tabular-nums">
                {formatDeSpan(cell.range.lowKm, cell.range.highKm, { unit: "km" })}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="serif text-2xl text-paper">
          {fillCopy(AUTO_PAGE.tripHeading, { route: data.trips[0].routeName })}
        </h2>
        <p className="mt-2 text-muted">
          {fillCopy(AUTO_PAGE.tripExplain, { km: formatDeUnit(data.trips[0].km, "km") })}
        </p>
        <ul className="mt-5 space-y-3">
          {data.trips.map((trip) => (
            <li
              key={`${trip.month}-${trip.speedKph}`}
              className="rounded-2xl border border-line bg-surface px-5 py-4"
            >
              <p className="font-semibold text-paper">
                {fillCopy(AUTO_PAGE.tripRow, {
                  month: MONTH_LABEL[trip.month],
                  speed: speed(trip.speedKph),
                })}
              </p>
              <p className="mt-1 text-ink">
                {trip.stops === 0
                  ? AUTO_PAGE.tripNoStop
                  : fillCopy(AUTO_PAGE.tripStops, {
                      n: String(trip.stops),
                      min: minutes(trip.chargeMin),
                    })}
              </p>
              <p className="mt-1 text-ink">
                {fillCopy(AUTO_PAGE.tripTotal, {
                  span:
                    trip.totalSpan.low === trip.totalSpan.high
                      ? hm(trip.totalSpan.mid)
                      : `${hm(trip.totalSpan.low).replace(" h", "")}–${hm(trip.totalSpan.high)}`,
                })}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="serif text-2xl text-paper">{AUTO_PAGE.factsHeading}</h2>
        <ul className="mt-4 space-y-2 text-ink">
          <li>{fillCopy(AUTO_PAGE.factBattery, { kwh: formatDeUnit(car.usableKwh, "kWh", car.usableKwh % 1 ? 1 : 0) })}</li>
          <li>{fillCopy(AUTO_PAGE.factCharge, { kw: formatDeUnit(car.dcPeakKw, "kW") })}</li>
          <li>{fillCopy(AUTO_PAGE.factBody, { body: BODY_CHIP[car.body], seats: String(car.seats) })}</li>
          <li>{car.heatPump ? AUTO_PAGE.factHeatPumpYes : AUTO_PAGE.factHeatPumpNo}</li>
          <li>
            {fillCopy(AUTO_PAGE.factWltpShare, {
              month: MONTH_LABEL[hard.month],
              speed: speed(hard.speedKph),
              span: formatDeSpan(pct(hard.range.lowKm), pct(hard.range.highKm), { unit: "%" }),
            })}
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="serif text-2xl text-paper">{AUTO_PAGE.similarHeading}</h2>
        <p className="mt-2 text-muted">
          {fillCopy(AUTO_PAGE.similarExplain, { month: MONTH_LABEL[hard.month], speed: speed(hard.speedKph) })}
        </p>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {similar.map(({ car: c, range }) => (
            <li key={c.id}>
              <Link
                href={`/auto/${c.id}/`}
                className="flex min-h-12 items-baseline justify-between gap-4 px-5 py-3 hover:text-accent"
              >
                <span className="text-ink">{formatCarName(c)}</span>
                <span className="tabular-nums text-muted">
                  {formatDeSpan(range.lowKm, range.highKm, { unit: "km" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          {fillCopy(AUTO_PAGE.rankLine, {
            n: String(group.length),
            month: MONTH_LABEL[hard.month],
            speed: speed(hard.speedKph),
            best: formatCarName(byMid[0].car),
            worst: formatCarName(byMid[byMid.length - 1].car),
          })}
        </p>
      </section>

      <p className="mt-8 text-sm italic text-muted">
        {fillCopy(AUTO_PAGE.assumptions, {
          winterC: celsius(climate.months[String(AUTO_MONTHS.winter)]),
          summerC: celsius(climate.months[String(AUTO_MONTHS.summer)]),
        })}
      </p>
      {car.notes ? <p className="mt-3 text-sm text-muted">{AUTO_PAGE.unverified}</p> : null}

      <div className="mt-10 flex flex-col items-start gap-3">
        <Link
          href={`/auto/${car.id}/rechner/`}
          className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 text-base font-semibold text-graphite hover:bg-gold-dim"
        >
          {fillCopy(AUTO_PAGE.cta, { car: name })}
        </Link>
        <p className="text-sm text-muted">{AUTO_PAGE.ctaHint}</p>
      </div>

      <p className="mt-10 text-sm text-muted">
        {fillCopy(AUTO_PAGE.listPrice, { price: formatDeUnit(car.listEur, "€") })}.{" "}
        {fillCopy(COPY.carDataNote, { asOf: isoToDe(asOf ?? car.asOf) })} {COPY.carDataReport}
      </p>
    </article>
  );
}
