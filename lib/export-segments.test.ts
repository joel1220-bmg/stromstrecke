import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { flattenSegmentDirs } from "../scripts/flatten-export-segments.mjs";

/*
 * The layout below is what `next build` writes on Windows (see the script's
 * header). Built with path.join, so the test means the same on either OS.
 */
let root = "";
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "segments-"));
});
afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

const at = (rel: string) => path.join(root, ...rel.split("/"));
function write(rel: string) {
  fs.mkdirSync(path.dirname(at(rel)), { recursive: true });
  fs.writeFileSync(at(rel), rel);
}

describe("flattenSegmentDirs", () => {
  it("gives the Windows layout the names the client requests", () => {
    write("berater/__next.berater/__PAGE__.txt");
    write("berater/__next._tree.txt");
    write("__next.__PAGE__.txt");

    expect(flattenSegmentDirs(root)).toBe(1);
    expect(fs.readFileSync(at("berater/__next.berater.__PAGE__.txt"), "utf8")).toBe(
      "berater/__next.berater/__PAGE__.txt",
    );
    expect(fs.existsSync(at("berater/__next.berater"))).toBe(false);
    expect(fs.existsSync(at("berater/__next._tree.txt"))).toBe(true);
    expect(fs.existsSync(at("__next.__PAGE__.txt"))).toBe(true);
  });

  it("joins deeper nesting segment by segment", () => {
    write("a/__next.a/b/__PAGE__.txt");
    flattenSegmentDirs(root);
    expect(fs.existsSync(at("a/__next.a.b.__PAGE__.txt"))).toBe(true);
  });

  it("leaves a Linux export alone", () => {
    write("berater/__next.berater.__PAGE__.txt");
    expect(flattenSegmentDirs(root)).toBe(0);
    expect(fs.existsSync(at("berater/__next.berater.__PAGE__.txt"))).toBe(true);
  });
});
