import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import FuelCostCalculator from "./FuelCostCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/fuel-cost-calculator";
const SELF_SLUG = "fuel-cost-calculator";

const DESC =
  "Free fuel cost calculator. Estimate the cost of fuel for any trip from the distance, your vehicle's miles per gallon and the price per gallon, plus a yearly total.";

export const metadata: Metadata = {
  title: "Fuel Cost Calculator",
  description: DESC,
  keywords: [
    "fuel cost calculator",
    "gas cost calculator",
    "trip fuel cost",
    "cost of fuel calculator",
    "gas mileage cost",
    "commute fuel cost",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Fuel Cost Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Fuel Cost Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is the cost of fuel for a trip calculated?",
    answer:
      "Divide the trip distance by your vehicle's miles per gallon to get the gallons used, then multiply by the price per gallon. For example, a 60 mile round trip at 28 MPG uses about 2.14 gallons, which at $3.45 a gallon costs roughly $7.40.",
  },
  {
    question: "What is a good MPG figure to use?",
    answer:
      "Use your vehicle's real world economy rather than the sticker number, since traffic, terrain and driving style all reduce it. Many drivers see 10% to 20% lower than the rated figure, so checking a few tank fills gives you a more honest estimate.",
  },
  {
    question: "How do I work out my yearly commuting cost?",
    answer:
      "Enter how many trips you make each week and the calculator multiplies the cost per trip by your trips per week and 52 weeks. This gives a realistic annual fuel bill you can use for budgeting or for comparing commuting options.",
  },
  {
    question: "Does this work for kilometres and litres?",
    answer:
      "The tool is built around miles, miles per gallon and price per gallon. If you use metric units, convert your distance to miles and your fuel economy to miles per gallon first, then the cost figures will be correct.",
  },
];

export default async function FuelCostCalculatorPage() {
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
    "⛽"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Fuel Cost Calculator",
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
      title="Fuel Cost Calculator"
      intro="Estimate what fuel costs for a trip or a daily commute. Enter the distance, your fuel economy and the price per gallon, then press Calculate."
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
            { name: "Fuel Cost Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Fuel Cost Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FuelCostCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the fuel cost calculator works</H2>
            <P>
              Fuel cost comes down to three numbers: how far you drive, how many miles your vehicle gets
              per gallon, and what a gallon costs. The calculator divides distance by your miles per
              gallon to find the fuel used, then multiplies that by the pump price. Choosing a round trip
              simply doubles the distance.
            </P>
            <P>
              To turn a single trip into a budget, the tool also projects an annual figure from how many
              trips you make each week. That makes it easy to see the true cost of a commute or a regular
              drive across a full year.
            </P>

            <H2>A quick example</H2>
            <P>
              A 30 mile each way commute is a 60 mile round trip. At 28 MPG that burns about 2.14 gallons,
              and at $3.45 a gallon the daily fuel cost is around $7.40. Drive it five days a week and
              the yearly fuel bill lands near $1,920.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This estimate covers fuel only. The full cost of driving also includes insurance,
              maintenance, tyres and depreciation, which often dwarf the fuel bill. For official fuel
              economy ratings by make and model, the{" "}
              <a href="https://www.fueleconomy.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Department of Energy fuel economy site</a>{" "}
              is a reliable reference. Explore the wider picture with our{" "}
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
