"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { evaluateCars } from "@/lib/engine/evaluate";
import { emptyDraft, type Draft } from "@/lib/engine/types";
import { ResultView } from "./ResultView";

/*
 * The advisor's result screen, opened on one car. Added 11.11.2026 for the
 * per-car calculator pages (/auto/<id>/rechner/): someone searching for a
 * "Reichweitenrechner" for one model lands straight on the familiar controls
 * (month, speed, trip, start charge) with that car first and a few comparable
 * ones beside it, chosen at build time. No questions first, no persistence:
 * the reader came for one answer. "Fragen ändern" leads into the full advisor.
 */
export function CarCalculator({
  carId,
  compareIds,
  initialTripKm,
}: {
  carId: string;
  compareIds: string[];
  initialTripKm: number;
}) {
  const start = (): Draft => ({
    ...emptyDraft(),
    use: "longDistance",
    month: 1,
    tripKm: initialTripKm,
  });
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(start);
  const [selectedId, setSelectedId] = useState<string | null>(carId);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  /* Budget and body shape do not decide which cars stand here - the page
     does - so they are left out of the evaluation that picks the rows. */
  const evaluation = useMemo(() => evaluateCars(draft), [draft]);
  const all = useMemo(
    () =>
      evaluateCars({ ...draft, bodies: [], price: null, priceMin: null, priceMax: null })
        .results,
    [draft],
  );

  const ids = [carId, ...compareIds];
  const shown = ids
    .filter((id) => !dismissedIds.includes(id))
    .map((id) => all.find((r) => r.car.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const activeId = selectedId && shown.some((r) => r.car.id === selectedId) ? selectedId : null;

  return (
    <ResultView
      draft={draft}
      onChange={setDraft}
      resolved={evaluation.resolved}
      assumptions={evaluation.assumptions}
      budgetEmpty={false}
      results={shown}
      selectedId={activeId}
      onSelect={setSelectedId}
      onDismiss={(id) => setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
      dismissedCount={dismissedIds.length}
      onRestore={() => setDismissedIds([])}
      onEdit={() => router.push("/berater/")}
      onReset={() => {
        setDraft(start());
        setSelectedId(carId);
        setDismissedIds([]);
      }}
    />
  );
}
