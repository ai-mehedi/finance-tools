import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TermInsuranceCalculator from "./TermInsuranceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/term-insurance-calculator";
const SELF_SLUG = "term-insurance-calculator";

const DESC =
  "Free term insurance calculator. Work out how much term life cover your family needs using income replacement, debts, mortgage and education costs, then see an indicative premium and a need-over-time chart.";

const baseMetadata: Metadata = {
  title: "Term Insurance Calculator",
  description: DESC,
  keywords: [
    "term insurance calculator",
    "life insurance needs calculator",
    "how much life insurance do I need",
    "term life cover calculator",
    "DIME insurance calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Term Insurance Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Term Insurance Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much term insurance do I actually need?",
    answer:
      "A common starting point is the DIME method: add up Debts, Income to replace, Mortgage and Education costs, then subtract money your family already has, such as existing cover and savings. The result is the gap a term policy should fill. This calculator runs that math for you and lets you tune how many years of income to replace.",
  },
  {
    question: "Why is term insurance so much cheaper than whole life?",
    answer:
      "Term insurance is pure protection. It pays only if you die within the chosen period and builds no cash value, so almost all of your premium goes toward the death benefit. Whole life bundles in a savings component and lifelong cover, which is why it can cost five to ten times more for the same payout.",
  },
  {
    question: "How long should my term length be?",
    answer:
      "Match the term to the years your family relies on your income. Many people pick a length that carries them until the mortgage is paid and the children are independent, often twenty or thirty years. A longer term locks in cover for more years but costs more per year, which the premium estimate here reflects.",
  },
  {
    question: "How accurate is the premium estimate?",
    answer:
      "Treat it as a ballpark, not a quote. The figure uses average non-smoker rates by age band and term length to give an order of magnitude. Your real premium depends on health, smoking status, family history and the insurer, so always compare actual quotes before you buy.",
  },
];

export default async function TermInsuranceCalculatorPage() {
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
    name: "Term Insurance Calculator",
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
      title="Term Insurance Calculator"
      intro="Find the right amount of term life cover for your family. Enter your income, debts, mortgage and the savings already in place, then press Calculate to see your cover gap and an indicative premium."
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
            { name: "Term Insurance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Term Insurance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TermInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the term insurance calculator works</H2>
            <P>
              The goal of life insurance is to leave your family financially whole if your income
              suddenly stops. This tool sizes that gap by adding the big costs your payout would need
              to cover: several years of replacement income, the mortgage, any other debts, a fund for
              your children's education and immediate final expenses. It then subtracts what your
              family already holds, such as existing policies and liquid savings.
            </P>
            <P>
              The chart traces how the need shrinks over the term. Each year that passes is one fewer
              year of income to replace, so the curve slopes down, which is one reason a fixed level
              term often provides more cover than a household strictly needs in its final years.
            </P>

            <H2>A worked example</H2>
            <P>
              A 35 year old earning 70,000 dollars wants 15 years of income replaced. That is 1.05
              million dollars, plus a 220,000 dollar mortgage, 20,000 dollars of other debt, 100,000
              dollars for education and 15,000 dollars of final expenses, for roughly 1.4 million
              dollars of gross need. Subtract a 50,000 dollar existing policy and 40,000 dollars of
              savings and the recommended new cover lands near 1.3 million dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The income-replacement multiplier is a judgement call: replacing more years buys more
              security but costs more in premium. Remember too that a payout invested can earn returns,
              so the raw sum may overstate the need slightly. For an independent primer on choosing
              cover, see the{" "}
              <a href="https://www.naic.org" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">NAIC</a>.
              To weigh term against a cash-value policy, try our{" "}
              <Link href="/calculators/term-vs-whole-life-calculator" className="text-orange-600 underline">term vs whole life calculator</Link>.
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
