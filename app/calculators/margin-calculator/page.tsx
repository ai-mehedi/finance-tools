import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MarginCalculator from "./MarginCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/margin-calculator";
const SELF_SLUG = "margin-calculator";

const DESC =
  "Free margin calculator. Enter your cost and selling price, or a target margin, to find gross profit, gross margin percent and the equivalent markup, with a clear price-split chart.";

export const metadata: Metadata = {
  title: "Margin Calculator",
  description: DESC,
  keywords: [
    "margin calculator",
    "gross margin calculator",
    "profit margin calculator",
    "margin vs markup",
    "selling price calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Margin Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Margin Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is gross margin?",
    answer:
      "Gross margin is profit measured as a share of the selling price. If you sell an item for 100 dollars and it cost you 60 dollars, your gross profit is 40 dollars and your gross margin is 40 percent. It tells you how much of every dollar of revenue you keep before other expenses.",
  },
  {
    question: "How do I calculate margin from cost and price?",
    answer:
      "Subtract the cost from the selling price to get gross profit, then divide that profit by the selling price and multiply by 100. In short, margin percent equals selling price minus cost, divided by selling price, times 100.",
  },
  {
    question: "What is the difference between margin and markup?",
    answer:
      "Both describe the same profit, but against a different base. Margin divides profit by the selling price, while markup divides the same profit by the cost. Because the price is always larger than the cost, the margin percent is always smaller than the markup percent for the same item.",
  },
  {
    question: "How do I set a price to hit a target margin?",
    answer:
      "Switch the tool to the target margin mode and enter your cost and the margin you want. The price is found by dividing the cost by one minus the margin written as a decimal. For a 40 percent margin on a 60 dollar cost, the price is 60 divided by 0.6, which is 100 dollars.",
  },
];

export default async function MarginCalculatorPage() {
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
    name: "Margin Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Margin Calculator"
      intro="Work out your gross profit margin in seconds. Enter a cost and selling price, or a cost and target margin, then press Calculate to see profit, margin percent and the equivalent markup."
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
            { name: "Margin Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Margin Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarginCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the margin calculator works</H2>
            <P>
              Gross margin shows how much of each sale you keep after paying for the goods themselves.
              The tool takes your cost and selling price, subtracts one from the other to find the
              gross profit, and then expresses that profit as a percentage of the price. The donut
              shows how the price splits between cost and profit at a glance.
            </P>
            <P>
              Prefer to price from a goal instead? Switch to the target margin mode and the calculator
              runs the math backward, telling you the exact selling price needed to lock in the margin
              you want on a given cost.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a product costs you 60 dollars and you sell it for 100 dollars. Your gross profit
              is 40 dollars, your gross margin is 40 percent, and the equivalent markup on cost is about
              67 percent. The same 40 dollars of profit looks larger as a markup because it is compared
              to the smaller cost figure rather than the price.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Gross margin only covers the cost of the goods, not rent, payroll, shipping or marketing,
              so a healthy gross margin can still leave a thin net profit. For a wider view of profit
              measures, the U.S. Small Business Administration has helpful guidance at{" "}
              <a href="https://www.sba.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SBA.gov</a>.
              To see the same profit from the cost side, try our{" "}
              <Link href="/calculators/markup-calculator" className="text-orange-600 underline">markup calculator</Link>.
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>}
                    </div>
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
                    <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
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
