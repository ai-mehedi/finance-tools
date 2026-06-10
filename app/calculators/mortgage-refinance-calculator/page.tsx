import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MortgageRefinanceCalculator from "./MortgageRefinanceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mortgage-refinance-calculator";
const SELF_SLUG = "mortgage-refinance-calculator";

const DESC =
  "Free mortgage refinance calculator. Compare your current loan with a new rate and term, see your monthly savings and lifetime interest, and find the break-even month when closing costs are repaid.";

export const metadata: Metadata = {
  title: "Mortgage Refinance Calculator",
  description: DESC,
  keywords: [
    "mortgage refinance calculator",
    "refinance break even calculator",
    "refinance savings calculator",
    "should I refinance",
    "mortgage rate comparison",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mortgage Refinance Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mortgage Refinance Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "When does refinancing make sense?",
    answer:
      "Refinancing usually pays off when the new rate is low enough that your monthly savings recover the closing costs well before you plan to sell or move. A lower rate, a shorter time to break even, and staying in the home past that point all strengthen the case.",
  },
  {
    question: "What is the refinance break-even point?",
    answer:
      "It is the number of months it takes for your accumulated monthly savings to equal the upfront closing costs. Divide the closing costs by the monthly saving to get a quick estimate. After that month you are genuinely ahead; before it, the refinance has not yet paid for itself.",
  },
  {
    question: "Why might my monthly payment drop but total interest rise?",
    answer:
      "Resetting to a longer term spreads the balance over more payments, so each one is smaller even at a similar rate, yet you pay interest for more years overall. This tool shows both the monthly saving and the lifetime interest so you can see that trade-off clearly.",
  },
  {
    question: "Are closing costs always paid upfront?",
    answer:
      "Not always. Some lenders offer a no-closing-cost refinance by rolling the fees into the balance or nudging the rate up. That removes the upfront hit but raises your effective cost, so compare the true rate, not just the headline payment.",
  },
];

export default async function MortgageRefinanceCalculatorPage() {
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
    "🔁"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Refinance Calculator",
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
      title="Mortgage Refinance Calculator"
      intro="See whether refinancing your mortgage is worth it. Enter your current loan and a new rate and term, then press Calculate to compare payments, lifetime interest and the break-even month."
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
            { name: "Mortgage Refinance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mortgage Refinance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MortgageRefinanceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the mortgage refinance calculator works</H2>
            <P>
              The tool builds two amortizing loans on the same remaining balance: your existing
              mortgage at its current rate and time left, and a new loan at the rate and term you are
              considering. It compares the monthly payment of each and totals the interest you would
              pay over the full life of both.
            </P>
            <P>
              The chart tracks cumulative savings. It starts below zero by the amount of your closing
              costs and rises by your monthly saving each month. The point where the line crosses zero
              is your break-even month, the moment the refinance has finally paid for itself.
            </P>

            <H2>A worked example</H2>
            <P>
              Say you owe $280,000 at 6.8% with 27 years left, and you refinance into a 30-year loan at
              5.5% with $4,500 in closing costs. The payment falls noticeably, and dividing the closing
              costs by that monthly saving tells you roughly when you break even. Stay in the home well
              past that month and the refinance is a clear win; sell before it and you may lose money.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The figures assume you keep each loan to term and ignore taxes and any rate buydown
              points, so use them as a guide rather than an exact promise. Shop several lenders, since
              the rate and fees vary a lot. For background on the process, see{" "}
              <a href="https://www.consumerfinance.gov/owning-a-home/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB owning-a-home guide</a>.
              If you also want cover for the loan, see our{" "}
              <Link href="/calculators/mortgage-protection-calculator" className="text-orange-600 underline">mortgage protection calculator</Link>.
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
