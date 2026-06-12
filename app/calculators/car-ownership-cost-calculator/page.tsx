import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CarOwnershipCostCalculator from "./CarOwnershipCostCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/car-ownership-cost-calculator";
const SELF_SLUG = "car-ownership-cost-calculator";

const DESC =
  "Free total cost of ownership calculator for cars. Add up depreciation, financing, fuel, insurance and maintenance to see what a vehicle really costs per year, month and mile.";

const baseMetadata: Metadata = {
  title: "Total Cost of Ownership Calculator",
  description: DESC,
  keywords: [
    "total cost of ownership calculator",
    "car cost calculator",
    "cost to own a car",
    "true cost to own",
    "vehicle ownership cost",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Total Cost of Ownership Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Total Cost of Ownership Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is total cost of ownership for a car?",
    answer:
      "Total cost of ownership is the full amount you spend to own and run a vehicle over a set period, not just the sticker price. It includes depreciation, financing interest, fuel, insurance, maintenance and recurring costs like registration. It is the most honest way to compare two cars.",
  },
  {
    question: "Why is depreciation usually the biggest cost?",
    answer:
      "Depreciation is the difference between what you paid and what the car is worth when you sell it. Most cars lose a large share of their value in the first few years, so for many owners depreciation outweighs fuel, insurance and maintenance combined.",
  },
  {
    question: "How is cost per mile calculated?",
    answer:
      "Cost per mile divides the total cost of ownership by the total miles you drive over the ownership period. It is a useful single number for comparing vehicles or deciding whether a longer commute is worth it.",
  },
  {
    question: "Does a cheaper car always cost less to own?",
    answer:
      "Not always. A cheaper car can have higher fuel use, pricier insurance or faster depreciation that erases the lower purchase price. Running the full ownership cost, as this calculator does, often changes which option is actually cheaper.",
  },
];

export default async function CarOwnershipCostCalculatorPage() {
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
    "🚙"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Total Cost of Ownership Calculator",
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
      title="Total Cost of Ownership Calculator"
      intro="See what a car really costs once you add depreciation, financing, fuel, insurance and upkeep. Enter your numbers and press Calculate."
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
            { name: "Total Cost of Ownership Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Total Cost of Ownership Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CarOwnershipCostCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How total cost of ownership works</H2>
            <P>
              The price on the window is only the start. Over the years you own a car you also pay for
              the value it loses, the interest on any loan, the fuel it burns, insurance, routine
              maintenance and costs like registration. Adding these together gives the true cost of
              ownership, and the breakdown above shows which pieces dominate.
            </P>
            <P>
              For most owners, depreciation is the single largest expense, followed by fuel and
              insurance. Seeing the split helps you focus on the costs that actually move the needle,
              such as choosing a model that holds its value or one that sips less fuel.
            </P>

            <H2>A quick example</H2>
            <P>
              Buy a $35,000 car, sell it for $15,000 after five years, and depreciation alone is
              $20,000. Add roughly $7,500 in fuel, $8,000 in insurance and $4,500 in maintenance, plus
              financing, and the real cost is well over $40,000, or more than $8,000 a year.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Estimates depend on accurate resale and fuel assumptions, so revisit them as prices
              change. For fuel economy data you can trust, see the official figures at{" "}
              <a href="https://www.fueleconomy.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">FuelEconomy.gov</a>.
              You can also weigh leasing versus buying with our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
