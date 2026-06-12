import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RentAffordabilityCalculator from "./RentAffordabilityCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/rent-affordability-calculator";
const SELF_SLUG = "rent-affordability-calculator";

const DESC =
  "Free rent affordability calculator. Find how much rent you can comfortably afford from your income and debts using the 30 percent rule with a built-in total debt safeguard.";

const baseMetadata: Metadata = {
  title: "Rent Affordability Calculator",
  description: DESC,
  keywords: [
    "rent affordability calculator",
    "how much rent can i afford",
    "30 percent rent rule",
    "rent to income ratio",
    "affordable rent calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Rent Affordability Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Rent Affordability Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much of my income should go to rent?",
    answer:
      "A widely used guideline caps rent at about thirty percent of gross monthly income. Spending less leaves more room for saving and unexpected bills, while going much above thirty percent can leave a budget stretched, especially once utilities and other housing costs are added.",
  },
  {
    question: "What is the 30 percent rule?",
    answer:
      "The thirty percent rule says no more than thirty percent of your gross income should be spent on rent. It is a rough benchmark rather than a hard limit, and what is comfortable depends on your other debts, your savings goals and the cost of living where you are.",
  },
  {
    question: "Why does this calculator factor in my other debts?",
    answer:
      "Rent is only part of the picture. Lenders and budgeting guides often want total obligations, including loans and credit cards, to stay under about forty three percent of gross income. When your existing debt is high, this tool trims the recommended rent so the combined burden stays under that ceiling.",
  },
  {
    question: "Should I use gross or net income for rent?",
    answer:
      "This calculator uses gross income, the amount before tax, because the thirty percent benchmark is defined against gross pay. If you prefer to budget against take-home pay, enter a lower target share, since a given dollar of rent is a larger slice of your net income than of your gross.",
  },
];

export default async function RentAffordabilityCalculatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rent Affordability Calculator",
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
      title="Rent Affordability Calculator"
      intro="Work out a rent you can live with. Enter your gross monthly income, existing debt payments and a target share for housing, then press Calculate to see a comfortable rent figure."
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
            { name: "Rent Affordability Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Rent Affordability Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RentAffordabilityCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the rent affordability calculator works</H2>
            <P>
              The tool starts from the share of income you want to spend on rent, defaulting to the
              classic thirty percent benchmark. It then runs a second check against your other monthly
              debts, so a heavy car loan or student loan does not get ignored. The figure it returns is
              the lower of the two, which keeps both your rent and your overall debt load in a healthy
              range.
            </P>
            <P>
              The chart shows three comfort bands, conservative, moderate and stretch, set at twenty
              five, thirty and thirty five percent of income. The dashed line marks the recommendation
              this calculator gives you, so you can see exactly where your number sits relative to each
              band.
            </P>

            <H2>A quick example</H2>
            <P>
              On 5,000 dollars of gross monthly income with 400 dollars of existing debt, a thirty
              percent target points to 1,500 dollars of rent. The debt check allows up to 1,750 dollars
              of rent before total obligations hit the forty three percent ceiling, so the target stands
              and the recommendation is 1,500 dollars, leaving 3,100 dollars for everything else.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Rent is rarely the whole cost of a home, so leave headroom for utilities, renters
              insurance and deposits. For a neutral primer on budgeting for housing, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              If you are weighing renting against buying, the monthly cost on the ownership side comes
              from our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>.
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
