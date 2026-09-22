import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/* .mts, not .ts: the package has no "type": "module", so Vite 8 read the
   ESM syntax of a .ts config as CommonJS and warned on every run. ESM has no
   __dirname, hence import.meta.url for the alias. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
