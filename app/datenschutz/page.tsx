import type { Metadata } from "next";
import { COPY } from "@/lib/copy";
import { readOperator } from "@/lib/operator";

export const metadata: Metadata = {
  title: "Datenschutz · Stromstrecke",
  alternates: { canonical: "/datenschutz" },
};

/*
 * Transcribed 18.09.2026 from what stromstrecke.de was actually serving: this
 * file still carried the placeholder and a thin "Ihre Rechte" paragraph, while
 * the live page had the full text - responsible party, hosting, retention,
 * Widerspruchsrecht - which existed in no commit on any branch. Since
 * 25.09.2026 the responsible party comes from .env.local (lib/operator.ts),
 * like the Impressum, so the address stays out of this public repository.
 *
 * Transcribed, not edited. The wording here is the operator's legal statement
 * and not something to improve in passing. Two things were noticed while
 * copying and deliberately left alone, to be raised with the operator instead:
 *
 * - lima-city sets two cookies, and this text did not mention them. Added on
 *   22.09.2026 at the operator's request, as facts only, and corrected on
 *   25.09.2026: `_lcp` arrives in a Set-Cookie header on the first request
 *   (HttpOnly), `_lcp3` from a script lima-city appends to every HTML page,
 *   which is also why no served page is byte-identical to the build. Both hold
 *   the constant "a" and expire 20.03.2034; this site reads neither. What
 *   lima-city uses them for, and so their legal basis, is not stated, because
 *   it is not known here. "Ohne Haken wird nichts geschrieben" now says
 *   who writes nothing, since the host does write something.
 * - The three COPY lines below are UI strings quoted into the legal text. That
 *   may well be intentional - it shows the reader the exact wording used on
 *   the form - but they read as stray fragments between two full sections.
 */
export default function DatenschutzPage() {
  const operator = readOperator();
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 leading-relaxed">
      <h1 className="serif text-3xl text-paper">Datenschutz</h1>

      <h2 className="serif mt-8 text-xl text-gold">Verantwortlich</h2>
      <address className="mt-2 not-italic text-paper">
        {operator.name}
        <br />
        {operator.street}
        <br />
        {operator.city}
        <br />
        {operator.email}
      </address>

      <h2 className="serif mt-8 text-xl text-gold">Verarbeitung</h2>
      <p className="mt-2 text-paper">
        Stromstrecke rechnet ausschließlich in Ihrem Browser. Nur wenn Sie „Angaben merken“ ankreuzen,
        speichert dieser Browser den Entwurf in <code>localStorage</code>. Ohne Haken speichert
        Stromstrecke nichts in Ihrem Browser. Es gibt kein Nutzerkonto, keinen Server für Ihre Fahrdaten, keinen Newsletter
        und keine Tracker oder Werbung.
      </p>
      <p className="mt-2 text-muted">{COPY.privacy}</p>
      <p className="mt-2 text-muted">{COPY.remember}</p>
      <p className="mt-1 text-muted">{COPY.rememberOff}</p>

      <h2 className="serif mt-8 text-xl text-gold">Hosting</h2>
      <p className="mt-2 text-paper">
        Die Seite liegt bei lima-city (TrafficPlex GmbH, Bremen) auf Servern in Deutschland. Beim
        Aufruf speichert lima-city Protokolldaten, insbesondere IP-Adresse, eine Kennung des
        Zugriffs und Angaben zum Browser, um den sicheren Betrieb zu gewährleisten. Ohne diese Daten
        lässt sich die Seite nicht ausliefern. Rechtsgrundlage ist das berechtigte Interesse an
        einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO). lima-city handelt als
        Auftragsverarbeiter (Art. 28 DSGVO) und löscht die Protokolldaten nach sieben Tagen.
      </p>
      <p className="mt-2 text-paper">
        Außerdem setzt lima-city zwei Cookies: „_lcp“ beim ersten Aufruf und „_lcp3“ über ein
        Skript, das lima-city in jede Seite einfügt. Beide enthalten nur den festen Wert „a“ und
        damit keine Kennung, an der Sie wiedererkannt werden könnten, und gelten bis März 2034.
        Stromstrecke liest diese Cookies nicht und nutzt sie weder für Werbung noch für Tracking.
      </p>

      <h2 className="serif mt-8 text-xl text-gold">E-Mail</h2>
      <p className="mt-2 text-paper">
        Wenn Sie eine E-Mail schreiben, wird sie nur zur Beantwortung verwendet (Art. 6 Abs. 1 lit. f
        DSGVO) und gelöscht, sobald die Anfrage erledigt ist.
      </p>

      <h2 className="serif mt-8 text-xl text-gold">Ihre Rechte</h2>
      <p className="mt-2 text-paper">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und
        Datenübertragbarkeit (Art. 15 bis 20 DSGVO) sowie das Recht, sich bei einer
        Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Den gemerkten Entwurf können Sie
        jederzeit im Berater zurücksetzen.
      </p>
      <p className="mt-4 text-paper">
        <strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung auf Grundlage von Art. 6
        Abs. 1 lit. f DSGVO jederzeit aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
        widersprechen (Art. 21 DSGVO).
      </p>
    </article>
  );
}
