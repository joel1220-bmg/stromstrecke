import climateJson from "@/data/climate-months.de.json";
import { getCars, getRoute } from "@/lib/engine/evaluate";
import { computeRange, computeTripPlan, outdoorForMonth } from "@/lib/engine/range";
import { emptyDraft } from "@/lib/engine/types";
import type { Car, MinSpan, RangeSpan, SpeedKph } from "@/lib/engine/types";

/*
 * Data for the static car pages under /auto/<id>/. Added 11.11.2026.
 *
 * The advisor renders in the browser, so a search engine reading /berater/
 * finds "Einen Moment …" and nothing else. These pages answer the same
 * question for one car, fixed at build time, with the engine's own functions
 * and the advisor's own defaults (start charge, persons) — so a reader who
 * then opens the advisor with the same month and speed sees the same span.
 * Nothing here is new arithmetic; it only chooses which scenarios to show.
 */

const climate = climateJson as { months: Record<string, number> };
const DEFAULTS = emptyDraft();

/** January and July: the coldest and the warmest month in the seed climate. */
export const AUTO_MONTHS = { winter: 1, summer: 7 } as const;
export const AUTO_SPEEDS: SpeedKph[] = [110, 130];
/** The named route the trip section uses. One route, so pages compare. */
export const AUTO_ROUTE_ID = "hamMuc";

export interface AutoRangeCell {
  month: number;
  speedKph: SpeedKph;
  range: RangeSpan;
}

export interface AutoTrip {
  routeName: string;
  km: number;
  month: number;
  speedKph: SpeedKph;
  stops: number;
  chargeMin: number;
  totalSpan: MinSpan;
}

export interface AutoPageData {
  car: Car;
  startSoc: number;
  persons: number;
  cells: AutoRangeCell[];
  trips: AutoTrip[];
}

export function carById(id: string): Car | null {
  return getCars().find((c) => c.id === id) ?? null;
}

export function autoPageData(car: Car): AutoPageData {
  const { startSoc, persons } = DEFAULTS;
  const cells: AutoRangeCell[] = [];
  for (const month of [AUTO_MONTHS.winter, AUTO_MONTHS.summer]) {
    const outdoorC = outdoorForMonth(climate.months, month);
    for (const speedKph of AUTO_SPEEDS) {
      cells.push({
        month,
        speedKph,
        range: computeRange(car, outdoorC, speedKph, startSoc, persons),
      });
    }
  }

  const route = getRoute(AUTO_ROUTE_ID)!;
  const trips: AutoTrip[] = [
    { month: AUTO_MONTHS.winter, speedKph: 110 as SpeedKph },
    { month: AUTO_MONTHS.summer, speedKph: 130 as SpeedKph },
  ].map(({ month, speedKph }) => {
    const outdoorC = outdoorForMonth(climate.months, month);
    const range = computeRange(car, outdoorC, speedKph, startSoc, persons);
    const plan = computeTripPlan(
      car,
      range.midKm,
      route.km,
      speedKph,
      startSoc,
      range.lowKm,
      range.highKm,
      outdoorC,
    );
    return {
      routeName: route.name,
      km: route.km,
      month,
      speedKph,
      stops: plan.stops.length,
      chargeMin: plan.chargeMin,
      totalSpan: plan.totalSpan,
    };
  });

  return { car, startSoc, persons, cells, trips };
}

/** Cars grouped by brand, brands and models in alphabetical order. */
export function carsByBrand(): { brand: string; cars: Car[] }[] {
  const map = new Map<string, Car[]>();
  for (const car of getCars()) {
    map.set(car.brand, [...(map.get(car.brand) ?? []), car]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "de"))
    .map(([brand, cars]) => ({
      brand,
      cars: [...cars].sort((a, b) => a.model.localeCompare(b.model, "de")),
    }));
}
