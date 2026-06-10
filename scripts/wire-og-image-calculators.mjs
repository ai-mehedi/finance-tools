// Wires the admin-managed per-tool OG image (Tool.ogImage in MongoDB) into each
// calculator page's metadata. Converts the static `export const metadata` into a
// `generateMetadata()` that reads the tool from the DB and, when an ogImage is
// set, uses it for Open Graph + Twitter. Falls back to the static base otherwise.
// Idempotent. Run: node scripts/wire-og-image-calculators.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "app", "calculators");
const pages = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "page.tsx")))
  .map((d) => join(dir, d.name, "page.tsx"));

const FROM = "export const metadata: Metadata = {";
const TO = "const baseMetadata: Metadata = {";
const FN = `
export async function generateMetadata(): Promise<Metadata> {
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
`;

let done = 0;
const skipped = [];
for (const file of pages) {
  let src = readFileSync(file, "utf8");
  if (src.includes("export async function generateMetadata")) { skipped.push(file); continue; }
  if (!src.includes(FROM)) { skipped.push(file); continue; }
  src = src.replace(FROM, TO);
  src = src.replace(/\s*$/, "\n") + FN;
  writeFileSync(file, src);
  done++;
}
console.log(`Pages: ${pages.length} | wired generateMetadata: ${done} | skipped: ${skipped.length}`);
