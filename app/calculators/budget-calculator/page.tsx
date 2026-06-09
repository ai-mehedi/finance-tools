import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BudgetCalculator from "./BudgetCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/budget-calculator";
const SELF_SLUG = "budget-calculator";

const DESC =
  "Free budget calculator using the 50/30/20 rule. Enter your monthly after-tax income to split it into needs, wants and savings in seconds.";

export const metadata: Metadata = {
  title: "Budget Calculator",
  description: DESC,
  keywords: [
    "budget calculator",
    "50/30/20 rule calculator",
    "monthly budget calculator",
    "personal budget planner",
    "income budget calculator",
    "needs wants savings",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Budget Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Budget Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the 50/30/20 budget rule?",
    answer:
      "The 50/30/20 rule splits your after-tax income into three buckets: 50% for needs, 30% for wants, and 20% for savings and debt repayment. It was popularized by Senator Elizabeth Warren and is widely used because it is simple to remember and flexible.",
  },
  {
    question: "What counts as a need versus a want?",
    answer:
      "Needs are essentials you cannot easily skip, such as rent or mortgage, utilities, groceries, insurance, minimum debt payments and transport to work. Wants are discretionary, such as dining out, streaming services, hobbies, travel and upgrades you could live without.",
  },
  {
    question: "Should I use gross or after-tax income?",
    answer:
      "Use your after-tax, take-home income, the amount that actually lands in your account each month. Budgeting from gross income overstates what you can spend because taxes and payroll deductions are taken out before you ever see the money.",
  },
  {
    question: "What if my needs are more than 50%?",
    answer:
      "In high-cost areas needs often exceed 50%, which is common and not a failure. Treat the rule as a target, not a hard limit. If needs run high, trim the wants category first and protect savings where you can, then revisit larger fixed costs like housing over time.",
  },
];

export default async function BudgetCalculatorPage() {
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
    name: "Budget Calculator",
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
      title="Budget Calculator"
      intro="Split your monthly income into needs, wants and savings with the 50/30/20 rule. Enter your after-tax income, then press Calculate."
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
            { name: "Budget Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Budget Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <BudgetCalculator />

          {/* Ad 1 */}
          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the 50/30/20 budget works</H2>
            <P>
              The 50/30/20 rule is a simple framework for dividing your take-home pay. Half goes to
              needs, the essentials you cannot easily avoid. Thirty percent goes to wants, the
              lifestyle spending that makes life enjoyable. The final twenty percent goes to savings
              and paying down debt faster than the minimum. The breakdown bar above shows those three
              slices at a glance.
            </P>
            <P>
              The appeal of the rule is its simplicity. Instead of tracking dozens of line items, you
              steer three broad categories. If you earn $5,000 a month after tax, that is $2,500 for
              needs, $1,500 for wants and $1,000 for savings. Those targets give you a quick gut check
              on whether your spending is in balance.
            </P>

            <H2>Making the rule work for you</H2>
            <P>
              The percentages are a starting point, not a law. In expensive cities, needs frequently
              climb above 50%, so people borrow from the wants bucket to keep savings intact. If you
              are aggressively paying off high-interest debt or saving for a near-term goal, you might
              flip toward a 50/20/30 or even 50/10/40 split. The key is being deliberate about where
              each dollar goes.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Always budget from after-tax income, and revisit the split whenever your pay or fixed
              costs change. For broader money guidance, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              offers free budgeting tools. You can also pair this with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other financial calculators</Link>{" "}
              to plan savings and debt payoff.
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

          {/* Related guides */}
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

          {/* Ad 2 */}
          <div className="mt-10">
            <AdSlot minHeight={120} />
          </div>
        </div>

        {/* Sidebar */}
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

          {/* Ad 3 — sticky side banner */}
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
