import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DebtSnowballCalculator from "./DebtSnowballCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/debt-snowball-calculator";
const SELF_SLUG = "debt-snowball-calculator";

const DESC =
  "Free debt snowball calculator. See how fast you can become debt free by paying off the smallest balance first, then rolling each payment into the next debt.";

const baseMetadata: Metadata = {
  title: "Debt Snowball Calculator",
  description: DESC,
  keywords: [
    "debt snowball calculator",
    "snowball method calculator",
    "debt payoff calculator",
    "pay off debt fast",
    "debt free calculator",
    "debt elimination calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Debt Snowball Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Debt Snowball Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does the debt snowball method work?",
    answer:
      "You make the minimum payment on every debt, then put all your spare cash toward the debt with the smallest balance. Once that debt is gone, you roll its old payment onto the next smallest balance. The amount you attack each debt with snowballs larger as you go.",
  },
  {
    question: "Is the snowball method better than the avalanche method?",
    answer:
      "The avalanche method targets the highest interest rate first, so it usually saves a little more money. The snowball targets the smallest balance first, which clears whole debts quickly and gives you early wins. Many people stick with the snowball because the motivation keeps them going.",
  },
  {
    question: "Does the order of my debts matter?",
    answer:
      "Yes. The snowball always pays the smallest balance first, regardless of interest rate. This calculator sorts your debts by balance automatically and shows the month each one is cleared.",
  },
  {
    question: "What if I cannot afford any extra payment?",
    answer:
      "The method still works with no extra payment because cleared debts free up their minimums for the next debt. Adding even a small extra amount each month, though, shortens the timeline and cuts total interest noticeably.",
  },
];

export default async function DebtSnowballCalculatorPage() {
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
    "⛄"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Debt Snowball Calculator",
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
      title="Debt Snowball Calculator"
      intro="See how fast you can become debt free with the snowball method. List your debts and an extra monthly amount, then press Calculate to watch the balance fall."
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
            { name: "Debt Snowball Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Debt Snowball Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DebtSnowballCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the debt snowball works</H2>
            <P>
              The snowball method is about momentum. You keep paying the minimum on every debt so
              nothing falls behind, then you throw every spare dollar at the debt with the smallest
              balance. That debt disappears first, often within a few months, which gives you a real
              win to build on.
            </P>
            <P>
              When the smallest debt is gone, its payment does not vanish. You add it to what you were
              already paying on the next smallest balance. Each cleared debt makes the next attack
              bigger, so the payoff speeds up as you go. That growing payment is the snowball.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you owe $1,200 on a card, $8,000 on a car and $15,000 on a student loan, with $200
              extra each month. The card clears first in a few months, then its payment plus the
              extra rolls onto the car loan, then everything rolls onto the student loan. The chart
              above shows the total balance dropping faster and faster.
            </P>

            <H2>Snowball vs avalanche</H2>
            <P>
              The avalanche method pays the highest interest rate first and usually saves slightly
              more in total interest. The snowball pays the smallest balance first and wins on
              motivation. If you want to compare the math, also try our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other debt calculators</Link>.
              For unbiased guidance on getting out of debt, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
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
