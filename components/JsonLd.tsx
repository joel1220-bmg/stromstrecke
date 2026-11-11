/* Structured data for search engines. Not executed by the browser, so the CSP
   does not apply; `<` is escaped so no string can close the script element. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
