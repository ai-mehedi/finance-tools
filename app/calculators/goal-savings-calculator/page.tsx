import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import GoalSavingsCalculator from "./GoalSavingsCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/goal-savings-calculator";
const SELF_SLUG = "goal-savings-calculator";

const DESC =
  "Free goal based savings calculator. Find out exactly how much to set aside each month to hit a savings target by a chosen date, accounting for your existing balance and expected return.";

const baseMetadata: Metadata = {
  title: "Goal Based Savings Calculator",
  description: DESC,
  keywords: [
    "goal based savings calculator",
    "savings goal calculator",
    "how much to save each month",
    "monthly savings calculator",
    "savings target planner",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Goal Based Savings Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Goal Based Savings Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does a goal based savings plan work?",
    answer:
      "You start from the end and work backwards. Decide the amount you need and the date you need it by, then the calculator solves for the steady monthly deposit that grows into that target at your expected return. It also folds in any money you have already saved so you only fund the gap.",
  },
  {
    question: "What return rate should I assume?",
    answer:
      "Use a rate that matches where the money will sit. A high yield savings account or short term deposit might earn a few percent, while a diversified investment portfolio over many years has historically earned more but with ups and downs. Lower the rate if you cannot afford to miss the deadline.",
  },
  {
    question: "What if my existing savings already cover the goal?",
    answer:
      "If your current balance, after growing at the chosen return, already reaches or passes the target by the deadline, the required monthly deposit shows as zero. In that case you can stop adding new money, choose a sooner deadline, or set a larger goal.",
  },
  {
    question: "How is this different from a simple savings calculator?",
    answer:
      "A plain savings calculator tells you the future value of deposits you have already decided on. This tool flips the question around. You fix the destination and the date, and it tells you the contribution required to get there, which makes it far better for planning toward a specific milestone.",
  },
];

export default async function GoalSavingsCalculatorPage() {
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
    "🎯"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Goal Based Savings Calculator",
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
      title="Goal Based Savings Calculator"
      intro="Name a target and a deadline, and we will tell you the monthly deposit that gets you there. Enter what you already have set aside and your expected return, then press Calculate."
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
            { name: "Goal Based Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Goal Based Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GoalSavingsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the goal based savings calculator works</H2>
            <P>
              Instead of guessing how much you might accumulate, this tool starts from the result you
              want. You enter the target amount, the time you have, your expected annual return and
              any savings you already hold. It then grows your existing balance forward, subtracts
              that from the goal, and solves for the level monthly deposit that fills the rest.
            </P>
            <P>
              The chart traces your projected balance year by year against a dashed line for the cash
              you actually deposit, with a marker showing the goal. The widening gap between the two
              curves is the compounding return doing part of the work for you.
            </P>

            <H2>A worked example</H2>
            <P>
              Imagine you want 50,000 for a home deposit in 10 years, you already have 5,000 set
              aside, and you expect a 6 percent return. The tool finds that your starting balance
              grows to about 9,100 on its own, so monthly deposits of roughly 250 cover the remaining
              gap. Of the final 50,000, a meaningful slice is growth rather than money you put in.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Returns are never guaranteed, so revisit the plan once a year and adjust your deposit if
              markets or your timeline shift. For practical goal setting and emergency fund guidance
              from a neutral source, see{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB</a>.
              Once your money is invested and growing, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              can project where a fixed contribution ends up.
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
