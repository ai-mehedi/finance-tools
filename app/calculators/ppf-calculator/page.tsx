import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PpfCalculator from "./PpfCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/ppf-calculator";
const SELF_SLUG = "ppf-calculator";

const DESC =
  "Free PPF calculator. Estimate the maturity value of a Public Provident Fund account from your yearly deposit, interest rate and tenure, with a chart that splits your balance into deposits and compounded interest.";

export const metadata: Metadata = {
  title: "PPF Calculator",
  description: DESC,
  keywords: [
    "ppf calculator",
    "public provident fund calculator",
    "ppf maturity calculator",
    "ppf interest calculator",
    "ppf return calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "PPF Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "PPF Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a PPF account?",
    answer:
      "The Public Provident Fund is a long-term, government-backed savings scheme in India with a fixed tenure of fifteen years. It offers a fixed rate of interest that is set by the government every quarter, and both the interest earned and the maturity amount are exempt from income tax under current rules.",
  },
  {
    question: "How is PPF interest calculated and compounded?",
    answer:
      "Interest accrues on the lowest balance in the account between the fifth and the last day of each month, but it is credited only once a year at the end of the financial year. This calculator assumes a single deposit at the start of each year that earns a full year of interest, which keeps the maturity estimate close to a lump-sum-style deposit.",
  },
  {
    question: "How much can I deposit in PPF each year?",
    answer:
      "You can deposit a minimum of five hundred rupees and a maximum of one hundred fifty thousand rupees in a single financial year. Deposits above the ceiling do not earn interest, so this tool flags any yearly amount that falls outside the allowed range.",
  },
  {
    question: "Can I extend a PPF account after fifteen years?",
    answer:
      "Yes. After the initial fifteen-year term you may extend the account in blocks of five years, either with fresh contributions or by leaving the balance to keep earning interest. Extending the tenure lets the compounding run longer, which can meaningfully raise the final corpus shown by this calculator.",
  },
];

export default async function PpfCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PPF Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    dateModified: "2026-06-01",
    author: personSchema(EDITORIAL.author),
    ...(EDITORIAL.reviewer.name ? { reviewer: personSchema(EDITORIAL.reviewer) } : {}),
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="PPF Calculator"
      intro="Plan your Public Provident Fund savings. Enter your yearly deposit, the interest rate and the tenure, then press Calculate to see the maturity value and how interest builds year by year."
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
            { name: "PPF Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="PPF Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PpfCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the PPF calculator works</H2>
            <P>
              A PPF account rewards patience. Each year you add a deposit, and the whole balance,
              including past interest, earns the current rate again. This tool models a deposit at
              the start of every financial year, applies a full year of interest, and rolls the
              result forward so the interest you earned earlier keeps earning in later years.
            </P>
            <P>
              The chart separates the two pieces of your corpus. The shaded area is the closing
              balance, while the dashed line is the money you actually deposited. The gap between
              them is pure compound interest, and it widens noticeably in the final few years of the
              term.
            </P>

            <H2>A quick example</H2>
            <P>
              Deposit the full limit of one hundred fifty thousand rupees a year at a rate of 7.1
              percent for the standard fifteen-year tenure. You contribute twenty-two lakh fifty
              thousand rupees of your own money, yet the account matures at roughly forty point seven
              lakh rupees. More than eighteen lakh of the final value is interest you never deposited.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The government revises the PPF rate every quarter, so the long-run return may differ
              from the single rate you enter here. For the official scheme details and current rate,
              see{" "}
              <a href="https://www.nsiindia.gov.in" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">National Savings Institute</a>.
              If you would rather model market-linked monthly investing instead of a fixed deposit,
              try our{" "}
              <Link href="/calculators/sip-calculator" className="text-orange-600 underline">SIP calculator</Link>.
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
