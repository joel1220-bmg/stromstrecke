/*
 * The person named in Impressum and Datenschutz. The details come from the
 * build environment (.env.local, gitignored), never from the repository: the
 * repository is public, and an address committed once stays in its history.
 *
 * It was committed once, 18.09.2026, because the repository showed a
 * placeholder while the live site showed the real details, and nobody could
 * tell where those came from. They came from here. See "Deploy" in CLAUDE.md.
 */

export type Operator = {
  name: string;
  street: string;
  city: string;
  email: string;
};

export const OPERATOR_ENV = {
  name: "IMPRESSUM_NAME",
  street: "IMPRESSUM_STRASSE",
  city: "IMPRESSUM_ORT",
  email: "IMPRESSUM_EMAIL",
} as const satisfies Record<keyof Operator, string>;

const PLACEHOLDER: Operator = {
  name: "[Name]",
  street: "[Straße und Hausnummer]",
  city: "[PLZ und Ort]",
  email: "[E-Mail]",
};

type Env = Record<string, string | undefined>;

/**
 * A production build outside CI is a build someone may upload, and a
 * placeholder where the Impressum belongs is the one outcome worth failing it
 * over. CI builds without the details on purpose and gets the placeholder.
 */
function isDeployBuild(env: Env): boolean {
  return env.NODE_ENV === "production" && env.CI !== "true";
}

export function readOperator(env: Env = process.env): Operator {
  const fields = Object.keys(OPERATOR_ENV) as (keyof Operator)[];
  const value = (field: keyof Operator) => env[OPERATOR_ENV[field]]?.trim() ?? "";
  const missing = fields.filter((field) => value(field) === "");

  if (missing.length > 0 && isDeployBuild(env)) {
    throw new Error(
      `Impressum-Angaben fehlen: ${missing.map((field) => OPERATOR_ENV[field]).join(", ")}. ` +
        "In .env.local eintragen, siehe README unter Veröffentlichen.",
    );
  }

  return {
    name: value("name") || PLACEHOLDER.name,
    street: value("street") || PLACEHOLDER.street,
    city: value("city") || PLACEHOLDER.city,
    email: value("email") || PLACEHOLDER.email,
  };
}
