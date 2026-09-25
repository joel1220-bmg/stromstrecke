import { describe, expect, it } from "vitest";
import { readOperator } from "@/lib/operator";

const complete = {
  IMPRESSUM_NAME: "Erika Mustermann",
  IMPRESSUM_STRASSE: "Musterstraße 1",
  IMPRESSUM_ORT: "12345 Musterstadt",
  IMPRESSUM_EMAIL: "erika@example.org",
};

describe("readOperator", () => {
  it("reads all four fields from the environment", () => {
    expect(readOperator(complete)).toEqual({
      name: "Erika Mustermann",
      street: "Musterstraße 1",
      city: "12345 Musterstadt",
      email: "erika@example.org",
    });
  });

  it("shows placeholders outside a production build", () => {
    expect(readOperator({ NODE_ENV: "development" })).toEqual({
      name: "[Name]",
      street: "[Straße und Hausnummer]",
      city: "[PLZ und Ort]",
      email: "[E-Mail]",
    });
  });

  it("fails a deploy build that would ship a placeholder", () => {
    expect(() =>
      readOperator({ ...complete, IMPRESSUM_ORT: "  ", NODE_ENV: "production" }),
    ).toThrow(/IMPRESSUM_ORT/);
    expect(() => readOperator({ NODE_ENV: "production" })).toThrow(
      /IMPRESSUM_NAME, IMPRESSUM_STRASSE, IMPRESSUM_ORT, IMPRESSUM_EMAIL/,
    );
  });

  it("lets CI build with placeholders, since CI deploys nothing", () => {
    expect(readOperator({ NODE_ENV: "production", CI: "true" }).name).toBe("[Name]");
  });

  it("lets a complete deploy build through", () => {
    expect(readOperator({ ...complete, NODE_ENV: "production" }).name).toBe("Erika Mustermann");
  });
});
