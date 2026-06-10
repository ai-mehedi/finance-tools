import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import EffectiveTaxRateCalculator from "./EffectiveTaxRateCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/effective-tax-rate-calculator";
const SELF_SLUG = "effective-tax-rate-calculator";

const DESC =
  "Free effective tax rate calculator. Divide your total tax by your total income to find the real share of income you pay, plus your take-home rate.";

const baseMetadata: Metadata = {
  title: "Effective Tax Rate Calculator",
  description: DESC,
  keywords: [
    "effective tax rate calculator",
    "average tax rate calculator",
    "effective tax rate formula",
    "take home pay rate",
    "income tax rate calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Effective Tax Rate Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Effective Tax Rate Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is an effective tax rate?",
    answer:
      "Your effective tax rate is the share of your total income that you actually pay in tax. It is found by dividing total tax by total income. Because lower brackets tax your early income at lower rates, the effective rate is usually below your top bracket rate.",
  },
  {
    question: "How is it different from the marginal tax rate?",
    answer:
      "The marginal rate is the rate applied to your last dollar of income, which is your top tax bracket. The effective rate blends every bracket together across all of your income, so it is a better measure of your overall tax burden.",
  },
  {
    question: "Should I use gross or taxable income?",
    answer:
      "Both are valid, but be consistent. Dividing tax by taxable income shows the rate on what was actually taxed, while dividing by gross income shows the rate against everything you earned. Pick one and use it for every comparison.",
  },
  {
    question: "Why is my effective rate lower than my bracket?",
    answer:
      "Tax systems are progressive, so only the income inside each bracket is taxed at that bracket's rate. Deductions and credits lower the tax further. The result is an average rate that sits below the top bracket you reach.",
  },
];

export default async function EffectiveTaxRateCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Effective Tax Rate Calculator",
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
      title="Effective Tax Rate Calculator"
      intro="Find the real share of your income that goes to tax by dividing total tax by total income. Enter your numbers and press Calculate."
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
            { name: "Effective Tax Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Effective Tax Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EffectiveTaxRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the effective tax rate works</H2>
            <P>
              Your effective tax rate answers a simple question: of every dollar you earned, how many
              cents went to tax? You divide the total tax you paid by your total income and multiply by
              100. The leftover share is your take-home rate, the part you actually keep.
            </P>
            <P>
              This single number is more useful than your tax bracket for budgeting, because it
              reflects how the whole progressive system, plus your deductions and credits, applied to
              all of your income rather than just the last dollar.
            </P>

            <H2>A quick example</H2>
            <P>
              If you earned $85,000 and paid $14,500 in tax, your effective rate is 14,500 ÷ 85,000,
              which is about 17.1%. You keep the remaining 82.9%, or $70,500. Even if your top bracket
              were 22%, your effective rate stays well below it.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Make sure your income and tax figures cover the same period and the same definition of
              income. For current brackets, deductions and credits, the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Internal Revenue Service</a>{" "}
              is the authoritative source. Estimate your full picture with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>.
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
