import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DividendTaxCalculator from "./DividendTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/dividend-tax-calculator";
const SELF_SLUG = "dividend-tax-calculator";

const DESC =
  "Free dividend tax calculator. Estimate the US federal tax on qualified and ordinary dividends and see how much income you keep after tax.";

const baseMetadata: Metadata = {
  title: "Dividend Tax Calculator",
  description: DESC,
  keywords: [
    "dividend tax calculator",
    "qualified dividend tax calculator",
    "dividend tax rate calculator",
    "ordinary dividend tax",
    "after tax dividend calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Dividend Tax Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Dividend Tax Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How are qualified dividends taxed?",
    answer:
      "Qualified dividends are taxed at the long-term capital gains rates of 0%, 15% or 20%, based on your taxable income and filing status. To qualify, the payer must be a US or qualifying foreign company and you must hold the shares for a minimum period around the ex-dividend date.",
  },
  {
    question: "How are ordinary dividends taxed?",
    answer:
      "Ordinary, or non-qualified, dividends are taxed at your regular marginal income tax rate, the same as wages. They include dividends from REITs, money market funds and shares held for too short a period to qualify.",
  },
  {
    question: "What is the difference between qualified and ordinary dividends?",
    answer:
      "It comes down to the tax rate. Qualified dividends get the lower capital gains rates, while ordinary dividends are taxed as regular income. Your broker reports both figures on Form 1099-DIV, so you can see how much of your total falls into each bucket.",
  },
  {
    question: "Does this include state tax or the net investment income tax?",
    answer:
      "No. This calculator estimates federal income tax only. Many states tax dividends as well, and high earners may owe an additional 3.8% net investment income tax. Treat the result as a starting point and confirm with a tax professional.",
  },
];

export default async function DividendTaxCalculatorPage() {
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
    name: "Dividend Tax Calculator",
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
      title="Dividend Tax Calculator"
      intro="Estimate the federal tax on your qualified or ordinary dividends and see how much you keep. Enter your numbers and press Calculate."
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
            { name: "Dividend Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Dividend Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DividendTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How dividend tax works</H2>
            <P>
              The tax you owe on dividends depends on whether they are qualified or ordinary. Qualified
              dividends use the long-term capital gains brackets, so the calculator checks your taxable
              income and filing status to pick the 0%, 15% or 20% rate. Ordinary dividends are taxed at
              your regular marginal rate, which you enter directly.
            </P>
            <P>
              The bar chart splits your dividend into the part you keep and the part that goes to tax,
              making the bite easy to see at a glance.
            </P>

            <H2>A quick example</H2>
            <P>
              A single filer with $80,000 of taxable income receives $5,000 in qualified dividends.
              That income sits in the 15% bracket, so the tax is $750 and you keep $4,250. If the same
              dividends were ordinary and taxed at a 22% marginal rate, the tax would be $1,100 and you
              would keep $3,900.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Holding dividend payers in a retirement account can defer or avoid this tax entirely.
              Rates and brackets change each year, so confirm current figures with the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Internal Revenue Service</a>.
              To project the dividends themselves, try our{" "}
              <Link href="/calculators/dividend-calculator" className="text-orange-600 underline">dividend calculator</Link>.
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
