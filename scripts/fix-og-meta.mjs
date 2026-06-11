// One-off codemod: make every calculator page's Open Graph block complete.
//
// Next.js overwrites a parent's `openGraph` when a child sets one, so the ~270
// calculator pages (which set their own one-line openGraph/twitter) were
// emitting OG tags WITHOUT og:image and og:site_name -> Ahrefs "Open Graph
// tags incomplete". This injects siteName + a default /og.png image inline.
//
// Idempotent: skips any file whose baseMetadata openGraph already has siteName.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../app/calculators", import.meta.url).pathname;

// openGraph: { type: "website", url: PATH, title: "...", description: DESC },
const OG_RE =
  /openGraph: \{ type: "website", url: PATH, title: ("(?:[^"\\]|\\.)*"), description: DESC \},/;
// twitter: { card: "summary", title: "...", description: DESC },
const TW_RE =
  /twitter: \{ card: "summary", title: ("(?:[^"\\]|\\.)*"), description: DESC \},/;

let changed = 0;
let skipped = 0;
const skippedFiles = [];

for (const dir of readdirSync(ROOT)) {
  const file = join(ROOT, dir, "page.tsx");
  let src;
  try {
    if (!statSync(file).isFile()) continue;
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  if (!OG_RE.test(src)) {
    skipped++;
    skippedFiles.push(dir);
    continue;
  }

  const next = src
    .replace(
      OG_RE,
      (_m, title) =>
        `openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: ${title}, description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },`,
    )
    .replace(
      TW_RE,
      (_m, title) =>
        `twitter: { card: "summary_large_image", title: ${title}, description: DESC, images: ["/og.png"] },`,
    );

  if (next !== src) {
    writeFileSync(file, next);
    changed++;
  }
}

console.log(`changed: ${changed}`);
console.log(`skipped (no single-line OG pattern): ${skipped}`);
if (skippedFiles.length) console.log("  -> " + skippedFiles.join(", "));
