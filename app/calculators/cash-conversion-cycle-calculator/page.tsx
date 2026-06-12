import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CashConversionCycleCalculator from "./CashConversionCycleCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/cash-conversion-cycle-calculator";
const SELF_SLUG = "cash-conversion-cycle-calculator";

const DESC =
  "Free cash conversion cycle calculator. Turn your revenue, COGS, inventory, receivables and payables into DIO, DSO and DPO, then see the cash conversion cycle (CCC) in days — including when it goes negative.";

const baseMetadata: Metadata = {
  title: "Cash Conversion Cycle Calculator",
  description: DESC,
  keywords: [
    "cash conversion cycle calculator",
    "ccc calculator",
    "days inventory outstanding",
    "days sales outstanding",
    "days payable outstanding",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Cash Conversion Cycle Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Conversion Cycle Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What is the cash conversion cycle?",
    answer:
      "The cash conversion cycle (CCC) is the number of days it takes a business to turn cash spent on inventory back into cash collected from customers. It equals Days Inventory Outstanding plus Days Sales Outstanding minus Days Payable Outstanding (CCC = DIO + DSO − DPO). A shorter cycle means cash is tied up for less time.",
  },
  {
    question: "How are DIO, DSO and DPO calculated?",
    answer:
      "DIO = average inventory ÷ COGS × 365, the days inventory sits before it sells. DSO = average accounts receivable ÷ revenue × 365, the days customers take to pay. DPO = average accounts payable ÷ COGS × 365, the days you take to pay suppliers. This calculator computes all three from your raw figures using a 365-day year.",
  },
  {
    question: "Is a negative cash conversion cycle good?",
    answer:
      "Usually yes. A negative CCC means you collect cash from customers and sell inventory before your supplier bills come due, so suppliers effectively finance your operations. Retailers and subscription businesses with fast sales and long payment terms often run negative cycles, freeing up working capital for growth.",
  },
  {
    question: "What is a good cash conversion cycle?",
    answer:
      "There is no universal target — it depends on the industry. Grocers and software firms often sit near zero or below, while manufacturers with long production runs can exceed 90 days. The most useful comparison is against your own past results and direct competitors: a falling CCC over time generally signals improving working-capital efficiency.",
  },
];

export default async function CashConversionCycleCalculatorPage() {
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
    "🔄"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cash Conversion Cycle Calculator",
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
      title="Cash Conversion Cycle Calculator"
      intro="Measure how long cash is locked up in your operations. Enter annual revenue and COGS plus your average inventory, receivables and payables, then press Calculate to see DIO, DSO, DPO and the full cash conversion cycle in days."
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
            { name: "Cash Conversion Cycle Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Cash Conversion Cycle Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashConversionCycleCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the cash conversion cycle calculator works</H2>
            <P>
              The cash conversion cycle, or CCC, tracks the journey of a single dollar through your
              business: it starts when you pay a supplier for inventory and ends when a customer's
              payment finally lands in your bank account. The shorter that journey, the less cash you
              need to keep the lights on. This calculator builds the cycle from three components —
              Days Inventory Outstanding (DIO), Days Sales Outstanding (DSO) and Days Payable
              Outstanding (DPO) — each derived from the raw figures on your income statement and
              balance sheet using a 365-day year.
            </P>
            <P>
              DIO measures how long stock sits on the shelf before it sells (average inventory ÷ COGS
              × 365). DSO measures how long customers take to pay you (average receivables ÷ revenue ×
              365). DPO measures how long you take to pay your own suppliers (average payables ÷ COGS
              × 365). The cycle is then simply CCC = DIO + DSO − DPO. Inventory and collection days add
              to the cash you have tied up, while the days you delay paying suppliers subtract from it.
            </P>

            <H2>Reading high, low and negative results</H2>
            <P>
              A high CCC means cash is trapped for a long time. Inventory may be moving slowly, customers
              may be paying late, or you may be settling supplier invoices too quickly. Each of those is a
              lever you can pull: tighten inventory planning to cut DIO, sharpen invoicing and collections
              to cut DSO, or negotiate longer terms with vendors to raise DPO. Because the three components
              are separated, the calculator shows you exactly which one is doing the damage rather than
              hiding it inside a single headline number.
            </P>
            <P>
              A low cycle frees up working capital, and a negative cycle is often a sign of real strength.
              When CCC is below zero you are collecting from customers and clearing inventory before your
              supplier bills come due — in effect your suppliers are funding your operations for free.
              Fast-moving retailers, marketplaces and subscription businesses frequently run negative
              cycles and reinvest that float into growth. A negative result is not an error; it is a healthy
              outcome worth protecting.
            </P>

            <H2>Putting the cycle to work</H2>
            <P>
              The CCC is most useful as a trend rather than a one-off snapshot. Recalculate it each quarter
              and watch the direction: a steadily falling cycle means your working capital is getting more
              efficient, while a rising one is an early warning that cash is being absorbed faster than it is
              returning. Pair it with absolute cash figures so you can see both the timing and the scale of
              the squeeze. Our{" "}
              <Link href="/calculators/cash-flow-calculator" className="text-orange-600 underline">cash flow calculator</Link>{" "}
              helps you map the dollars moving in and out each period.
            </P>
            <P>
              For early-stage and high-growth companies, the cycle pairs naturally with runway planning. A
              long CCC quietly consumes the cash you raised, so improving it can extend how long your balance
              stretches without adding a single dollar of funding. Once you understand your cycle, check how
              quickly you are spending overall with our{" "}
              <Link href="/calculators/burn-rate-calculator" className="text-orange-600 underline">burn rate calculator</Link>{" "}
              to keep both timing and total spend in view.
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
