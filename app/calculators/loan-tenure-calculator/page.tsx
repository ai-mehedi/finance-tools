import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanTenureCalculator from "./LoanTenureCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/loan-tenure-calculator";
const SELF_SLUG = "loan-tenure-calculator";

const DESC =
  "Free loan tenure calculator. Enter your balance, interest rate and monthly payment to find out how many months and years it takes to clear the loan, with a chart of the falling balance.";

const baseMetadata: Metadata = {
  title: "Loan Tenure Calculator",
  description: DESC,
  keywords: [
    "loan tenure calculator",
    "loan payoff time",
    "how long to pay off loan",
    "loan term calculator",
    "debt payoff calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Loan Tenure Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Loan Tenure Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What does loan tenure mean?",
    answer:
      "Loan tenure is the length of time it takes to fully repay a loan. This calculator works it out from the opposite direction to most tools: instead of fixing a term and solving for the payment, it fixes the payment you can afford and tells you how many months until the balance reaches zero.",
  },
  {
    question: "How does a fixed monthly payment shorten the tenure?",
    answer:
      "Each payment is split between interest on the current balance and principal. Early on most of it covers interest, but as the balance falls the interest portion shrinks and more goes to principal, so the loan clears faster and faster toward the end.",
  },
  {
    question: "Why does my payment need to be above a minimum?",
    answer:
      "If the monthly payment is smaller than one month of interest, the balance grows instead of falling and the loan is never repaid. The calculator flags this and asks for a payment that at least covers the first month of interest.",
  },
  {
    question: "How can I pay off the loan sooner?",
    answer:
      "Raising the monthly payment, even by a small amount, cuts the tenure and the total interest noticeably because the extra goes straight to principal. A lower interest rate has the same effect, so refinancing can also shorten the payoff time.",
  },
];

export default async function LoanTenureCalculatorPage() {
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
    "⏳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loan Tenure Calculator",
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
      title="Loan Tenure Calculator"
      intro="Find out how long it takes to clear a loan from the payment you can afford. Enter the balance, interest rate and monthly payment, then press Calculate to see the payoff time."
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
            { name: "Loan Tenure Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Tenure Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanTenureCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan tenure calculator works</H2>
            <P>
              Most loan tools ask for a term and tell you the payment. This one flips that around. You
              decide what you can comfortably pay each month, and it counts the months until the
              balance hits zero. Behind the scenes it walks through the loan one month at a time,
              charging interest on the remaining balance and applying whatever is left of your payment
              to principal.
            </P>
            <P>
              The chart traces the outstanding balance from the first payment to the last. The curve
              starts shallow because early payments barely dent the principal, then steepens as the
              interest share shrinks and your payment chips away at the balance faster each month.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you owe $25,000 at 8.5% a year and pay $500 a month. The first payment includes
              roughly $177 of interest, leaving about $323 for principal. As the balance falls the
              interest portion drops, and the loan is fully repaid in a little under six years, with
              total interest of several thousand dollars on top of the original $25,000.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The result assumes a fixed rate and the same payment every month. Variable rates, fees or
              skipped payments will change the real tenure. For background on how loan interest is
              charged, see the{" "}
              <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-en-103/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB explainer on amortization</a>.
              To check the payment for a fixed term instead, try our{" "}
              <Link href="/calculators/loan-calculator" className="text-orange-600 underline">loan calculator</Link>.
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
