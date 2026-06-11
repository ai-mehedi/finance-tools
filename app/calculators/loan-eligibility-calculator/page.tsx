import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanEligibilityCalculator from "./LoanEligibilityCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/loan-eligibility-calculator";
const SELF_SLUG = "loan-eligibility-calculator";

const DESC =
  "Free loan eligibility calculator. Estimate the maximum loan you may qualify for from your income, existing debts and a lender's debt-to-income limit, with a clear income allocation chart.";

const baseMetadata: Metadata = {
  title: "Loan Eligibility Calculator",
  description: DESC,
  keywords: [
    "loan eligibility calculator",
    "how much loan can I get",
    "debt to income ratio",
    "maximum loan amount",
    "loan affordability",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Loan Eligibility Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Loan Eligibility Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a debt-to-income ratio and why does it matter?",
    answer:
      "Your debt-to-income ratio is the share of your gross monthly income that goes to debt payments. Lenders use it as a quick gauge of how much room you have for a new payment. Many cap the total at around forty three percent, so a lower existing debt load leaves more space for the loan you want.",
  },
  {
    question: "How does this calculator estimate my eligible amount?",
    answer:
      "It first works out the total monthly debt your chosen ratio allows, then subtracts your current debt payments to find what is free for a new loan. That spare payment is run backward through the standard loan formula at your rate and term to find the largest principal it can support.",
  },
  {
    question: "Will I definitely get approved for this amount?",
    answer:
      "No. The figure is an income-based ceiling, not an approval. Lenders also review your credit score, employment history, savings, the value of any collateral and the purpose of the loan. Treat the result as a planning guide and confirm a real limit with a pre-qualification check.",
  },
  {
    question: "How can I increase the loan I qualify for?",
    answer:
      "Raising income, clearing existing balances and choosing a longer term all lift the eligible amount, since each frees up or stretches the affordable monthly payment. A lower interest rate helps too. Just remember that a longer term cuts the monthly cost but raises the total interest you pay.",
  },
];

export default async function LoanEligibilityCalculatorPage() {
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
    name: "Loan Eligibility Calculator",
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
      title="Loan Eligibility Calculator"
      intro="Find out how large a loan your income can support. Enter your earnings, existing debts, a debt-to-income limit, a rate and a term, then press Calculate to see your estimated ceiling."
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
            { name: "Loan Eligibility Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Eligibility Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanEligibilityCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan eligibility calculator works</H2>
            <P>
              Eligibility starts with your income and the debt-to-income limit your lender allows.
              Multiplying the two gives the most you can spend on all debt each month. Subtracting
              what you already pay leaves the slice available for a new loan, and that slice is then
              turned into a maximum principal at your rate and term.
            </P>
            <P>
              The donut chart splits your gross monthly income into three parts: what already goes to
              existing debt, what the new loan payment would claim, and what stays free. Seeing the
              free wedge shrink as you stretch the loan is a quick reality check on comfort.
            </P>

            <H2>A quick example</H2>
            <P>
              Imagine you earn 6,000 dollars a month with 500 dollars of existing payments, and your
              lender caps debt at forty three percent. That allows 2,580 dollars of total debt, so
              2,080 dollars is free for a new loan. At seven and a half percent over five years that
              payment supports roughly 104,000 dollars of borrowing.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Borrowing to the very top of your ratio leaves little cushion for surprises, so aim
              below the cap if you can. For broad guidance on managing debt, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a neutral starting point. Once you know your ceiling, size the actual repayment with our{" "}
              <Link href="/calculators/loan-emi-calculator" className="text-orange-600 underline">loan EMI calculator</Link>.
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
