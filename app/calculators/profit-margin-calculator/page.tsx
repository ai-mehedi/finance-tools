import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ProfitMarginCalculator from "./ProfitMarginCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/profit-margin-calculator";
const SELF_SLUG = "profit-margin-calculator";

const DESC =
  "Free profit margin calculator. Enter your revenue and cost to find gross profit, net profit margin, markup on cost, and how each revenue dollar splits between cost and profit.";

const baseMetadata: Metadata = {
  title: "Profit Margin Calculator",
  description: DESC,
  keywords: [
    "profit margin calculator",
    "net profit margin",
    "gross profit calculator",
    "markup calculator",
    "margin vs markup",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Profit Margin Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Profit Margin Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How do you calculate profit margin?",
    answer:
      "Subtract total cost from revenue to get profit, then divide that profit by revenue and multiply by 100. For example, $3,500 of profit on $10,000 of sales is a 35 percent margin. Margin always measures profit against sales, not against cost.",
  },
  {
    question: "What is the difference between margin and markup?",
    answer:
      "Margin divides profit by revenue, while markup divides profit by cost. A product that costs $65 and sells for $100 has a 35 percent margin but a roughly 54 percent markup. Markup is always the larger number because cost is smaller than the selling price.",
  },
  {
    question: "What counts as a good profit margin?",
    answer:
      "It depends entirely on the industry. Grocery stores often run on single-digit margins, while software firms can clear 70 percent or more. Compare your margin to peers in the same sector rather than to a fixed benchmark.",
  },
  {
    question: "Should I use gross or net cost in this tool?",
    answer:
      "Enter whichever cost matches the profit you want to measure. Use cost of goods sold for a gross margin, or include operating expenses, interest and overhead for a fuller net margin. Be consistent so the percentage is meaningful.",
  },
];

export default async function ProfitMarginCalculatorPage() {
  const [{ data: tools }, { data: articles }, self] = await Promise.all([
    getRelatedTools(SELF_SLUG, 7),
    getArticles({ limit: 3 }),
    getToolBySlug(SELF_SLUG),
  ]);
  const relatedTools = tools.filter((t) => t.slug !== SELF_SLUG).slice(0, 6);

  const icon = self?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={self.thumbnail} alt="" referrerPolicy="no-referrer" decoding="async" className="h-full w-full object-contain p-1" />
  ) : (
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Profit Margin Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    author: personSchema(EDITORIAL.author),
    ...(EDITORIAL.reviewer.name ? { reviewer: personSchema(EDITORIAL.reviewer) } : {}),
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Profit Margin Calculator"
      intro="See how profitable a sale, product, or whole business really is. Enter revenue and cost, press Calculate, and get the profit margin, markup, and a clear split of every revenue dollar."
      active="Calculators"
      icon={icon}
      wide
    >
      <JsonLd
        data={[
          webApp,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Calculators", path: "/calculators" },
            { name: "Profit Margin Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Profit Margin Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfitMarginCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the profit margin calculator works</H2>
            <P>
              The tool starts by subtracting your total cost from your revenue to find profit. It then
              expresses that profit two ways: as a margin, which divides profit by revenue, and as a
              markup, which divides profit by cost. Both describe the same dollars from a different angle.
            </P>
            <P>
              The donut chart shows where each dollar of revenue ends up. The grey slice is the portion
              consumed by cost, and the orange slice is what you keep as profit. A thin orange slice means
              most of your sales are paying for the goods themselves.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you sell a handmade item for $100 and it costs you $65 to make and ship. Your profit
              is $35, which is a 35 percent margin on the sale but a roughly 54 percent markup on the cost.
              Knowing both numbers helps you price new products without eroding the margin you depend on.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Margins can mislead if you forget hidden costs like returns, payment fees and shipping.
              The U.S. Small Business Administration has practical guidance on{" "}
              <a href="https://www.sba.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">pricing and managing a small business</a>.
              To factor income tax into your bottom line, switch over to our{" "}
              <Link href="/calculators/profit-margin-tax-calculator" className="text-orange-600 underline">profit margin with tax calculator</Link>.
            </P>

            <H2>Frequently asked questions</H2>
            <div className="mt-4 space-y-3">
              {FAQ.map((f) => (
                <details key={f.question} className="group rounded-xl border border-zinc-200 bg-white p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-zinc-900 [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <ChevronDown className="size-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 text-[15px] leading-7 text-zinc-600">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>

          {articles.length > 0 && (
            <div className="mt-12">
              <div className="mb-5 flex items-center justify-between">
                <H2>Related guides</H2>
                <Link href="/blog" className="shrink-0 text-sm font-semibold text-orange-600 hover:text-orange-700">View all →</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <BlogCard key={a._id} article={a} size="sm" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <AdSlot minHeight={120} />
          </div>
        </div>

        <aside className="space-y-6">
          {relatedTools.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-extrabold text-zinc-900">Related calculators</h2>
              <ul className="mt-3 space-y-1">
                {relatedTools.map((t) => (
                  <li key={t._id}>
                    <Link href={t.url || `/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-50 text-base">
                        {t.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain p-0.5" />
                        ) : ("🧮")}
                      </span>
                      <span className="text-sm font-medium text-zinc-700 group-hover:text-orange-600">{t.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/calculators" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100">
                View all calculators
              </Link>
            </div>
          )}

          <AdSlot slot="8843302220" minHeight={600} className="lg:sticky lg:top-20" />

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-6">
            <h2 className="text-lg font-extrabold leading-snug text-zinc-900">Explore more tools</h2>
            <p className="mt-2 text-sm text-zinc-600">200+ free calculators in one place.</p>
            <Link href="/tools" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600">Browse tools</Link>
          </div>
        </aside>
      </div>
    </StaticPage>
  );
}
export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(SELF_SLUG, baseMetadata);
}
