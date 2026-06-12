import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MillionaireCalculator from "./MillionaireCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/millionaire-calculator";
const SELF_SLUG = "millionaire-calculator";

const DESC =
  "Free millionaire savings calculator. Find out how many years it takes your current savings plus monthly contributions to reach one million dollars at a chosen return, with a chart tracking the climb to your goal.";

const baseMetadata: Metadata = {
  title: "Millionaire Savings Calculator",
  description: DESC,
  keywords: [
    "millionaire calculator",
    "how long to become a millionaire",
    "save a million dollars calculator",
    "millionaire savings goal",
    "time to reach one million",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Millionaire Savings Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Millionaire Savings Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How long does it take to save a million dollars?",
    answer:
      "It depends on your starting balance, how much you add each month, and your return. Saving 800 dollars a month from 25,000 dollars at a 7 percent annual return reaches one million in roughly 28 years. Raising the monthly amount or the return shortens that timeline noticeably.",
  },
  {
    question: "Does the calculator account for compound growth?",
    answer:
      "Yes. It grows your balance month by month, so each month earns a return on the prior balance plus that month's contribution. This compounding is why the gap between the money you put in and your total balance widens sharply in the later years.",
  },
  {
    question: "What return should I assume?",
    answer:
      "There is no guaranteed figure, but a diversified stock and bond portfolio has historically averaged somewhere around 6 to 8 percent a year before inflation over long periods. Using a more conservative number gives a safer, longer estimate you are less likely to fall short of.",
  },
  {
    question: "Is one million dollars enough to retire?",
    answer:
      "It can be, but it depends on your spending, location, and other income such as a pension or social security. A common rule of thumb is that one million supports roughly 40,000 dollars of annual withdrawals, so the right target varies from person to person.",
  },
];

export default async function MillionaireCalculatorPage() {
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
    "🏆"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Millionaire Savings Calculator",
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
      title="Millionaire Savings Calculator"
      intro="See how long it takes to reach your first million. Enter your savings, monthly contribution, return, and goal, then press Calculate to watch the timeline."
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
            { name: "Millionaire Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Millionaire Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MillionaireCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the millionaire calculator works</H2>
            <P>
              The tool runs your money forward one month at a time. Each month it applies a slice of
              your annual return to the current balance and then adds your contribution, so growth and
              saving reinforce each other. It keeps going until the balance crosses your goal, then
              reports the exact point you got there in years and, if you entered your age, the age you
              are likely to reach it.
            </P>
            <P>
              The chart plots your balance as a rising area against the flat dashed line of money you
              actually saved, with a green marker at the goal. Early on the two lines hug each other;
              over time compounding pulls the balance well above what you put in, which is the engine
              that gets most savers across the finish line.
            </P>

            <H2>A quick example</H2>
            <P>
              Imagine a 30-year-old with 25,000 dollars saved who puts away 800 dollars a month and
              earns 7 percent a year. They cross one million dollars in their late fifties, having
              personally contributed roughly 270,000 dollars. The remaining bulk of the balance is
              pure investment growth, not money out of their own pocket.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Returns are never smooth, so treat the result as a planning estimate rather than a date
              on the calendar. Inflation also erodes what a million will buy decades from now. For
              neutral guidance on investing for long-term goals, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To project a single lump sum without monthly saving, try our{" "}
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
