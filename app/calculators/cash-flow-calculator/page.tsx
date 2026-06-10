import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CashFlowCalculator from "./CashFlowCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/cash-flow-calculator";
const SELF_SLUG = "cash-flow-calculator";

const DESC =
  "Free cash flow calculator. Add up your monthly income and expenses to find your net cash flow, savings rate, and how much you could build over time.";

const baseMetadata: Metadata = {
  title: "Cash Flow Calculator",
  description: DESC,
  keywords: [
    "cash flow calculator",
    "net cash flow calculator",
    "monthly cash flow",
    "income and expense calculator",
    "personal cash flow",
    "savings rate calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Cash Flow Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Cash Flow Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is net cash flow?",
    answer:
      "Net cash flow is the money left over after you subtract your total expenses from your total income for a period. A positive number means you have a surplus to save or invest. A negative number means you are spending more than you bring in.",
  },
  {
    question: "How do I calculate my monthly cash flow?",
    answer:
      "Add up all the income you receive in a month, including take home pay and any side income. Then add up every expense, from housing and food to debt payments. Subtract total expenses from total income, and the result is your monthly cash flow.",
  },
  {
    question: "What is a good savings rate?",
    answer:
      "Many planners suggest saving at least 15% to 20% of your income, but any positive savings rate is a good start. The higher your rate, the faster you build an emergency fund and reach long-term goals. This calculator shows your rate so you can track it.",
  },
  {
    question: "How can I improve my cash flow?",
    answer:
      "You can raise income, cut expenses, or both. Start with large recurring costs like housing and transport, then trim smaller flexible spending. Paying down high interest debt also frees up cash flow once the balance is gone.",
  },
];

export default async function CashFlowCalculatorPage() {
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
    "💵"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cash Flow Calculator",
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
      title="Cash Flow Calculator"
      intro="Add up your monthly income and expenses to see your net cash flow and savings rate, and project how it builds over time. Enter your numbers and press Calculate."
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
            { name: "Cash Flow Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Cash Flow Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashFlowCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the cash flow calculator works</H2>
            <P>
              Cash flow is simply the difference between what comes in and what goes out. This tool
              groups your income and your main spending categories, totals each side, and subtracts
              expenses from income to show your net monthly cash flow. A positive number is a surplus
              you can save or invest.
            </P>
            <P>
              The calculator also shows your savings rate, which is your net cash flow divided by your
              income. Tracking this single percentage over time is one of the clearest ways to see
              whether your finances are heading in the right direction.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you bring home $5,000 plus $500 of side income, for $5,500 total. Your housing,
              transport, food, debt and other costs add up to $4,000. Your net cash flow is $1,500 a
              month, a savings rate near 27%, which is roughly $18,000 a year you can put to work.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Use realistic averages, and do not forget irregular costs like car repairs or annual
              fees by spreading them across the year. For broad budgeting guidance, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a solid source. You can also try our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>.
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
