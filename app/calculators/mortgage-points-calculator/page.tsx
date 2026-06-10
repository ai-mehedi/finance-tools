import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MortgagePointsCalculator from "./MortgagePointsCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mortgage-points-calculator";
const SELF_SLUG = "mortgage-points-calculator";

const DESC =
  "Free mortgage points calculator. Weigh the upfront cost of discount points against the lower monthly payment, find your break-even month and lifetime savings, with a cumulative-cost chart.";

const baseMetadata: Metadata = {
  title: "Mortgage Points Calculator",
  description: DESC,
  keywords: [
    "mortgage points calculator",
    "discount points calculator",
    "buy down rate",
    "mortgage points break even",
    "are points worth it",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mortgage Points Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mortgage Points Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a mortgage discount point?",
    answer:
      "A discount point is an upfront fee you pay the lender to lower your interest rate. One point costs 1 percent of the loan amount. On a 320,000 dollar loan a single point is 3,200 dollars, paid at closing in exchange for a smaller rate and a lower monthly payment.",
  },
  {
    question: "How do I know if buying points is worth it?",
    answer:
      "Compare your break-even month to how long you plan to keep the loan. The break-even is the upfront cost divided by the monthly saving. If you will stay in the home and keep the mortgage well past that month, the points pay for themselves and then save money. If you may move or refinance sooner, skip them.",
  },
  {
    question: "How much does one point lower my rate?",
    answer:
      "There is no fixed rule, but a quarter of a percentage point per point is a common ballpark. Lenders set their own pricing, so always ask for the exact rate reduction in writing. This calculator lets you enter the reduction per point so you can match your real quote.",
  },
  {
    question: "Are mortgage points tax deductible?",
    answer:
      "Points paid to buy down the rate on a loan for your main home are often deductible, sometimes in the year you pay them and sometimes spread over the loan term. Rules vary by situation and country, so confirm with a tax professional before relying on a deduction.",
  },
];

export default async function MortgagePointsCalculatorPage() {
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
    "📉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Points Calculator",
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
      title="Mortgage Points Calculator"
      intro="Decide whether paying for discount points pays off. Enter your loan, base rate, term and how many points you would buy, then press Calculate to see your break-even month and lifetime savings."
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
            { name: "Mortgage Points Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mortgage Points Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MortgagePointsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the mortgage points calculator works</H2>
            <P>
              The tool prices your points as a percentage of the loan, then lowers your rate by the
              reduction you enter for each point. It works out the monthly payment both with and without
              the buy-down and reports the gap between them as your monthly saving.
            </P>
            <P>
              Dividing the upfront cost by that monthly saving gives the break-even month, the moment the
              accumulated savings finally repay what you spent on points. The chart tracks the running
              total of cash paid under each scenario, starting the points line higher because of the
              upfront fee and then watching the no-points line catch up and overtake it.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you borrow 320,000 dollars over 30 years at 6.75 percent and buy 2 points for
              6,400 dollars, each cutting the rate by a quarter point to 6.25 percent. The payment drops
              by roughly 105 dollars a month, so you break even in a little over five years and save
              thousands more if you keep the loan to term.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The case for points lives or dies on how long you keep the loan. Sell or refinance before
              break-even and you lose money on the deal. Always confirm the exact rate reduction per
              point with your lender, since it is not standardised. The{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              explains points in plain language. If you are also weighing a refinance, our{" "}
              <Link href="/calculators/mortgage-payoff-calculator" className="text-orange-600 underline">mortgage payoff calculator</Link>{" "}
              shows what extra payments would do instead.
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
