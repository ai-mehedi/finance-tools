import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LifeInsuranceCalculator from "./LifeInsuranceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/life-insurance-calculator";
const SELF_SLUG = "life-insurance-calculator";

const DESC =
  "Free life insurance calculator. Estimate how much coverage you need using the DIME method: debt, income replacement, mortgage and education, less your assets.";

export const metadata: Metadata = {
  title: "Life Insurance Calculator",
  description: DESC,
  keywords: [
    "life insurance calculator",
    "how much life insurance do i need",
    "life insurance coverage calculator",
    "DIME method calculator",
    "life insurance needs calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Life Insurance Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Life Insurance Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How much life insurance do I need?",
    answer:
      "A common starting point is the DIME method, which adds your Debts, an Income replacement amount, your Mortgage and future Education costs, then subtracts savings and any coverage you already have. The remaining figure is a reasonable coverage target.",
  },
  {
    question: "How many years of income should I replace?",
    answer:
      "Many families choose enough to support dependents until children are grown or a spouse can rely on their own income, often 10 to 20 years. Replace fewer years if your partner earns well, more if your household depends heavily on one income.",
  },
  {
    question: "Should I subtract my savings?",
    answer:
      "Yes. Liquid savings, investments and existing policies all reduce the gap insurance needs to fill. Subtracting them avoids over-insuring and keeps your premiums lower while still protecting your family.",
  },
  {
    question: "Is term or whole life better?",
    answer:
      "Term life covers a set period at a low cost and suits most families covering income and a mortgage. Whole life lasts for life and builds cash value but costs much more. This calculator estimates the coverage amount, not the policy type.",
  },
];

export default async function LifeInsuranceCalculatorPage() {
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
    "🛡️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Life Insurance Calculator",
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
      title="Life Insurance Calculator"
      intro="Estimate how much life insurance coverage your family needs using the DIME method. Enter your income, debts and savings, then press Calculate."
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
            { name: "Life Insurance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Life Insurance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LifeInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the life insurance calculator works</H2>
            <P>
              Life insurance exists to replace the financial support you provide. This calculator uses
              the DIME method, a widely taught framework that totals four needs: Debt, Income
              replacement, Mortgage and Education. From that sum it subtracts the savings and coverage
              you already hold, leaving the gap a new policy would fill.
            </P>
            <P>
              Income replacement is usually the largest piece. It is your annual income multiplied by the
              number of years you want to support your family. The chart breaks each component apart so
              you can see what is driving the recommended coverage.
            </P>

            <H2>A quick example</H2>
            <P>
              A parent earning $70,000 who wants 10 years of income replacement has a $700,000 income
              need. Add a $220,000 mortgage, $20,000 of other debt, $100,000 for education and $15,000 of
              final expenses for a total of $1.055 million. Subtract $100,000 of savings and existing
              coverage and the target is about $955,000.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a planning estimate, not advice tailored to your situation. Your real number
              depends on health, family structure and goals. For consumer basics on choosing a policy,
              the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. Explore more with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>.
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
