import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ExpenseRatioCalculator from "./ExpenseRatioCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/expense-ratio-calculator";
const SELF_SLUG = "expense-ratio-calculator";

const DESC =
  "Free expense ratio calculator. See how much a fund's annual expense ratio really costs you over time, and how much larger your balance would be with a lower fee.";

const baseMetadata: Metadata = {
  title: "Expense Ratio Calculator",
  description: DESC,
  keywords: [
    "expense ratio calculator",
    "fund fee calculator",
    "mutual fund expense ratio",
    "etf expense ratio",
    "investment fee impact calculator",
    "expense ratio cost",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Expense Ratio Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Expense Ratio Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is an expense ratio?",
    answer:
      "An expense ratio is the annual fee a mutual fund or ETF charges, shown as a percentage of the money you have invested. A 0.50% ratio means you pay $5 a year for every $1,000 invested. It is deducted from the fund's assets automatically, so you never see a separate bill.",
  },
  {
    question: "Why does a small fee matter so much?",
    answer:
      "Because the fee is charged every year and reduces the balance that compounds. A 0.75% ratio instead of 0.10% might cost only a few dollars at first, but over 30 years the forgone growth can add up to tens of thousands of dollars on a large portfolio.",
  },
  {
    question: "What is a good expense ratio?",
    answer:
      "Broad index funds and ETFs often charge between 0.03% and 0.20%. Actively managed funds tend to charge 0.50% to 1.00% or more. Lower is generally better, since fees are one of the few costs you can control with certainty.",
  },
  {
    question: "Is the expense ratio the only fee I pay?",
    answer:
      "No. Some funds also charge sales loads, redemption fees or trading costs, and your brokerage may add account or transaction fees. The expense ratio is the largest recurring cost for most index investors, but always read the full fee disclosure.",
  },
];

export default async function ExpenseRatioCalculatorPage() {
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
    name: "Expense Ratio Calculator",
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
      title="Expense Ratio Calculator"
      intro="See how much a fund's annual expense ratio really costs you over time, and how much bigger your balance would be with a cheaper fund. Enter your numbers and press Calculate."
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
            { name: "Expense Ratio Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Expense Ratio Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpenseRatioCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the expense ratio cost is calculated</H2>
            <P>
              Each year the calculator grows your balance at the expected return, then deducts the
              expense ratio from that balance, just like a real fund does. It runs the same scenario a
              second time with no fee. The gap between the two ending balances is the true cost of the
              fee, which is far larger than the simple annual percentage because every dollar lost to
              fees also stops compounding.
            </P>
            <P>
              That is why the chart shows two lines drifting apart. The fee looks tiny in year one, but
              the space between the lines widens steadily as the years pass.
            </P>

            <H2>A quick example</H2>
            <P>
              Invest $50,000 and add $6,000 a year for 30 years at a 7% return. A fund charging 0.75%
              leaves you with noticeably less than an identical fund charging nothing, and the
              difference can run into six figures. Switching to a low cost index fund at 0.05% keeps
              most of that money in your pocket.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Returns are never guaranteed, so treat the ending balances as estimates. Fees, however,
              are charged whether the market rises or falls, which is what makes them worth minimizing.
              For investor basics on fund costs, the{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC investor education site</a>{" "}
              is a reliable source. Compare growth scenarios with our{" "}
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
