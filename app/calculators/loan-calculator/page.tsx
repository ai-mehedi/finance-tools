import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanCalculator from "./LoanCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/loan-calculator";
const SELF_SLUG = "loan-calculator";

const DESC =
  "Free loan calculator. Work out the monthly payment, total interest and total cost of a personal, auto or any fixed-rate loan from the amount borrowed, interest rate and term, with a balance paydown chart.";

const baseMetadata: Metadata = {
  title: "Loan Calculator",
  description: DESC,
  keywords: [
    "loan calculator",
    "monthly payment calculator",
    "loan interest calculator",
    "personal loan calculator",
    "loan repayment calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Loan Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loan Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How is a loan monthly payment calculated?",
    answer:
      "A fixed-rate loan uses the amortization formula M = P × r ÷ (1 − (1 + r)^−n), where P is the amount borrowed, r is the monthly interest rate (the annual rate divided by 12), and n is the number of monthly payments (years times 12). For a $25,000 loan at 7.5 percent over 5 years, that works out to about $501 a month.",
  },
  {
    question: "What is the difference between total paid and total interest?",
    answer:
      "Total paid is every monthly payment added together over the full term — the monthly payment multiplied by the number of payments. Total interest is that figure minus the original principal, so it is the extra you hand the lender purely for borrowing the money. A lower rate or shorter term cuts the total interest the most.",
  },
  {
    question: "Does a longer term make a loan cheaper?",
    answer:
      "A longer term lowers the monthly payment because you spread the principal over more months, but it raises the total interest because the balance is outstanding for longer. Shortening the term does the opposite: higher monthly cost, far less interest paid overall. The calculator lets you compare both at a glance.",
  },
  {
    question: "Why might my real loan payment differ from this estimate?",
    answer:
      "This assumes a simple fixed-rate, fully amortizing loan with equal monthly payments and no extra fees. Real loans can include origination fees, insurance, a different compounding convention, or a variable rate that changes over time. Always check the lender's quoted APR and disclosure for the exact figures.",
  },
];

export default async function LoanCalculatorPage() {
  const [{ data: tools }, { data: articles }, self] = await Promise.all([
    getTools({ type: "calculator", limit: 7 }),
    getArticles({ limit: 4 }),
    getToolBySlug(SELF_SLUG),
  ]);
  const relatedTools = tools.filter((t) => t.slug !== SELF_SLUG).slice(0, 6);

  const icon = self?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={self.thumbnail} alt="" referrerPolicy="no-referrer" decoding="async" className="h-full w-full object-contain p-1" />
  ) : (
    "💵"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loan Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Loan Calculator"
      intro="Estimate the cost of any fixed-rate loan. Enter the amount you want to borrow, the annual interest rate and the term in years, then press Calculate to see the monthly payment, the total interest and the total you will repay, plus a balance paydown chart."
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
            { name: "Loan Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan calculator works</H2>
            <P>
              A loan calculator turns three simple numbers — how much you borrow, the interest rate and
              how long you take to repay — into the figure that actually matters: your monthly payment.
              Behind the scenes it uses the standard amortization formula. The annual rate is divided by
              twelve to get a monthly rate, the term in years is multiplied by twelve to get the number of
              payments, and those feed a formula that finds the single fixed payment that clears the
              balance exactly at the end of the term.
            </P>
            <P>
              Each monthly payment is split between interest and principal. Early on, most of the payment
              is interest because the balance is large; as the balance falls, more of every payment goes
              to principal. That is why the remaining-balance chart starts to drop slowly and then
              accelerates near the end. Once you know the monthly figure, the calculator adds up every
              payment to show the total paid and subtracts the principal to reveal the true cost of
              borrowing.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you borrow $25,000 for a car at a 7.5 percent annual rate over five years. The monthly
              rate is 0.625 percent and there are sixty payments, which gives a monthly payment of roughly
              $501. Over the full term you repay about $30,070, of which around $5,070 is interest. Nudge
              the rate down to 5 percent and the monthly payment falls to about $472, saving you nearly
              $1,700 in interest across the life of the loan.
            </P>
            <P>
              Try a few combinations to see the trade-offs. Stretching the same $25,000 to a seven-year
              term lowers the monthly payment but pushes total interest higher, while a three-year term
              raises the monthly cost yet cuts interest sharply. The headline payment is what fits your
              budget; the total interest is what tells you whether the loan is a good deal.
            </P>

            <H2>Using the result to compare loans</H2>
            <P>
              The monthly payment alone does not tell the whole story, because a low payment can hide a
              long term and a heavy interest bill. Compare offers on total interest and the quoted APR,
              not just the payment, and watch for origination fees that this calculator does not include.
              Two loans with the same monthly payment can cost very different amounts once you total every
              payment, so always look at the full-term figure before you sign.
            </P>
            <P>
              For a home loan in particular you will want a payment-by-payment breakdown rather than a
              yearly snapshot. Our{" "}
              <Link href="/calculators/amortization-calculator" className="text-orange-600 underline">amortization calculator</Link>{" "}
              shows exactly how each installment splits between interest and principal, and the{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>{" "}
              folds in taxes and insurance for a complete monthly housing cost.
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
