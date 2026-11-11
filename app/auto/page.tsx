import type { Metadata } from "next";
import Link from "next/link";
import { formatDeSpan, formatDeUnit } from "@/components/ui/Num";
import { OVERVIEW_OUTDOOR_C, OVERVIEW_SPEED, carsByBrand, overviewRange } from "@/lib/autopage";
import { AUTO_PAGE, MONTH_LABEL, fillCopy } from "@/lib/copy";
import { formatCarName } from "@/lib/engine/labels";

export const metadata: Metadata = {
  title: `${AUTO_PAGE.overviewTitle} · Stromstrecke`,
  description: AUTO_PAGE.overviewLead,
  alternates: { canonical: "/auto/" },
};

export default function AutoOverviewPage() {
  const groups = carsByBrand();
  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:pt-12">
      <h1 className="serif text-3xl text-paper sm:text-4xl">{AUTO_PAGE.overviewTitle}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink">{AUTO_PAGE.overviewLead}</p>
      <p className="mt-2 text-sm text-muted">
        {fillCopy(AUTO_PAGE.overviewNote, { temp: formatDeUnit(OVERVIEW_OUTDOOR_C, "°C"), month: MONTH_LABEL[5], speed: formatDeUnit(OVERVIEW_SPEED, "km/h") })}
      </p>
      {groups.map(({ brand, cars }) => (
        <section key={brand} className="mt-8">
          <h2 className="serif text-xl text-paper">{brand}</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
            {cars.map((car) => {
              const range = overviewRange(car);
              return (
                <li key={car.id}>
                  <Link
                    href={`/auto/${car.id}/`}
                    className="flex min-h-12 items-baseline justify-between gap-4 px-5 py-3 hover:text-accent"
                  >
                    <span className="text-ink">{formatCarName(car)}</span>
                    <span className="tabular-nums text-muted">
                      {formatDeSpan(range.lowKm, range.highKm, { unit: "km" })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
