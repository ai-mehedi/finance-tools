import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BreakEvenCalculator from "./BreakEvenCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/break-even-calculator";
const SELF_SLUG = "break-even-calculator";

const DESC =
  "Free break even calculator. Find the number of units and the sales revenue your business needs to cover fixed and variable costs, with a break-even chart.";

const baseMetadata: Metadata = {
  title: "Break Even Calculator",
  description: DESC,
  keywords: [
    "break even calculator",
    "break even point calculator",
    "break even analysis",
    "contribution margin calculator",
    "break even units",
    "business break even",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Break Even Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Break Even Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the break-even point?",
    answer:
      "The break-even point is the level of sales where total revenue exactly equals total cost, so you make neither a profit nor a loss. Below it you lose money, above it you start earning profit on each extra unit sold.",
  },
  {
    question: "How do you calculate break-even units?",
    answer:
      "Divide your total fixed costs by the contribution margin per unit, which is the selling price minus the variable cost per unit. The result is how many units you must sell to cover all your costs.",
  },
  {
    question: "What is contribution margin?",
    answer:
      "Contribution margin is the money left from each sale after paying that unit's variable cost. It is what is available to cover fixed costs and, once those are covered, to become profit. A higher margin means you break even sooner.",
  },
  {
    question: "Why does the calculator need a price above variable cost?",
    answer:
      "If the price does not exceed the variable cost, each sale loses money and no amount of volume ever covers your fixed costs, so there is no break-even point. You would need to raise the price or cut the variable cost first.",
  },
];

export default async function BreakEvenCalculatorPage() {
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
    name: "Break Even Calculator",
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
      title="Break Even Calculator"
      intro="Find how many units and how much revenue you need to cover your costs, and see where revenue overtakes cost. Enter your numbers and press Calculate."
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
            { name: "Break Even Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Break Even Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BreakEvenCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How break-even analysis works</H2>
            <P>
              Every business has fixed costs that stay the same no matter how much you sell, such as
              rent and salaries, and variable costs that rise with each unit, such as materials. The
              break-even point is where the money you collect finally covers both. The chart above
              shows the revenue line crossing the total cost line at exactly that point.
            </P>
            <P>
              The key number is the contribution margin, the price minus the variable cost per unit.
              Dividing fixed costs by that margin tells you how many units you must sell before you
              stop losing money and start earning profit.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose fixed costs are $20,000, you sell each unit for $50 and each costs $30 to make.
              The contribution margin is $20, so you break even at 1,000 units, which is $50,000 in
              sales. Unit number 1,001 starts adding $20 of profit.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Break-even is a planning tool, not a guarantee. Real fixed costs can step up as you
              grow, and prices or material costs may change. For more on small business finances, the{" "}
              <a href="https://www.sba.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Small Business Administration</a>{" "}
              is a useful resource. You can model more scenarios with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>.
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
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
