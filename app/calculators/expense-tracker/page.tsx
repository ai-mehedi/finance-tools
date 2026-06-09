import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ExpenseTrackerCalculator from "./ExpenseTrackerCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/expense-tracker";
const SELF_SLUG = "expense-tracker";

const DESC =
  "Free expense tracker. Add your monthly expenses by category, see your total spending, how much income is left over, and a clear breakdown of where your money goes.";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: DESC,
  keywords: [
    "expense tracker",
    "monthly expense tracker",
    "spending tracker",
    "budget tracker",
    "expense breakdown tool",
    "track expenses by category",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Expense Tracker | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Expense Tracker | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does this expense tracker work?",
    answer:
      "Add each expense with a name, a category and a monthly amount. The tool adds everything up, shows your total monthly and yearly spending, and breaks it down by category so you can see exactly where your money goes. Add an income figure to see how much is left over.",
  },
  {
    question: "Is my data saved anywhere?",
    answer:
      "No. Everything runs in your browser and nothing is sent to a server or stored. When you close or refresh the page, the entries reset. That keeps your numbers private, so feel free to use real figures.",
  },
  {
    question: "What categories should I use?",
    answer:
      "Common categories are housing, food, transport, utilities, insurance, health, entertainment and savings. The goal is enough detail to spot patterns without making tracking a chore. Group anything that does not fit under Other.",
  },
  {
    question: "How can I lower my spending?",
    answer:
      "Start with the biggest category, since a small percentage cut there usually saves more than eliminating several tiny expenses. Recurring subscriptions and dining out are common places to trim. Review the breakdown each month and set a target for one category at a time.",
  },
];

export default async function ExpenseTrackerPage() {
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
    name: "Expense Tracker",
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
      title="Expense Tracker"
      intro="Add your monthly expenses by category to see your total spending, how much income is left, and a clear breakdown of where your money goes. Enter your numbers and press Calculate."
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
            { name: "Expense Tracker", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this tool</p>
        <ShareButtons url={abs(PATH)} title="Expense Tracker" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpenseTrackerCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>Why tracking expenses matters</H2>
            <P>
              Most people underestimate their spending, often by a wide margin, because small recurring
              costs add up quietly. Writing every expense down in one place turns a vague feeling into a
              concrete number you can act on. The category breakdown makes it obvious which area is
              eating the most of your budget.
            </P>
            <P>
              Once you can see the total, you can compare it to your income and decide whether you are
              saving enough. Even a few minutes a month spent reviewing the numbers builds the habit
              that drives every successful budget.
            </P>

            <H2>How to use the tracker</H2>
            <P>
              List each regular expense, pick a category, and enter the monthly amount. For bills you
              pay once a year, divide by twelve to get the monthly figure. Add your monthly take home
              income at the top to see how much is left after everything is paid.
            </P>

            <H2>Turning the numbers into a plan</H2>
            <P>
              A common starting framework is the 50/30/20 split: roughly half of income on needs, a
              third on wants, and the rest toward savings and debt. Use the breakdown here to check
              where you land, then try our{" "}
              <Link href="/calculators/50-30-20-budget-calculator" className="text-orange-600 underline">50/30/20 budget calculator</Link>{" "}
              to set targets. For free, unbiased money guidance, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source.
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
