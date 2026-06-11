import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DebtToIncomeCalculator from "./DebtToIncomeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/debt-to-income-calculator";
const SELF_SLUG = "debt-to-income-calculator";

const DESC =
  "Free debt to income ratio calculator. Find your DTI by dividing total monthly debt payments by gross monthly income, and see how lenders rate it.";

const baseMetadata: Metadata = {
  title: "Debt to Income Ratio Calculator",
  description: DESC,
  keywords: [
    "debt to income calculator",
    "DTI calculator",
    "debt to income ratio",
    "mortgage DTI calculator",
    "front end back end ratio",
    "qualify for mortgage",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Debt to Income Ratio Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Debt to Income Ratio Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a debt to income ratio?",
    answer:
      "Your debt to income ratio, or DTI, is the share of your gross monthly income that goes to debt payments. You divide total monthly debt by gross monthly income and multiply by 100. Lenders use it to judge whether you can take on more debt comfortably.",
  },
  {
    question: "What is a good DTI ratio?",
    answer:
      "A back-end DTI at or below 36% is generally considered healthy, and many lenders prefer it under 43% for a mortgage. Below 28% is excellent. The lower the ratio, the more room you have in your budget and the easier you are to approve.",
  },
  {
    question: "What is the difference between front-end and back-end DTI?",
    answer:
      "The front-end ratio counts only your housing payment against your income. The back-end ratio counts all debts, including housing, car, credit cards and loans. Lenders usually weigh the back-end ratio most heavily, but they look at both.",
  },
  {
    question: "Should I use gross or net income?",
    answer:
      "Use gross income, which is your pay before taxes and deductions. That is the figure lenders use when they calculate your DTI, so it keeps your number comparable to what underwriters will see.",
  },
];

export default async function DebtToIncomeCalculatorPage() {
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
    "⚖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Debt to Income Ratio Calculator",
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
      title="Debt to Income Ratio Calculator"
      intro="Find your DTI by comparing monthly debt payments to gross monthly income, and see how a lender would rate it. Enter your numbers and press Calculate."
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
            { name: "Debt to Income Ratio Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Debt to Income Ratio Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DebtToIncomeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the DTI calculation works</H2>
            <P>
              Your debt to income ratio is simple division. Add up every required monthly debt
              payment, including your rent or mortgage, car payments, credit card minimums and any
              loans. Divide that total by your gross monthly income, the amount you earn before tax,
              then multiply by 100 to get a percent.
            </P>
            <P>
              Lenders read the result quickly. A lower ratio means more of your income is free, so
              you can absorb a new payment without strain. A higher ratio signals that your budget is
              already stretched, which makes approval harder and rates less favorable.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn $6,000 a month before tax and pay $1,600 for housing, $400 on a car,
              $150 in card minimums and $300 on a student loan. That is $2,450 in debt, so your DTI
              is 2,450 / 6,000 = about 41%. The housing-only front-end ratio is 1,600 / 6,000, or
              roughly 27%.
            </P>

            <H2>How to lower your DTI</H2>
            <P>
              You can improve the ratio two ways: reduce debt or raise income. Paying off a small
              balance removes its whole payment from the top of the fraction. Our{" "}
              <Link href="/calculators/debt-snowball-calculator" className="text-orange-600 underline">debt snowball calculator</Link>{" "}
              can help you plan that. For lender standards and your rights, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a trustworthy reference.
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
