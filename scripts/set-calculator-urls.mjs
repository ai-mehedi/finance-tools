// Fixes the duplicate-URL / cannibalization problem.
//
// Your real interactive calculators live at /calculators/<slug>, but every Tool
// record has an empty `url`, so:
//   - ToolCard, the listing and related links point at /tools/<slug> (a
//     "coming soon" placeholder), and
//   - the redirect in app/tools/[slug]/page.tsx never fires.
//
// This script sets `url = "/calculators/<slug>"` on every Tool that actually has
// a built page at app/calculators/<slug>/page.tsx. After running it:
//   - ToolCard + sitemap use tool.url  -> link straight to the real calculator
//   - /tools/<slug> 301-redirects to /calculators/<slug> (no more duplicate)
// Tools WITHOUT a built page are left untouched (they keep the /tools placeholder
// until you build them).
//
// Dry run (no writes):  node --env-file=.env.local scripts/set-calculator-urls.mjs
// Apply:                node --env-file=.env.local scripts/set-calculator-urls.mjs --apply
import mongoose from "mongoose";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI is not set."); process.exit(1); }

const APPLY = process.argv.includes("--apply");

// Discover every slug that has a real built calculator page.
const calcDir = join(process.cwd(), "app", "calculators");
const builtSlugs = new Set(
  readdirSync(calcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(calcDir, d.name, "page.tsx")))
    .map((d) => d.name)
);
console.log(`Found ${builtSlugs.size} built calculator pages on disk.`);

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ slug: String, url: String }, { timestamps: true, strict: false })
);

await mongoose.connect(uri);

const tools = await Tool.find({}, { slug: 1, url: 1 }).lean();
let toUpdate = [];
let alreadyOk = 0;
let noPage = 0;

for (const t of tools) {
  const target = `/calculators/${t.slug}`;
  if (!builtSlugs.has(t.slug)) { noPage++; continue; }
  if (t.url === target) { alreadyOk++; continue; }
  toUpdate.push({ slug: t.slug, from: t.url || "(empty)", to: target });
}

console.log(`\nSummary:`);
console.log(`  ${alreadyOk} already correct`);
console.log(`  ${noPage} tools have no built page (left as /tools placeholder)`);
console.log(`  ${toUpdate.length} will be updated`);
if (toUpdate.length) {
  console.log(`\nExamples:`);
  toUpdate.slice(0, 10).forEach((u) => console.log(`  ${u.slug}: ${u.from} -> ${u.to}`));
}

if (!APPLY) {
  console.log(`\nDRY RUN. Re-run with --apply to write these ${toUpdate.length} changes.`);
} else if (toUpdate.length) {
  const ops = toUpdate.map((u) => ({
    updateOne: { filter: { slug: u.slug }, update: { $set: { url: u.to } } },
  }));
  const res = await Tool.bulkWrite(ops);
  console.log(`\nApplied. Modified ${res.modifiedCount} documents.`);
} else {
  console.log(`\nNothing to update.`);
}

await mongoose.disconnect();
