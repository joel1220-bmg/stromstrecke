import type { Metadata } from "next";
import Link from "next/link";
import { formatDeSpan, formatDeUnit } from "@/components/ui/Num";
import { autoPageData, carsByBrand } from "@/lib/autopage";
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
        {fillCopy(AUTO_PAGE.overviewNote, { month: MONTH_LABEL[1], speed: formatDeUnit(110, "km/h") })}
      </p>
      {groups.map(({ brand, cars }) => (
        <section key={brand} className="mt-8">
          <h2 className="serif text-xl text-paper">{brand}</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
            {cars.map((car) => {
              const winter = autoPageData(car).cells[0].range;
              return (
                <li key={car.id}>
                  <Link
                    href={`/auto/${car.id}/`}
                    className="flex min-h-12 items-baseline justify-between gap-4 px-5 py-3 hover:text-accent"
                  >
                    <span className="text-ink">{formatCarName(car)}</span>
                    <span className="tabular-nums text-muted">
                      {formatDeSpan(winter.lowKm, winter.highKm, { unit: "km" })}
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
