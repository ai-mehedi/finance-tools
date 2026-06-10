import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import EstateTaxCalculator from "./EstateTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/estate-tax-calculator";
const SELF_SLUG = "estate-tax-calculator";

const DESC =
  "Free estate tax calculator. Estimate federal estate tax from your gross estate, deductions and the lifetime exclusion, with a breakdown of what is taxable and what passes to heirs.";

const baseMetadata: Metadata = {
  title: "Estate Tax Calculator",
  description: DESC,
  keywords: [
    "estate tax calculator",
    "federal estate tax",
    "death tax calculator",
    "lifetime exclusion",
    "inheritance tax estimate",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Estate Tax Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Estate Tax Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is federal estate tax calculated?",
    answer:
      "You start with the gross estate, subtract deductions such as debts, funeral and administration expenses, charitable gifts and anything left to a spouse, to reach the taxable estate. Only the portion of the taxable estate above the lifetime exclusion is taxed, at the top federal rate of about 40 percent.",
  },
  {
    question: "What is the lifetime exclusion?",
    answer:
      "The lifetime exclusion is the amount each person can pass on free of federal estate tax. Estates valued below the exclusion owe no federal estate tax at all. The figure is set by law and changes over time, so the calculator lets you enter the exclusion that applies to your situation.",
  },
  {
    question: "Does money left to a spouse or charity get taxed?",
    answer:
      "Generally no. The unlimited marital deduction lets you pass any amount to a surviving spouse free of estate tax, and gifts to qualified charities are fully deductible. Entering those amounts in the calculator removes them from the taxable estate before the tax is figured.",
  },
  {
    question: "Is this the same as inheritance tax?",
    answer:
      "Not quite. Estate tax is paid by the estate before assets are distributed, based on the total value of what the person left. Inheritance tax, where it exists, is paid by the people who receive the assets. This tool estimates federal estate tax and does not cover state-level inheritance taxes.",
  },
];

export default async function EstateTaxCalculatorPage() {
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
    "🏛️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Estate Tax Calculator",
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
      title="Estate Tax Calculator"
      intro="Estimate the federal estate tax an estate might owe. Enter the gross value, deductions and the lifetime exclusion, then press Calculate to see what is taxable and what reaches your heirs."
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
            { name: "Estate Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Estate Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EstateTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the estate tax calculator works</H2>
            <P>
              Federal estate tax is not charged on the whole value of an estate. The calculator first
              finds the taxable estate by taking the gross value and removing deductions: outstanding
              debts and settlement expenses, gifts to charity, and anything passing to a surviving
              spouse. It then shelters the next slice of value with the lifetime exclusion. Only what
              remains above the exclusion is taxed.
            </P>
            <P>
              The bar and breakdown make the structure visible. One band is the value protected by
              deductions, another is the slice covered by the exclusion, and the final band is the
              taxable amount that drives the bill. Because the tax applies only to that last band,
              modest changes to deductions can swing the result sharply.
            </P>

            <H2>A quick example</H2>
            <P>
              Imagine a 20 million dollar gross estate with 500,000 in debts and expenses and a 1
              million dollar charitable bequest. Deductions of 1.5 million leave a taxable estate of
              18.5 million. With a 13.99 million dollar exclusion, about 4.51 million is exposed. At a
              40 percent rate the estate owes roughly 1.8 million dollars, an effective rate near 9
              percent of the gross estate.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a planning estimate that applies a single top rate and ignores prior taxable
              gifts, portability of a spouse's unused exclusion and state estate taxes. Rules and the
              exclusion amount change, so confirm current figures with the{" "}
              <a href="https://www.irs.gov/businesses/small-businesses-self-employed/estate-tax" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS estate tax page</a>{" "}
              and a qualified advisor. To gauge what heirs might keep after income taxes on inherited
              gains, pair this with our{" "}
              <Link href="/calculators/capital-gains-tax-calculator" className="text-orange-600 underline">capital gains tax calculator</Link>.
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
