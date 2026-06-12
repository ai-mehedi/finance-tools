import { getToolCategoriesWithCounts } from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";

// Served at /llms.txt — the llms.txt standard (llmstxt.org): a curated, plain-text
// map of the site for AI assistants. Kept fresh from the DB category list so it
// never drifts, and intentionally links to section hubs (not every tool) so it
// can't surface a calculator whose page isn't built yet.
export const revalidate = 3600;

export async function GET() {
  const cats = await getToolCategoriesWithCounts();

  const lines = [
    "# TopicDrill",
    "",
    "> Free, fast financial calculators and clear money guides covering loans, mortgages, investing, taxes, savings and retirement. No sign-ups, no clutter — just accurate numbers you can act on.",
    "",
    "TopicDrill offers 200+ free financial calculators plus plain-language money guides. Every tool runs in the browser, needs no account, and shows its working so the numbers can be trusted and cited.",
    "",
    "## Key pages",
    "",
    `- [All calculators](${SITE_URL}/calculators): Browse every free financial calculator`,
    `- [Categories](${SITE_URL}/categories): Calculators grouped by topic`,
    `- [Blog & guides](${SITE_URL}/blog): Money guides, explainers and comparisons`,
    `- [Glossary](${SITE_URL}/glossary): Plain-language finance definitions`,
    `- [FAQs](${SITE_URL}/faqs): Answers to common money questions`,
    `- [About](${SITE_URL}/about): Who we are and our editorial standards`,
    "",
    "## Calculator categories",
    "",
    ...cats.map((c) => `- [${c.name}](${SITE_URL}/categories/${c.slug}): ${c.count} free calculators`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
