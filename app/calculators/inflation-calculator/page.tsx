import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import InflationCalculator from "./InflationCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/inflation-calculator";
const SELF_SLUG = "inflation-calculator";

const DESC =
  "Free inflation calculator. See how inflation erodes the buying power of your money over time and what today's amount will be worth in the future.";

const baseMetadata: Metadata = {
  title: "Inflation Calculator",
  description: DESC,
  keywords: [
    "inflation calculator",
    "buying power calculator",
    "purchasing power calculator",
    "future value of money calculator",
    "inflation rate calculator",
    "cost of living calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Inflation Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Inflation Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does inflation affect my money?",
    answer:
      "Inflation raises the general level of prices, so a fixed amount of cash buys less each year. If prices rise 3% a year, something that costs $100 today costs $103 next year, which means the same $100 now buys slightly less.",
  },
  {
    question: "What inflation rate should I use?",
    answer:
      "A long run average of around 2% to 3% a year is common for the United States, in line with the Federal Reserve target and historical Consumer Price Index data. For specific planning you can use the actual published rate for a period or a rate that matches your own spending.",
  },
  {
    question: "What is the difference between future cost and buying power?",
    answer:
      "Future cost is what today's basket of goods will cost later, found with FV = PV times (1 + i) to the power of t. Buying power is what today's fixed amount of money will be worth later, found by dividing by the same factor. One rises while the other falls.",
  },
  {
    question: "How can I protect savings from inflation?",
    answer:
      "Holding cash alone tends to lose value over time. Many people invest in assets that have historically grown faster than inflation, such as diversified stocks, or use inflation linked bonds. Always weigh the added risk against your own goals.",
  },
];

export default async function InflationCalculatorPage() {
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
    "📉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Inflation Calculator",
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
      title="Inflation Calculator"
      intro="See how inflation chips away at the value of your money over time. Enter an amount, an average inflation rate and a number of years, then press Calculate."
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
            { name: "Inflation Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Inflation Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InflationCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the inflation calculator works</H2>
            <P>
              Inflation measures how fast prices rise across the economy. As prices climb, each
              dollar buys a little less, so the real value of money held as cash slowly falls. This
              tool shows both sides of that story: what today's basket of goods will cost later, and
              what today's money will actually be worth later.
            </P>
            <P>
              The future cost uses FV = PV times (1 + i) to the power of t, where i is the annual
              inflation rate and t is the number of years. Buying power is the mirror image, found by
              dividing today's amount by that same growth factor. The chart above plots both lines so
              the widening gap is easy to see.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you keep $10,000 in cash and inflation averages 3% a year. After 20 years that
              cash still reads $10,000, but it only buys about $5,537 worth of goods in today's terms.
              Meanwhile the things that cost $10,000 today would cost roughly $18,061. That gap is the
              hidden cost of holding cash for a long time.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Inflation is an average, and your personal rate depends on what you buy. For official
              figures, the{" "}
              <a href="https://www.bls.gov/cpi/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Bureau of Labor Statistics</a>{" "}
              publishes the Consumer Price Index. To see how investing can outpace inflation, try our{" "}
              <Link href="/calculators/compound-interest-calculator" className="text-orange-600 underline">compound interest calculator</Link>.
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
