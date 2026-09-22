/**
 * A remembered draft has to come back as it was saved, every field of it.
 *
 * `loadDraft` does not return what the schema parsed; it copies the fields
 * over one by one onto a fresh draft. Until 22.09.2026 `priceMin` was missing
 * from that list, so a reader who set "ab 30.000 €" and ticked "Angaben
 * merken" found the lower bound open again on the next visit. No type error
 * could show it, because the fresh draft already carries every key. The round
 * trip below walks all of them, so the next field added to `Draft` fails here
 * if it is forgotten in the same place.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emptyDraft, type Draft } from "./engine/types";
import { loadDraft, saveDraft, setRemember } from "./storage";

/* The test environment is node, which has no window. Enough of one to hold
   two keys. */
function stubWindow() {
  const store = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
}

describe("a remembered draft survives a reload", () => {
  beforeEach(stubWindow);
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("brings back every field, not only the ones someone remembered to copy", () => {
    /* Every value differs from emptyDraft(), so a field that falls back to the
       default is caught rather than passing by coincidence. */
    const saved: Draft = {
      use: "longDistance",
      /* Both set at once, which the form never produces; storage does not
         care, and it is the only way to give both a non-default value. */
      dayKm: "85",
      dayUnknown: true,
      bodies: ["kombi", "crossover"],
      longTrip: "none",
      tripKm: 500,
      month: 1,
      charge: "home",
      price: "to45",
      priceMax: 45000,
      priceMin: 30000,
      speedKph: 130,
      startSoc: 0.8,
      persons: 4,
    };
    for (const key of Object.keys(emptyDraft()) as (keyof Draft)[]) {
      expect(saved[key], `test fixture leaves ${key} at its default`).not.toEqual(
        emptyDraft()[key],
      );
    }

    setRemember(true);
    saveDraft(saved);
    expect(loadDraft()).toEqual(saved);
  });

  it("keeps nothing when the reader did not ask for it", () => {
    saveDraft({ ...emptyDraft(), priceMin: 30000 });
    expect(loadDraft()).toBeNull();
  });
});
