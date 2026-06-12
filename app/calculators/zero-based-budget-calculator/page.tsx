import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ZeroBasedBudgetCalculator from "./ZeroBasedBudgetCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/zero-based-budget-calculator";
const SELF_SLUG = "zero-based-budget-calculator";

const DESC =
  "Free zero based budget calculator. Assign every dollar of monthly income to a category until the leftover reaches zero, with a donut chart of where your money goes.";

const baseMetadata: Metadata = {
  title: "Zero Based Budget Calculator",
  description: DESC,
  keywords: [
    "zero based budget calculator",
    "zero based budgeting",
    "give every dollar a job",
    "monthly budget planner",
    "income allocation calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Zero Based Budget Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero Based Budget Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What is a zero based budget?",
    answer:
      "A zero based budget is a plan where your income minus all of your assigned spending and saving equals zero. Instead of leaving money unlabeled, you give every dollar a specific job, whether that is rent, groceries, savings or fun, until nothing is left unassigned.",
  },
  {
    question: "Does a zero balance mean I spend everything?",
    answer:
      "No. Reaching zero means every dollar has a destination, and saving and investing are destinations too. A common budget might assign 20 percent to savings and debt payoff. The goal is intention, not emptying your account each month.",
  },
  {
    question: "What if I have money left over after assigning categories?",
    answer:
      "Leftover money means the budget is not yet zero based. Decide on a job for it, such as adding to an emergency fund, paying down a loan faster or topping up investments. The calculator shows the remaining amount so you know exactly how much still needs a home.",
  },
  {
    question: "How is this different from the 50/30/20 rule?",
    answer:
      "The 50/30/20 rule splits income into three fixed buckets for needs, wants and savings. Zero based budgeting is more granular and flexible: you build your own categories and amounts from scratch each month, which suits variable income and changing priorities better.",
  },
];

export default async function ZeroBasedBudgetCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Zero Based Budget Calculator",
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
      title="Zero Based Budget Calculator"
      intro="Plan a budget where every dollar has a job. Enter your monthly income and category amounts, then press Calculate to see how much is still waiting to be assigned."
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
            { name: "Zero Based Budget Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Zero Based Budget Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ZeroBasedBudgetCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the zero based budget calculator works</H2>
            <P>
              Zero based budgeting starts from a blank slate every month. Rather than tweaking last
              month numbers, you list your take-home income and then assign it, category by category,
              until the amount left to allocate is exactly zero. This calculator keeps a running tally
              of what you have assigned and subtracts it from income so you always know how far you are
              from a balanced plan.
            </P>
            <P>
              The donut chart turns your numbers into a picture, showing what share of income each
              category claims. Seeing that housing eats forty percent of the pie, or that savings is a
              thin sliver, often prompts the small adjustments that make a budget stick.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you bring home 5,000 dollars a month. You assign 1,500 to housing, 600 to groceries,
              350 to transport, 250 to utilities, 800 to savings, 500 to debt payoff, 400 to dining and
              600 to everything else. That adds up to exactly 5,000 dollars, so the amount left to assign
              is zero and the budget is balanced. If you had only assigned 4,400, the calculator would
              show 600 dollars still needing a job.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Treat savings, investing and debt payoff as real categories, not afterthoughts, so they
              compete for dollars on equal footing. For a plain-language introduction to budgeting
              approaches, the{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/budgeting/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB budgeting guide</a>{" "}
              is a solid neutral resource. Once your savings line is set, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              can show how that monthly amount grows over time.
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
