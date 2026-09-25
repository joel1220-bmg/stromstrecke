// Runs after `npm run build` (the "postbuild" script in package.json).
//
// Next 16.3 names the router's segment files after path.relative(), which
// yields backslashes on Windows, and only forward slashes become dots. So on
// Windows berater/__next.berater.__PAGE__.txt is written as
// berater/__next.berater/__PAGE__.txt; the client asks for the dotted name,
// and every navigation logs 404s before falling back to index.txt. A directory
// named __next.* exists only because of that. Flattening it restores the names
// a Linux build writes, and does nothing there.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** Flattens every __next.* directory below `dir`; returns how many files moved. */
export function flattenSegmentDirs(dir) {
  let moved = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (!entry.name.startsWith("__next.")) {
      moved += flattenSegmentDirs(full);
      continue;
    }
    for (const file of fs.readdirSync(full, { recursive: true, withFileTypes: true })) {
      if (!file.isFile()) continue;
      const source = path.join(file.parentPath, file.name);
      const flatName = [entry.name, ...path.relative(full, source).split(path.sep)].join(".");
      fs.renameSync(source, path.join(dir, flatName));
      moved += 1;
    }
    fs.rmSync(full, { recursive: true });
  }
  return moved;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const out = path.resolve("out");
  if (fs.existsSync(out)) {
    const moved = flattenSegmentDirs(out);
    if (moved > 0) console.log(`flatten-export-segments: ${moved} Segmentdateien flach gelegt`);
  }
}
