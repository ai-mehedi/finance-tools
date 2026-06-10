import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ExtraPaymentCalculator from "./ExtraPaymentCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/extra-payment-calculator";
const SELF_SLUG = "extra-payment-calculator";

const DESC =
  "Free extra payment savings calculator. See how much interest you save and how many years you cut off your loan by paying a little extra toward principal each month.";

const baseMetadata: Metadata = {
  title: "Extra Payment Savings Calculator",
  description: DESC,
  keywords: [
    "extra payment calculator",
    "extra mortgage payment calculator",
    "pay off loan early calculator",
    "extra principal payment savings",
    "loan payoff calculator",
    "interest saved calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Extra Payment Savings Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Extra Payment Savings Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does paying extra each month save money?",
    answer:
      "Every extra dollar goes straight to the loan principal, not interest. A smaller principal means the lender charges interest on less money in every future month, so the savings compound. This both lowers total interest and shortens the loan.",
  },
  {
    question: "Is it better to pay extra monthly or one lump sum?",
    answer:
      "Both help. Consistent monthly extras start reducing principal right away, which usually saves the most over a long loan. A single lump sum early in the loan is also powerful because it removes principal before years of interest can accrue on it.",
  },
  {
    question: "Should I tell my lender the extra goes to principal?",
    answer:
      "Yes. Many servicers apply unmarked extra money to the next month's payment instead of the principal balance. Note that the extra amount is for principal only, and check your statement to confirm it was applied correctly.",
  },
  {
    question: "Should I pay off the loan early or invest instead?",
    answer:
      "It depends on your interest rate and goals. If the loan rate is higher than what you could reliably earn investing, paying it down is a guaranteed return. If the rate is low, investing the extra may build more wealth, though it carries market risk.",
  },
];

export default async function ExtraPaymentCalculatorPage() {
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
    "💸"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Extra Payment Savings Calculator",
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
      title="Extra Payment Savings Calculator"
      intro="See how much interest you save and how many years you cut off your loan by paying a little extra toward principal each month. Enter your numbers and press Calculate."
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
            { name: "Extra Payment Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Extra Payment Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExtraPaymentCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How extra payments work</H2>
            <P>
              The calculator amortizes your loan twice. The first run uses only the scheduled payment.
              The second adds your extra amount to principal every month. The difference in total
              interest is your savings, and the difference in payoff dates is the time you cut off. The
              chart shows both balances, and the orange line, with the extra payment, reaches zero
              noticeably sooner.
            </P>
            <P>
              Because interest is charged on the outstanding balance, attacking principal early has an
              outsized effect. The same extra dollar saves far more interest in year one than it would
              in the final year of the loan.
            </P>

            <H2>A quick example</H2>
            <P>
              On a $280,000 loan at 6.5% over 30 years, the payment is about $1,770 a month. Adding just
              $200 extra to principal each month can save tens of thousands in interest and pay the loan
              off years ahead of schedule. Larger extras compress the timeline even further.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Make sure you have an emergency fund and no higher rate debt before committing extra cash
              to a low rate loan. Confirm there is no prepayment penalty in your loan terms. For
              guidance on paying down debt, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. You can also compare full payments with our{" "}
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
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
