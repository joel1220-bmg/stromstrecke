import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { formatDeSpan, formatDeUnit } from "@/components/ui/Num";
import { AUTO_MONTHS, OVERVIEW_OUTDOOR_C, OVERVIEW_SPEED, autoPageData, carsByBrand, overviewRange } from "@/lib/autopage";
import { AUTO_PAGE, MONTH_LABEL, fillCopy } from "@/lib/copy";
import { getCars } from "@/lib/engine/evaluate";
import { formatCarName } from "@/lib/engine/labels";
import { BASE_URL, breadcrumbs, pageMeta, withSuffix } from "@/lib/seo";

const n = String(getCars().length);

export const metadata: Metadata = pageMeta({
  title: withSuffix(fillCopy(AUTO_PAGE.overviewMetaTitle, { n })),
  description: fillCopy(AUTO_PAGE.overviewMetaDescription, { n }),
  path: "/auto/",
});

export default function AutoOverviewPage() {
  const groups = carsByBrand();
  const kmh = (s: number) => formatDeUnit(s, "km/h");
  const colMild = fillCopy(AUTO_PAGE.overviewColMild, {
    temp: formatDeUnit(OVERVIEW_OUTDOOR_C, "°C"),
    month: MONTH_LABEL[5],
    speed: kmh(OVERVIEW_SPEED),
  });
  const colWinter = fillCopy(AUTO_PAGE.overviewColWinter, { month: MONTH_LABEL[AUTO_MONTHS.winter], speed: kmh(130) });
  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:pt-12">
      <JsonLd
        data={[
          breadcrumbs([
            { name: "Stromstrecke", path: "/" },
            { name: AUTO_PAGE.allCars, path: "/auto/" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: AUTO_PAGE.overviewTitle,
            itemListElement: groups
              .flatMap((g) => g.cars)
              .map((car, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: formatCarName(car),
                url: `${BASE_URL}/auto/${car.id}/`,
              })),
          },
        ]}
      />
      <h1 className="serif text-3xl text-paper sm:text-4xl">{AUTO_PAGE.overviewTitle}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink">{AUTO_PAGE.overviewLead}</p>
      <p className="mt-2 text-sm text-muted">{fillCopy(AUTO_PAGE.overviewNote, { persons: String(autoPageData(getCars()[0]).persons) })}</p>
      {groups.map(({ brand, cars }) => (
        <section key={brand} className="mt-8">
          <h2 className="serif text-xl text-paper">{brand}</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 font-normal">Modell</th>
                  <th scope="col" className="px-4 py-2 font-normal">{colMild}</th>
                  <th scope="col" className="px-4 py-2 font-normal">{colWinter}</th>
                  <th scope="col" className="px-4 py-2 font-normal"><span className="sr-only">{AUTO_PAGE.overviewCalc}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cars.map((car) => {
                  const mild = overviewRange(car);
                  const winter = autoPageData(car).cells[1].range;
                  return (
                    <tr key={car.id}>
                      <th scope="row" className="px-4 py-3 font-normal">
                        <Link href={`/auto/${car.id}/`} className="text-ink hover:text-accent">
                          {formatCarName(car)}
                        </Link>
                      </th>
                      <td className="px-4 py-3 tabular-nums text-ink">{formatDeSpan(mild.lowKm, mild.highKm, { unit: "km" })}</td>
                      <td className="px-4 py-3 tabular-nums text-ink">{formatDeSpan(winter.lowKm, winter.highKm, { unit: "km" })}</td>
                      <td className="px-4 py-3">
                        <Link href={`/auto/${car.id}/rechner/`} className="text-accent hover:underline">
                          {AUTO_PAGE.overviewCalc}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
