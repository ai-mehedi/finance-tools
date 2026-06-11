import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CompoundInterestCalculator from "./CompoundInterestCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/compound-interest-calculator";
const SELF_SLUG = "compound-interest-calculator";

const DESC =
  "Free compound interest calculator. See how your savings or investments grow over time with regular contributions, any rate and compounding frequency.";

const baseMetadata: Metadata = {
  title: "Compound Interest Calculator",
  description: DESC,
  keywords: [
    "compound interest calculator",
    "investment growth calculator",
    "compound interest formula",
    "savings growth calculator",
    "future value calculator",
    "interest compounding",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Compound Interest Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Compound Interest Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is compound interest?",
    answer:
      "Compound interest is interest earned on both your original money and the interest it has already earned. Over time this snowball effect makes your balance grow faster than simple interest, which only pays on the original amount.",
  },
  {
    question: "How is compound interest calculated?",
    answer:
      "The core formula is A = P(1 + r/n)^(nt), where P is the principal, r is the annual rate, n is how many times a year it compounds, and t is the number of years. This calculator also adds your monthly contributions as they are made.",
  },
  {
    question: "Does compounding frequency matter?",
    answer:
      "Yes, but less than people expect. More frequent compounding (daily vs annually) raises the total slightly because interest starts earning interest sooner. The rate, contributions and time horizon matter far more than the frequency.",
  },
  {
    question: "Why do contributions matter so much?",
    answer:
      "Regular monthly contributions are often the biggest driver of the final balance, especially early on. Each contribution has more years to compound, so investing consistently over a long period usually beats a single large lump sum added later.",
  },
];

export default async function CompoundInterestCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Compound Interest Calculator",
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
      title="Compound Interest Calculator"
      intro="See how your savings or investments grow over time. Enter a starting amount, monthly contribution, rate and time, then press Calculate."
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
            { name: "Compound Interest Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Compound Interest Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <CompoundInterestCalculator />

          {/* Ad 1 */}
          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How compound interest works</H2>
            <P>
              Compound interest pays you interest on your interest. Each period, the rate is applied
              to your whole balance, including gains from earlier periods, so the balance grows
              faster and faster. The longer your money stays invested, the more dramatic the effect.
            </P>
            <P>
              The standard formula is A = P(1 + r/n)<sup>nt</sup>, where P is the principal, r is the
              annual rate as a decimal, n is the number of compounding periods per year and t is the
              number of years. This calculator extends that by adding your monthly contributions,
              which is how most people actually invest.
            </P>

            <H2>A quick example</H2>
            <P>
              Start with $10,000, add $200 a month, and earn 8% a year compounded monthly for 20
              years. You contribute $58,000 of your own money, yet the balance grows to well over
              $160,000. The difference is compound interest doing the heavy lifting, as the chart
              above shows the gap between what you put in and what you end with widening every year.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Returns are not guaranteed and real investments fluctuate, so treat the rate as a
              long-term average, not a promise. For broad investor education see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>{" "}
              from the SEC. You can also explore our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other financial calculators</Link>{" "}
              to plan savings, retirement and loans.
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

          {/* Related guides */}
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

          {/* Ad 2 */}
          <div className="mt-10">
            <AdSlot minHeight={120} />
          </div>
        </div>

        {/* Sidebar */}
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

          {/* Ad 3 — sticky side banner */}
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
