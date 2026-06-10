import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CostOfLivingCalculator from "./CostOfLivingCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/cost-of-living-calculator";
const SELF_SLUG = "cost-of-living-calculator";

const DESC =
  "Free cost of living comparison calculator. See how much salary you need in a new city to keep the same standard of living, using each city cost of living index.";

const baseMetadata: Metadata = {
  title: "Cost of Living Comparison Calculator",
  description: DESC,
  keywords: [
    "cost of living calculator",
    "cost of living comparison",
    "salary comparison calculator",
    "city comparison calculator",
    "equivalent salary calculator",
    "moving cost of living",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Cost of Living Comparison Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Cost of Living Comparison Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a cost of living index?",
    answer:
      "A cost of living index expresses how expensive a place is compared with a national average set at 100. A city at 120 is roughly 20% more expensive than average, and a city at 90 is about 10% cheaper. The index blends housing, groceries, transport, healthcare and other everyday costs.",
  },
  {
    question: "How do I work out the salary I need in a new city?",
    answer:
      "Multiply your current salary by the ratio of the two indexes: new salary = current salary × (new city index ÷ current city index). If your current city is 100 and the new city is 130, you need 30% more income to maintain the same lifestyle.",
  },
  {
    question: "Where can I find cost of living index numbers?",
    answer:
      "Several public sources publish them, including the Council for Community and Economic Research and large crowd-sourced databases. Numbers vary by source and update over time, so treat the result as a planning estimate rather than an exact figure.",
  },
  {
    question: "Does this include taxes?",
    answer:
      "Cost of living indexes focus on prices for goods and services, not income taxes. State and local taxes can change your take-home pay significantly, so check those separately when comparing a job offer in another state.",
  },
];

export default async function CostOfLivingCalculatorPage() {
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
    "🌆"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cost of Living Comparison Calculator",
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
      title="Cost of Living Comparison Calculator"
      intro="See how far your salary goes in a new city. Enter your pay and each city cost of living index to find the equivalent salary you would need, then press Calculate."
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
            { name: "Cost of Living Comparison Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Cost of Living Comparison Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CostOfLivingCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the comparison works</H2>
            <P>
              The calculator scales your salary by the ratio of the two cost of living indexes. If
              your current city sits at the national average of 100 and the city you are moving to is
              at 130, prices are roughly 30% higher, so you would need about 30% more income to keep
              the same standard of living. If the new city is cheaper, the same salary stretches
              further and you may come out ahead.
            </P>
            <P>
              The index combines the major spending categories most households share: housing,
              groceries, utilities, transport and healthcare. Housing is usually the biggest driver
              of the difference between two places, so a city with high rents will pull the whole
              index up even if everyday goods cost about the same.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you earn $75,000 in a city at index 100 and you are weighing a move to a city at
              index 130. To match your current lifestyle you would need about $97,500. If the offer
              on the table is only $90,000, the higher pay does not fully cover the higher prices, so
              your real spending power would drop.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Indexes are averages, so your personal result depends on your lifestyle and especially
              your housing choice. Taxes are handled separately. For broad regional price data, the{" "}
              <a href="https://www.bls.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Bureau of Labor Statistics</a>{" "}
              is a solid reference. To check the pay side of a move, try our{" "}
              <Link href="/calculators" className="text-orange-600 underline">salary and budgeting calculators</Link>.
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
