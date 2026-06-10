// Make the calculator "Related guides" section show 3 cards on one line:
//  - grid sm:grid-cols-2  ->  sm:grid-cols-2 lg:grid-cols-3
//  - fetch 3 articles instead of 4 (clean single row). Idempotent.
// Run: node scripts/related-guides-3col.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "app", "calculators");
const pages = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "page.tsx")))
  .map((d) => join(dir, d.name, "page.tsx"));

const GRID_FROM = "grid grid-cols-1 gap-5 sm:grid-cols-2";
const GRID_TO = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";
const LIMIT_FROM = "getArticles({ limit: 4 })";
const LIMIT_TO = "getArticles({ limit: 3 })";

let grids = 0;
let limits = 0;
for (const file of pages) {
  let src = readFileSync(file, "utf8");
  const before = src;
  if (src.includes(GRID_FROM) && !src.includes(GRID_TO)) { src = src.replace(GRID_FROM, GRID_TO); grids++; }
  if (src.includes(LIMIT_FROM)) { src = src.split(LIMIT_FROM).join(LIMIT_TO); limits++; }
  if (src !== before) writeFileSync(file, src);
}
console.log(`Pages: ${pages.length} | grids -> 3col: ${grids} | article limit -> 3: ${limits}`);
