import type { Metadata } from "next";
import { readOperator } from "@/lib/operator";

export const metadata: Metadata = {
  title: "Impressum · Stromstrecke",
  alternates: { canonical: "/impressum" },
};

/*
 * Name, Anschrift and E-Mail come from .env.local at build time
 * (lib/operator.ts), so the address stays out of this public repository. A
 * deploy build without them fails rather than ship a placeholder.
 */
export default function ImpressumPage() {
  const operator = readOperator();
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 leading-relaxed">
      <h1 className="serif text-3xl text-paper">Impressum</h1>
      {/* not-italic: in this product italic means "assumed by us", which an address is not */}
      <address className="mt-6 not-italic text-paper">
        {operator.name}
        <br />
        {operator.street}
        <br />
        {operator.city}
      </address>
      <p className="mt-4 text-paper">E-Mail: {operator.email}</p>
    </article>
  );
}
