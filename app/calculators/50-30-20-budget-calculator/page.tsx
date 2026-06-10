import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import Five03020BudgetCalculator from "./Five03020BudgetCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/50-30-20-budget-calculator";
const SELF_SLUG = "50-30-20-budget-calculator";

const DESC =
  "Free 50/30/20 budget calculator. Split your monthly take-home income into 50% needs, 30% wants and 20% savings with clear dollar targets.";

export const metadata: Metadata = {
  title: "50/30/20 Budget Calculator",
  description: DESC,
  keywords: [
    "50 30 20 budget calculator",
    "50/30/20 rule calculator",
    "budget calculator",
    "monthly budget calculator",
    "needs wants savings calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "50/30/20 Budget Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "50/30/20 Budget Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the 50/30/20 budget rule?",
    answer:
      "It is a simple budgeting guideline that splits your after-tax income into three buckets: 50% for needs, 30% for wants and 20% for savings or debt payoff. The idea is to cover essentials, allow room for lifestyle and still build financial security.",
  },
  {
    question: "What counts as a need versus a want?",
    answer:
      "Needs are essentials you cannot easily skip, such as rent or mortgage, utilities, groceries, insurance and minimum debt payments. Wants are discretionary, such as dining out, streaming services, hobbies and travel. If you could pause it without serious consequence, it is usually a want.",
  },
  {
    question: "Should I use gross or take-home income?",
    answer:
      "Use take-home pay, the amount left after taxes and payroll deductions. The 50/30/20 split is designed for the money you actually receive, so building the budget on gross income would overstate what you have to spend.",
  },
  {
    question: "What if my needs are more than 50% of my income?",
    answer:
      "That is common in high-cost areas. Treat the percentages as targets rather than strict rules. If needs run high, trim wants first, and look for ways to lower fixed costs over time so the savings bucket does not get squeezed.",
  },
];

export default async function Five03020BudgetCalculatorPage() {
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
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "50/30/20 Budget Calculator",
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
      title="50/30/20 Budget Calculator"
      intro="Split your monthly take-home income into needs, wants and savings using the 50/30/20 rule. Enter your income and press Calculate to see your targets."
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
            { name: "50/30/20 Budget Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="50/30/20 Budget Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Five03020BudgetCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the 50/30/20 rule works</H2>
            <P>
              Popularized by Senator Elizabeth Warren, the 50/30/20 rule is a budgeting framework that
              keeps things simple. Half of your take-home pay covers needs, just under a third covers
              wants, and the final fifth goes to savings or paying down debt faster than the minimum.
            </P>
            <P>
              The strength of the method is that it requires only one number, your monthly take-home
              income, yet it still forces a deliberate balance between essentials, lifestyle and your
              future. It is a good starting point before moving to a more detailed line-item budget.
            </P>

            <H2>A quick example</H2>
            <P>
              If your take-home pay is $4,000 a month, the rule puts $2,000 toward needs, $1,200 toward
              wants and $800 toward savings or extra debt payments. Adjust the categories to your life,
              but keep the savings bucket protected so your long-term goals keep moving forward.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The percentages are guidelines, not laws. High rent or medical costs can push needs above
              50%, and that is fine as long as you adapt. For broader money basics, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable resource. To grow the savings bucket, try our{" "}
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
