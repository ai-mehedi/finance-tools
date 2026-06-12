import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TwoCardPayoffCalculator from "./TwoCardPayoffCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/two-card-payoff-calculator";
const SELF_SLUG = "two-card-payoff-calculator";

const DESC =
  "Free two card payoff calculator. Split one monthly budget across two credit cards using the avalanche or snowball method, and see how fast you become debt free and how much interest each plan costs.";

const baseMetadata: Metadata = {
  title: "Two Card Payoff Calculator",
  description: DESC,
  keywords: [
    "two card payoff calculator",
    "credit card payoff calculator",
    "debt avalanche calculator",
    "debt snowball calculator",
    "multiple credit card payoff",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Two Card Payoff Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Two Card Payoff Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is the difference between avalanche and snowball?",
    answer:
      "The avalanche method sends every spare dollar to the card with the highest APR first, which pays the least interest overall. The snowball method targets the smallest balance first to clear a card quickly and build momentum. This calculator runs whichever order you pick.",
  },
  {
    question: "How does the rolling payment work?",
    answer:
      "Each card always gets at least its minimum payment, and the rest of your budget attacks the target card. As soon as the target card hits zero, the money that was paying it rolls onto the remaining card, so the second card is wiped out faster than it would be on its own.",
  },
  {
    question: "Why does my budget have to beat both minimums?",
    answer:
      "If the budget cannot even cover both minimum payments, the balances keep growing as interest is added faster than you pay it down, and the debt is never cleared. The tool asks for a budget above the combined minimums so the plan actually finishes.",
  },
  {
    question: "Which method saves the most money?",
    answer:
      "Avalanche almost always pays the least total interest because it kills the most expensive debt first. Snowball can cost a little more but clears a whole card sooner, which some people find easier to stick with. Try both and compare the totals.",
  },
];

export default async function TwoCardPayoffCalculatorPage() {
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
    "💳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Two Card Payoff Calculator",
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
      title="Two Card Payoff Calculator"
      intro="Pay off two credit cards with a single monthly budget. Enter each balance, APR and minimum, choose the avalanche or snowball order, then press Calculate to see how fast you clear the debt and the interest it costs."
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
            { name: "Two Card Payoff Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Two Card Payoff Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TwoCardPayoffCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the two card payoff calculator works</H2>
            <P>
              Each month the tool adds interest to both balances, pays every card its minimum, then
              throws all of your remaining budget at one target card chosen by the method you select.
              When that card reaches zero, its freed-up payment rolls onto the other card, which is why
              the second balance falls faster and faster toward the end.
            </P>
            <P>
              The chart traces your combined balance dropping to zero, with a dashed line for the first
              card so you can see exactly when it is cleared and the snowball effect kicks in on the
              remaining debt.
            </P>

            <H2>A quick example</H2>
            <P>
              Say card one holds $6,000 at 22.9 percent and card two holds $2,500 at 17.5 percent, with
              a combined budget of $450 a month. On the avalanche plan the budget attacks the 22.9
              percent card first because it costs the most, then rolls onto the cheaper card, clearing
              both faster and for less interest than paying them evenly.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The plan only works if you keep charging less than you pay, so freeze new spending on
              both cards while you knock down the balances. For a neutral primer on payoff strategies,
              see the{" "}
              <a href="https://www.consumerfinance.gov/ask-cfpb/category-credit-cards/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB</a>.
              If you are weighing a single loan to consolidate both cards, compare the numbers with our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              to see what the freed-up payments could earn afterward.
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
              <ul className="space-y-2">
                {articles.map((a) => (
                  <li key={a._id}>
                    <Link href={`/blog/${a.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
                      <span className="text-sm font-medium text-zinc-700 hover:text-orange-600">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
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

export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(SELF_SLUG, baseMetadata);
}
