import { describe, expect, it } from "vitest";
import { autoPageData, carsByBrand } from "@/lib/autopage";
import { getCars } from "@/lib/engine/evaluate";

describe("car pages", () => {
  it("covers every catalogue car exactly once", () => {
    const ids = carsByBrand().flatMap((g) => g.cars.map((c) => c.id));
    expect(ids.sort()).toEqual(getCars().map((c) => c.id).sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prints a span, never a single figure, and winter never beats summer", () => {
    for (const car of getCars()) {
      const d = autoPageData(car);
      expect(d.cells).toHaveLength(4);
      for (const c of d.cells) {
        expect(c.range.lowKm).toBeLessThan(c.range.highKm);
        expect(c.range.lowKm).toBeLessThanOrEqual(c.range.midKm);
      }
      const [w110, w130, s110, s130] = d.cells.map((c) => c.range.midKm);
      expect(w110).toBeLessThanOrEqual(s110);
      expect(w130).toBeLessThanOrEqual(s130);
      expect(w130).toBeLessThan(w110);
      for (const t of d.trips) {
        expect(t.totalSpan.low).toBeLessThanOrEqual(t.totalSpan.high);
        expect(t.chargeMin).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("ids are safe as URL path segments", () => {
    for (const car of getCars()) expect(car.id).toMatch(/^[a-z0-9-]+$/);
  });
});
