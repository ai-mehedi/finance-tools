// One-off codemod: give static/listing pages a complete openGraph.
//
// These pages set only `alternates.canonical` and no `openGraph`, so they
// INHERIT the layout's openGraph whose og:url is the homepage -> Ahrefs
// "Open Graph URL not matching canonical". We add an openGraph whose url
// equals the page's own canonical, with siteName + default image.
//
// Idempotent: skips files that already declare an `openGraph`.
import { readFileSync, writeFileSync } from "node:fs";

const FILES = [
  "about", "contact", "disclaimer", "privacy-policy", "terms",
  "faqs", "glossary", "blog", "calculators", "categories", "tools",
].map((s) => new URL(`../app/${s}/page.tsx`, import.meta.url).pathname);

for (const file of FILES) {
  let src = readFileSync(file, "utf8");

  if (/\bopenGraph\b/.test(src)) {
    console.log(`skip (already has openGraph): ${file}`);
    continue;
  }

  const canonical = src.match(/canonical:\s*"([^"]+)"/)?.[1];
  const title = src.match(/title:\s*"([^"]+)"/)?.[1];
  const description = src.match(/description:\s*"([^"]+)"/)?.[1];
  if (!canonical || !title) {
    console.log(`skip (could not parse metadata): ${file}`);
    continue;
  }

  // Add the import (these pages don't import from @/lib/seo yet).
  src = src.replace(
    /^(import .*\n)(?!import )/m,
    `$1import { openGraphFor } from "@/lib/seo";\n`,
  );

  // Insert openGraph right after the canonical line, matching its indentation.
  src = src.replace(
    /([ \t]*)alternates:\s*\{\s*canonical:\s*"[^"]+"\s*\},?/,
    (m, indent) => {
      const desc = description ? `, description: ${JSON.stringify(description)}` : "";
      const og = `\n${indent}openGraph: openGraphFor({ path: ${JSON.stringify(
        canonical,
      )}, title: ${JSON.stringify(`${title} | TopicDrill`)}${desc} }),`;
      return m + og;
    },
  );

  writeFileSync(file, src);
  console.log(`updated: ${file.split("/app/")[1]}  (og:url=${canonical})`);
}
