import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import NetProfitMarginCalculator from "./NetProfitMarginCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/net-profit-margin-calculator";
const SELF_SLUG = "net-profit-margin-calculator";

const DESC =
  "Free net profit margin calculator. Enter total revenue and total expenses to see your net profit and net profit margin percentage, and understand how it differs from gross and operating margin.";

const baseMetadata: Metadata = {
  title: "Net Profit Margin Calculator",
  description: DESC,
  keywords: [
    "net profit margin calculator",
    "net margin calculator",
    "profit margin calculator",
    "net profit calculator",
    "bottom line margin",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Net Profit Margin Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Net Profit Margin Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How do you calculate net profit margin?",
    answer:
      "Net profit margin is net profit divided by revenue, expressed as a percentage. First find net profit by subtracting all expenses from total revenue, then divide by revenue and multiply by 100. For example, $250,000 in revenue with $210,000 in total expenses leaves $40,000 of net profit, which is a 16.0 percent net margin.",
  },
  {
    question: "What is the difference between gross, operating and net margin?",
    answer:
      "Gross margin counts only the cost of goods sold, operating margin also subtracts overhead like salaries and rent, and net margin subtracts everything that remains — interest, taxes and one-off items. Net margin is the most complete measure because it shows the share of revenue that actually reaches the bottom line.",
  },
  {
    question: "What is a good net profit margin?",
    answer:
      "It depends heavily on the industry. Grocery and retail businesses often run on net margins of 1 to 3 percent, while software and services can exceed 20 percent. Rather than chase a universal number, compare your margin to direct competitors and to your own results over time.",
  },
  {
    question: "Can net profit margin be negative?",
    answer:
      "Yes. When total expenses are larger than revenue, net profit is negative and the margin is below zero, which signals a net loss for the period. This calculator shows that case clearly so you can see how far expenses would need to fall to break even.",
  },
];

export default async function NetProfitMarginCalculatorPage() {
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
    name: "Net Profit Margin Calculator",
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
      title="Net Profit Margin Calculator"
      intro="Work out your net profit margin in seconds. Enter total revenue and total expenses, and the calculator returns your net profit in dollars and your net margin as a percentage — the share of every sale that you actually keep."
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
            { name: "Net Profit Margin Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Net Profit Margin Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NetProfitMarginCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>What net profit margin tells you</H2>
            <P>
              Net profit margin is the bottom-line measure of profitability. It answers a simple
              question: out of every dollar a business takes in, how many cents are left once every
              cost has been paid? To find it, subtract total expenses — cost of goods sold, wages,
              rent, marketing, interest and taxes — from total revenue to get net profit, then divide
              that figure by revenue and multiply by 100. The result is a percentage that strips out
              the size of the business so you can compare a corner shop with a multinational on equal
              terms.
            </P>
            <P>
              Because it captures every expense, net margin is the most honest gauge of how efficiently
              a company turns sales into profit. A firm can post huge revenue and still run a thin or
              negative margin if its costs are bloated. Watching the margin over several periods often
              reveals more than the raw profit figure: a rising margin means the business is keeping
              more of what it earns, while a falling one is an early warning that costs are outpacing
              sales.
            </P>

            <H2>Net margin versus gross and operating margin</H2>
            <P>
              The three common margins differ only in which costs they subtract. Gross margin removes
              just the direct cost of producing your goods or services, so it shows the raw mark-up on
              what you sell. Operating margin goes a step further and also deducts overhead such as
              salaries, rent and administration, revealing how profitable the core operation is before
              financing and tax. Net margin subtracts everything that is left — interest on debt, income
              tax and any unusual one-off items — which is why it sits at the bottom of the income
              statement and is often called the "bottom line."
            </P>
            <P>
              Reading the three together is more useful than any one alone. A healthy gross margin paired
              with a weak net margin points to heavy overhead, interest or tax dragging down the result;
              a strong net margin built on a thin gross margin suggests a lean, high-volume operation. If
              you want the gross or pre-tax view, our{" "}
              <Link href="/calculators/profit-margin-calculator" className="text-orange-600 underline">profit margin calculator</Link>{" "}
              handles markup and gross margin, and our{" "}
              <Link href="/calculators/break-even-calculator" className="text-orange-600 underline">break-even calculator</Link>{" "}
              shows the sales level where profit turns positive.
            </P>

            <H2>How to improve your net profit margin</H2>
            <P>
              There are only two levers behind every margin: raise revenue or cut costs. On the revenue
              side, modest price increases flow almost entirely to the bottom line, and focusing on your
              highest-margin products or customers can lift the blended margin without selling a single
              extra unit. Many businesses underprice for years out of habit; even a small, well-tested
              increase can move the net margin meaningfully because the added revenue carries little or
              no extra cost.
            </P>
            <P>
              On the cost side, look past the obvious cuts. Renegotiating supplier terms, trimming
              interest by refinancing debt, and removing low-value overhead all widen the gap between
              revenue and expenses. Because net margin includes tax, sensible tax planning matters too.
              The goal is not to slash spending blindly but to make sure every dollar of cost earns its
              place — then the margin takes care of itself as the business scales.
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
