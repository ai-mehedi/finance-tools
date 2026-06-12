// Codemod: point every calculator page's metadata at the shared toolMetadata()
// helper so DB-managed SEO renders. Handles both variants:
//   A) `export async function generateMetadata` + `const baseMetadata`
//   B) `export const metadata` (static)  ->  rename to baseMetadata + add generateMetadata
//
//   Dry run:  node scripts/wire-tool-metadata.mjs
//   Apply:    node scripts/wire-tool-metadata.mjs --apply
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const IMPORT = `import { toolMetadata } from "@/lib/tool-metadata";`;
const GEN = `export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(SELF_SLUG, baseMetadata);
}`;

const dirs = readdirSync("app/calculators").filter((d) => existsSync(`app/calculators/${d}/page.tsx`));
const changed = [], skipped = [];

for (const slug of dirs) {
  const file = `app/calculators/${slug}/page.tsx`;
  let src = readFileSync(file, "utf8");
  const orig = src;

  if (!/const SELF_SLUG\s*=/.test(src)) { skipped.push([slug, "no SELF_SLUG"]); continue; }
  if (src.includes("@/lib/tool-metadata")) { skipped.push([slug, "already wired"]); continue; }

  // Variant B -> rename static export to baseMetadata
  if (/export const metadata\s*:\s*Metadata\s*=/.test(src)) {
    src = src.replace(/export const metadata(\s*:\s*Metadata\s*=)/, "const baseMetadata$1");
  }
  if (!/const baseMetadata\s*:?\s*Metadata?\s*=/.test(src) && !/const baseMetadata\s*=/.test(src)) {
    skipped.push([slug, "no baseMetadata"]); continue;
  }

  // Replace existing generateMetadata (it's the final block) or append a new one.
  const gi = src.indexOf("export async function generateMetadata");
  if (gi !== -1) {
    src = src.slice(0, gi).replace(/\s*$/, "\n") + GEN + "\n";
  } else {
    src = src.replace(/\s*$/, "\n") + "\n" + GEN + "\n";
  }

  // Add the import right after the @/lib/seo import (or after the last import).
  if (/from "@\/lib\/seo";/.test(src)) {
    src = src.replace(/(import .*from "@\/lib\/seo";)/, `$1\n${IMPORT}`);
  } else {
    const lines = src.split("\n");
    let last = 0;
    lines.forEach((l, i) => { if (/^import /.test(l)) last = i; });
    lines.splice(last + 1, 0, IMPORT);
    src = lines.join("\n");
  }

  if (src !== orig) {
    if (APPLY) writeFileSync(file, src);
    changed.push(slug);
  }
}

console.log(`${APPLY ? "APPLIED" : "DRY"} — would change: ${changed.length}, skipped: ${skipped.length}`);
if (skipped.length) for (const [s, why] of skipped) console.log(`  skip ${s}: ${why}`);
if (!APPLY) console.log("\nRe-run with --apply to write.");
