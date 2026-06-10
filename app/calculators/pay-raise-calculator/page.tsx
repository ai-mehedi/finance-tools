import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PayRaiseCalculator from "./PayRaiseCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/pay-raise-calculator";
const SELF_SLUG = "pay-raise-calculator";

const DESC =
  "Free pay raise calculator. Turn a percentage or flat raise into your new hourly, monthly and annual pay, see the dollar increase, and check the real gain after inflation with a multi-year projection chart.";

const baseMetadata: Metadata = {
  title: "Pay Raise Calculator",
  description: DESC,
  keywords: [
    "pay raise calculator",
    "salary increase calculator",
    "raise percentage calculator",
    "new salary after raise",
    "real pay raise after inflation",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Pay Raise Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Pay Raise Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How do I calculate the percentage of a pay raise?",
    answer:
      "Subtract your old pay from your new pay to get the increase, divide that increase by your old pay, and multiply by one hundred. For example, going from fifty thousand to fifty two thousand five hundred is an increase of two thousand five hundred, which divided by fifty thousand and multiplied by one hundred is a five percent raise.",
  },
  {
    question: "What is a real, or inflation-adjusted, raise?",
    answer:
      "Your nominal raise is the headline percentage your employer gives you. The real raise subtracts inflation to show how much your purchasing power actually grew. If you receive a four percent raise in a year when prices rise three percent, your real raise is only about one percent, which is what really matters for your standard of living.",
  },
  {
    question: "How does a raise convert between hourly and annual pay?",
    answer:
      "This calculator scales every pay basis to a yearly figure first. It assumes forty hours a week for fifty two weeks, so two thousand eighty hours a year for hourly pay, fifty two weekly periods, twenty six biweekly periods, and twelve monthly periods. A raise applied to one basis therefore shows up consistently across all of them.",
  },
  {
    question: "Why does the chart project several years of pay?",
    answer:
      "The projection assumes the same percentage raise repeats each year and compounds, so you can see how even a modest annual increase builds over time. It is an illustration rather than a guarantee, since future raises depend on performance, the labor market and your employer's budget.",
  },
];

export default async function PayRaiseCalculatorPage() {
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
    name: "Pay Raise Calculator",
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
      title="Pay Raise Calculator"
      intro="Find out what a raise really means for your paycheck. Enter your current pay, the size of the raise, and inflation, then press Calculate to see your new pay across every pay basis."
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
            { name: "Pay Raise Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Pay Raise Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PayRaiseCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the pay raise calculator works</H2>
            <P>
              A raise can be quoted as a percentage or as a flat dollar amount, and on any pay basis
              from hourly to annual. This tool accepts whichever form your offer uses, computes your
              new pay, and converts both the old and new figures into a yearly salary so you can
              compare them on equal footing. It also reports the exact percentage increase whenever
              you enter a flat amount.
            </P>
            <P>
              Because raises are easy to overstate, the tool also subtracts inflation. The real raise
              line tells you whether your new pay genuinely buys more than before, and the chart
              projects your salary forward assuming the same raise repeats and compounds each year.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you earn $65,000 a year and receive a five percent raise while inflation runs at
              three percent. Your new salary is $68,250, an increase of $3,250. After accounting for
              rising prices, though, the real value of your pay only grew by about two percent, so
              roughly $1,300 of that increase simply kept pace with inflation rather than making you
              better off.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The result is your gross pay before taxes and deductions, so your take-home increase
              will be smaller than the headline number. For current inflation figures to plug in, see
              the{" "}
              <a href="https://www.bls.gov/cpi/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Bureau of Labor Statistics CPI data</a>.
              To see how the raise changes your actual paycheck after withholding, follow up with our{" "}
              <Link href="/calculators/take-home-pay-calculator" className="text-orange-600 underline">take-home pay calculator</Link>.
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
