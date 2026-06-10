import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CapitalGainsTaxCalculator from "./CapitalGainsTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/capital-gains-tax-calculator";
const SELF_SLUG = "capital-gains-tax-calculator";

const DESC =
  "Free capital gains tax calculator. Estimate US federal tax on a profitable sale, comparing short-term ordinary rates with long-term 0, 15 and 20 percent rates plus the 3.8 percent net investment income tax.";

export const metadata: Metadata = {
  title: "Capital Gains Tax Calculator",
  description: DESC,
  keywords: [
    "capital gains tax calculator",
    "long term capital gains tax",
    "short term capital gains",
    "investment tax calculator",
    "stock sale tax estimator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Capital Gains Tax Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Capital Gains Tax Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the difference between short-term and long-term gains?",
    answer:
      "A short-term gain comes from an asset you held one year or less, and it is taxed at your ordinary income rates. A long-term gain comes from an asset held more than a year, and it gets the lower 0, 15 or 20 percent rates. Holding for just over a year can sharply cut the bill.",
  },
  {
    question: "How are long-term capital gains rates decided?",
    answer:
      "Long-term rates depend on your total taxable income, not the gain alone. The gain stacks on top of your other income, so the first dollars may fall in the 0 percent band, the next in the 15 percent band, and the highest dollars in the 20 percent band, all based on income breakpoints for your filing status.",
  },
  {
    question: "What is the net investment income tax?",
    answer:
      "The net investment income tax is an extra 3.8 percent that applies to investment income, including capital gains, once your modified adjusted gross income passes a threshold of 200,000 dollars for single filers or 250,000 dollars for joint filers. It is charged on the smaller of the gain and the amount over the threshold.",
  },
  {
    question: "Does this calculator include state taxes?",
    answer:
      "No. This tool estimates only US federal capital gains tax and the net investment income tax. Many states tax capital gains as ordinary income, so your real total may be higher. Treat the result as an estimate and confirm specifics with a tax professional.",
  },
];

export default async function CapitalGainsTaxCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Capital Gains Tax Calculator",
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
      title="Capital Gains Tax Calculator"
      intro="See what you might owe when you sell an investment for a profit. Enter your cost basis, sale price, other income and holding period, then press Calculate to estimate the federal tax."
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
            { name: "Capital Gains Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Capital Gains Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CapitalGainsTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the capital gains tax calculator works</H2>
            <P>
              The tool starts with your gain, which is the sale price minus the price you originally
              paid, known as your cost basis. If the result is negative you have a loss and owe no
              capital gains tax. If it is positive, the way it is taxed depends entirely on how long
              you held the asset.
            </P>
            <P>
              For a long-term gain the calculator stacks the gain on top of your other taxable income
              and fills the 0, 15 and 20 percent rate bands in order. For a short-term gain it instead
              measures how much extra ordinary income tax the gain adds at your marginal rates. The
              chart shows exactly how many dollars land in each band.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you bought stock for 20,000 dollars, sold it for 50,000 dollars after three
              years, and have 90,000 dollars of other income as a single filer. The 30,000 dollar
              long-term gain sits above your income, so most of it is taxed at 15 percent, giving
              roughly 4,500 dollars of tax. Because your income stays under the threshold, no net
              investment income tax applies here.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Brackets and thresholds change each year and vary by filing status, so the figures here
              are estimates based on recent federal numbers. State taxes are not included. For the
              official rules straight from the source, see the{" "}
              <a href="https://www.irs.gov/taxtopics/tc409" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS guide to capital gains</a>.
              If you are reinvesting the proceeds, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              can project how the after-tax amount might grow.
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
