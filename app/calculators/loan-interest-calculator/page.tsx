import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanInterestCalculator from "./LoanInterestCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/loan-interest-calculator";
const SELF_SLUG = "loan-interest-calculator";

const DESC =
  "Free loan interest calculator. See the monthly payment, total interest and full cost of a fixed-rate loan, plus a chart showing how each payment shifts from interest to principal.";

const baseMetadata: Metadata = {
  title: "Loan Interest Calculator",
  description: DESC,
  keywords: [
    "loan interest calculator",
    "total interest on a loan",
    "loan cost calculator",
    "amortization interest",
    "monthly payment calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Loan Interest Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Loan Interest Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is the interest on a loan calculated each month?",
    answer:
      "Each month the lender charges interest on the balance that is still owed. Multiply the remaining balance by the monthly rate, which is the annual rate divided by twelve. Whatever is left of your fixed payment after covering that interest goes toward shrinking the principal, so the interest portion falls a little every month.",
  },
  {
    question: "Why does so much of an early payment go to interest?",
    answer:
      "At the start the balance is at its largest, so the interest charge is at its largest too. The fixed payment barely makes a dent in principal in the first months. As the balance falls the interest charge falls with it, and a growing share of each payment chips away at the principal. The chart on this page shows that shift clearly.",
  },
  {
    question: "What is the formula for total interest?",
    answer:
      "First find the fixed monthly payment using the amortization formula, then multiply that payment by the number of months to get everything you pay. Subtract the original amount borrowed and what remains is the total interest. With a zero rate the total interest is simply zero and the payment is the amount divided by the number of months.",
  },
  {
    question: "Will paying extra each month reduce the interest?",
    answer:
      "Yes, and often by a surprising amount. Any extra money goes straight to principal, which lowers the balance that future interest is charged on. That shortens the loan and can save a large share of the interest, especially early on when the balance is high.",
  },
];

export default async function LoanInterestCalculatorPage() {
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
    name: "Loan Interest Calculator",
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
      title="Loan Interest Calculator"
      intro="Find out how much a loan really costs in interest. Enter the amount, rate and term, then press Calculate to see the monthly payment, the total interest and how each payment splits between interest and principal."
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
            { name: "Loan Interest Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Interest Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanInterestCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan interest calculator works</H2>
            <P>
              The tool first solves for the single fixed payment that will clear your balance over
              the term. It then walks the loan one month at a time. For each month it charges interest
              on whatever you still owe, applies the rest of your payment to the principal, and keeps a
              running total of the interest. That month-by-month walk is what makes the total accurate
              rather than a rough estimate.
            </P>
            <P>
              The chart plots two running totals: the interest you have paid and the principal you have
              repaid. Early on the interest line climbs faster, then it flattens as the principal line
              takes over. The point where they cross is roughly when you start owning more than you owe
              in interest.
            </P>

            <H2>A quick example</H2>
            <P>
              Borrow $20,000 at 7.5% for 5 years and the payment lands near $401 a month. Over the full
              term you repay about $24,040, which means roughly $4,040 of that is pure interest. Stretch
              the same loan to 7 years and the monthly payment drops, but the total interest climbs
              because the balance lingers longer.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The figures assume a fixed rate and that you never miss or skip a payment. Variable-rate
              loans can move up or down, and late payments add fees on top. For a plain-language guide to
              how loan interest accrues, see{" "}
              <a href="https://www.investor.gov/introduction-investing/investing-basics/glossary/interest" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov on interest</a>.
              If you might pay late, estimate the penalty with our{" "}
              <Link href="/calculators/loan-late-payment-calculator" className="text-orange-600 underline">loan late payment calculator</Link>.
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
