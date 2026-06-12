// Optimize SEO meta (metaTitle / metaDescription / keywords) for every calculator
// and upsert into MongoDB. Uses real keyword data (data/keywords/keyword-data.json)
// + each page's existing unique DESC string as the description base.
//
//   Dry run (default, writes nothing):  node --env-file=.env.local scripts/optimize-tool-seo.mjs
//   Show N samples:                     node --env-file=.env.local scripts/optimize-tool-seo.mjs --sample=12
//   Apply to DB:                        node --env-file=.env.local scripts/optimize-tool-seo.mjs --apply
import mongoose from "mongoose";
import { readFileSync, readdirSync, existsSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const sampleArg = process.argv.find((a) => a.startsWith("--sample="));
const SAMPLE = sampleArg ? parseInt(sampleArg.split("=")[1], 10) : 0;
const BRAND = "TopicDrill";

const kw = JSON.parse(readFileSync("data/keywords/keyword-data.json", "utf8"));

const titleCase = (slug) =>
  slug.split("-").map((w) => (/^\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1))).join(" ");

// Pull the page's hand-written title, DESC and keywords out of its page.tsx.
function readPage(slug) {
  const p = `app/calculators/${slug}/page.tsx`;
  if (!existsSync(p)) return {};
  const src = readFileSync(p, "utf8");
  const title = src.match(/title:\s*"([^"]+?)"/)?.[1]?.replace(/\s*\|\s*TopicDrill.*$/, "").trim();
  const desc = src.match(/const DESC\s*=\s*"((?:[^"\\]|\\.)*)"/s)?.[1]
    || src.match(/description:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
  const kwBlock = src.match(/keywords:\s*\[([\s\S]*?)\]/)?.[1];
  const keywords = kwBlock ? [...kwBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
  return { title, desc, keywords };
}

function clamp(str, max) {
  if (!str) return str;
  str = str.replace(/\s+/g, " ").trim();
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\-–\s]+$/, "");
}

// Description-aware clamp: prefer ending on a full sentence; otherwise trim at a
// word boundary and drop trailing function words so it doesn't end mid-phrase.
function clampDesc(str, max) {
  str = str.replace(/\s+/g, " ").trim();
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const lastPeriod = cut.lastIndexOf(". ");
  if (lastPeriod >= max * 0.6) return cut.slice(0, lastPeriod + 1);
  const fw = new Set(["a","an","the","to","of","with","and","or","for","in","on","by","your","that","this","as","at","is"]);
  const words = cut.slice(0, cut.lastIndexOf(" ")).split(" ");
  while (words.length) {
    const last = words[words.length - 1].replace(/[^a-z0-9']/gi, "").toLowerCase();
    if (last === "" || fw.has(last)) words.pop(); else break;
  }
  return words.join(" ").replace(/[\s,;:–-]+$/, "") + ".";
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "");

function buildMeta(slug, page) {
  const data = kw[slug] || {};
  const title = page.title || titleCase(slug);
  const primary = (data.keyword || title).toLowerCase();

  // metaTitle: keyword-front-loaded (title already is the head term) + value prop + brand, <=60
  const variants = [
    `${title} – Free Online | ${BRAND}`,
    `${title} – Free | ${BRAND}`,
    `${title} | ${BRAND}`,
  ];
  const metaTitle = variants.find((v) => v.length <= 60) || clamp(`${title} | ${BRAND}`, 60);

  // metaDescription: start from the page's unique DESC; ensure it leads with the primary
  // keyword; clamp to <=158 at a word boundary.
  let desc = page.desc || `Free ${primary}. Fast, accurate and no sign-up required.`;
  // Lead with the primary keyword only if it (and "free") aren't already there.
  if (!norm(desc).startsWith("free") && !norm(desc).includes(norm(primary).split(" ")[0])) {
    desc = `Free ${primary}. ${desc}`;
  }
  const metaDescription = clampDesc(desc, 158);

  // keywords[]: primary + competitor secondary + page keywords + modifiers, deduped, <=8
  const mods = [`free ${primary}`, `${primary} online`];
  const all = [primary, ...(data.secondary || []), ...page.keywords, ...mods];
  const seen = new Set();
  const keywords = [];
  for (const k of all.map((s) => s.toLowerCase().trim())) {
    if (k && !seen.has(k)) { seen.add(k); keywords.push(k); }
    if (keywords.length >= 8) break;
  }

  return { metaTitle, metaDescription, keywords, _vol: data.volume ?? null, _intent: data.intent ?? "" };
}

const slugs = readdirSync("app/calculators").filter((d) => existsSync(`app/calculators/${d}/page.tsx`));
const results = slugs.map((slug) => ({ slug, ...buildMeta(slug, readPage(slug)) }));

// Show samples (highest-volume first so review covers the money pages)
const ordered = [...results].sort((a, b) => (b._vol ?? -1) - (a._vol ?? -1));
const show = SAMPLE || (!APPLY ? 12 : 0);
if (show) {
  for (const r of ordered.slice(0, show)) {
    console.log(`\n■ ${r.slug}  (vol ${r._vol ?? "?"}, ${r._intent || "?"})`);
    console.log(`  title[${r.metaTitle.length}]: ${r.metaTitle}`);
    console.log(`  desc [${r.metaDescription.length}]: ${r.metaDescription}`);
    console.log(`  kw   : ${r.keywords.join(", ")}`);
  }
}

const overLen = results.filter((r) => r.metaTitle.length > 60 || r.metaDescription.length > 160);
console.log(`\nTotal: ${results.length} | title>60: ${results.filter((r) => r.metaTitle.length > 60).length} | desc>160: ${results.filter((r) => r.metaDescription.length > 160).length}`);
if (overLen.length) console.log("  over-length slugs:", overLen.map((r) => r.slug).join(", "));

if (!APPLY) {
  console.log("\nDRY RUN — nothing written. Re-run with --apply to upsert to MongoDB.");
  process.exit(0);
}

// ---- write to DB ----
const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }
await mongoose.connect(uri);
const Tool = mongoose.connection.collection("tools");
let updated = 0, inserted = 0;
for (const r of results) {
  const set = { metaTitle: r.metaTitle, metaDescription: r.metaDescription, keywords: r.keywords };
  const res = await Tool.updateOne(
    { slug: r.slug },
    {
      $set: set,
      $setOnInsert: {
        slug: r.slug, title: readPage(r.slug).title || titleCase(r.slug),
        type: "calculator", status: "active", url: `/calculators/${r.slug}`,
        faq: [], categories: [], createdAt: new Date(), updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  if (res.upsertedCount) inserted++; else if (res.modifiedCount || res.matchedCount) updated++;
}
console.log(`\nDB done — updated: ${updated}, inserted: ${inserted}`);
await mongoose.disconnect();
