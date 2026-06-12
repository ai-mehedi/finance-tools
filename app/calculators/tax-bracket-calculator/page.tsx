import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TaxBracketCalculator from "./TaxBracketCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/tax-bracket-calculator";
const SELF_SLUG = "tax-bracket-calculator";

const DESC =
  "Free tax bracket calculator. See which 2024 federal tax brackets your income falls into, the tax owed in each band, and your marginal versus effective tax rate, with a bracket chart.";

const baseMetadata: Metadata = {
  title: "Tax Bracket Calculator",
  description: DESC,
  keywords: [
    "tax bracket calculator",
    "federal tax brackets 2024",
    "marginal tax rate",
    "effective tax rate",
    "income tax bracket calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Tax Bracket Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Tax Bracket Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a tax bracket?",
    answer:
      "A tax bracket is a slice of income taxed at a specific rate. The federal system is progressive, so your first dollars are taxed at the lowest rate and only the income above each threshold is taxed at the next higher rate.",
  },
  {
    question: "Does being in the 24 percent bracket mean all my income is taxed at 24 percent?",
    answer:
      "No. Only the portion of taxable income that lands inside the 24 percent band is taxed at that rate. Everything below it is taxed at the lower bracket rates, which is why your effective rate is always lower than your top bracket.",
  },
  {
    question: "What is the difference between marginal and effective tax rate?",
    answer:
      "Your marginal rate is the rate on your last dollar of income, the top bracket you reach. Your effective rate is total tax divided by total taxable income, a blended average across every bracket your income passes through.",
  },
  {
    question: "What income should I enter in this calculator?",
    answer:
      "Enter your taxable income, which is your gross income minus the standard deduction or your itemized deductions and any above-the-line adjustments. The brackets in this tool apply to taxable income, not to gross salary.",
  },
];

export default async function TaxBracketCalculatorPage() {
  const [{ data: tools }, { data: articles }, self] = await Promise.all([
    getTools({ type: "calculator", limit: 7 }),
    getArticles({ limit: 4 }),
    getToolBySlug(SELF_SLUG),
  ]);
  const relatedTools = tools.filter((t) => t.slug !== SELF_SLUG).slice(0, 6);

  const icon = self?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={self.thumbnail} alt="" referrerPolicy="no-referrer" decoding="async" className="h-full w-full object-contain p-1" />
  ) : (
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Tax Bracket Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Tax Bracket Calculator"
      intro="See exactly how the progressive tax system treats your income. Enter your taxable income and filing status, then press Calculate to break the tax down bracket by bracket."
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
            { name: "Tax Bracket Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Tax Bracket Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaxBracketCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the tax bracket calculator works</H2>
            <P>
              Federal income tax is progressive, which means your income is sliced into bands and each
              band is taxed at its own rate. The tool fills the lowest bracket first, then pours the
              remaining income into the next band, and so on. It adds the tax from each band to find
              your total bill, then reports the rate on your last dollar and your blended average rate.
            </P>
            <P>
              The horizontal chart shows how much of your income lands in each bracket and how much tax
              that band produces. The darker bar marks your marginal band, the highest rate your income
              actually reaches.
            </P>

            <H2>A quick example</H2>
            <P>
              A single filer with $85,000 of taxable income pays 10 percent on the first $11,600, 12
              percent on the next chunk up to $47,150, and 22 percent on the rest. The result is a
              marginal rate of 22 percent but an effective rate closer to 15 percent, because most of
              the income was taxed in the lower bands.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This tool uses 2024 federal brackets only and assumes you have already subtracted your
              deductions. It does not include state tax, credits or the alternative minimum tax. For
              the official thresholds, see the{" "}
              <a href="https://www.irs.gov/filing/federal-income-tax-rates-and-brackets" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS tax rates and brackets page</a>.
              To turn this into a paycheck figure, pair it with our{" "}
              <Link href="/calculators/take-home-pay-calculator" className="text-orange-600 underline">take home pay calculator</Link>.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40">
                    <span className="text-sm font-bold text-zinc-900">{a.title}</span>
                  </Link>
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
