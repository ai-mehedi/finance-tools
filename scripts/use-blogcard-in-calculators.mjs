// Replaces the inline "Related guides" article card in every calculator page
// with the shared <BlogCard> component, so the homepage, blog and calculator
// related-guides all use ONE reusable card. Idempotent.
//
// Run: node scripts/use-blogcard-in-calculators.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "app", "calculators");
const pages = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "page.tsx")))
  .map((d) => join(dir, d.name, "page.tsx"));

// The inline article <Link> card, from its open tag to the matching </Link>.
const CARD_RE = /<Link key=\{a\._id\} href=\{`\/blog\/\$\{a\.slug\}`\}[\s\S]*?<\/Link>/;
const CARD_TO = `<BlogCard key={a._id} article={a} size="sm" />`;
const IMPORT_ANCHOR_RE = /(import[^\n]*from "\.\.\/\.\.\/components\/StaticPage";\n)/;
const IMPORT_LINE = `import BlogCard from "../../components/BlogCard";\n`;

let cards = 0;
let imports = 0;
const warned = [];

for (const file of pages) {
  let src = readFileSync(file, "utf8");
  const before = src;
  const name = file.replace(process.cwd() + "/", "");

  if (CARD_RE.test(src)) {
    src = src.replace(CARD_RE, CARD_TO);
    cards++;
  }
  if (src.includes("article={a}") && !src.includes('components/BlogCard"')) {
    if (IMPORT_ANCHOR_RE.test(src)) {
      src = src.replace(IMPORT_ANCHOR_RE, `$1${IMPORT_LINE}`);
      imports++;
    } else {
      warned.push(`${name}: replaced card but no StaticPage import anchor for BlogCard import`);
    }
  }

  if (src !== before) writeFileSync(file, src);
}

console.log(`Pages scanned: ${pages.length}`);
console.log(`  inline card -> <BlogCard>: ${cards}`);
console.log(`  BlogCard imports added:   ${imports}`);
if (warned.length) {
  console.log(`\nWARNINGS:`);
  warned.forEach((w) => console.log(`  - ${w}`));
}
