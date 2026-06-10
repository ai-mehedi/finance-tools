// One-off codemod that upgrades every built calculator page for SEO/E-E-A-T:
//   1. Related calculators become cluster-aware (getTools -> getRelatedTools).
//   2. Related links use the tool's real URL (t.url) instead of the /tools
//      placeholder, so they point straight at the calculator.
//   3. The inline WebApplication schema gains author + reviewer + dateModified.
// Idempotent: safe to run more than once. Reports any page that didn't match the
// expected pattern instead of silently skipping.
//
// Run: node scripts/upgrade-calculator-seo.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "app", "calculators");
const pages = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "page.tsx")))
  .map((d) => join(dir, d.name, "page.tsx"));

const Q_IMPORT_FROM = `import { getTools, getArticles, getToolBySlug } from "@/lib/queries";`;
const Q_IMPORT_TO = `import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";`;
const FETCH_FROM = `getTools({ type: "calculator", limit: 7 })`;
const FETCH_TO = `getRelatedTools(SELF_SLUG, 7)`;
const LINK_FROM = "href={`/tools/${t.slug}`}";
const LINK_TO = "href={t.url || `/tools/${t.slug}`}";
const SEO_IMPORT_FROM = `import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";`;
const SEO_IMPORT_TO = `import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";`;
const PUBLISHER_NEEDLE = 'publisher: { "@id": `${SITE_URL}/#organization` },';
const SCHEMA_MARKER = `author: personSchema(EDITORIAL.author)`;

const report = { related: 0, link: 0, schema: 0, seoImport: 0, skipped: [], warned: [] };

for (const file of pages) {
  let src = readFileSync(file, "utf8");
  const before = src;
  const name = file.replace(process.cwd() + "/", "");

  // 1. cluster-aware related fetch + import
  if (src.includes(Q_IMPORT_FROM)) { src = src.replace(Q_IMPORT_FROM, Q_IMPORT_TO); }
  if (src.includes(FETCH_FROM)) { src = src.split(FETCH_FROM).join(FETCH_TO); report.related++; }

  // 2. related link uses real url
  if (src.includes(LINK_FROM) && !src.includes(LINK_TO)) { src = src.split(LINK_FROM).join(LINK_TO); report.link++; }

  // 3. schema author/reviewer/dateModified (skip if already present)
  if (!src.includes(SCHEMA_MARKER)) {
    if (src.includes(SEO_IMPORT_FROM)) { src = src.replace(SEO_IMPORT_FROM, SEO_IMPORT_TO); report.seoImport++; }
    const lines = src.split("\n");
    const idx = lines.findIndex((l) => l.trim() === PUBLISHER_NEEDLE);
    if (idx === -1) {
      report.warned.push(`${name}: no publisher anchor found, schema not upgraded`);
    } else {
      const indent = lines[idx].slice(0, lines[idx].length - lines[idx].trimStart().length);
      lines.splice(idx, 0,
        `${indent}dateModified: "2026-06-01",`,
        `${indent}author: personSchema(EDITORIAL.author),`,
        `${indent}...(EDITORIAL.reviewer.name ? { reviewer: personSchema(EDITORIAL.reviewer) } : {}),`,
      );
      src = lines.join("\n");
      report.schema++;
    }
  }

  if (src !== before) writeFileSync(file, src);
  else report.skipped.push(name);
}

console.log(`Pages scanned: ${pages.length}`);
console.log(`  related fetch -> getRelatedTools: ${report.related}`);
console.log(`  related links -> t.url:          ${report.link}`);
console.log(`  schema author/dateModified added: ${report.schema}`);
console.log(`  seo imports updated:              ${report.seoImport}`);
console.log(`  unchanged (already upgraded):     ${report.skipped.length}`);
if (report.warned.length) {
  console.log(`\nWARNINGS (${report.warned.length}):`);
  report.warned.forEach((w) => console.log(`  - ${w}`));
}
