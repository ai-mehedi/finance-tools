import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RetirementWithdrawalCalculator from "./RetirementWithdrawalCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/retirement-withdrawal-calculator";
const SELF_SLUG = "retirement-withdrawal-calculator";

const DESC =
  "Free retirement withdrawal calculator. Test how long your nest egg lasts as you draw an inflation-adjusted income each year, with the ending balance and a depletion chart.";

const baseMetadata: Metadata = {
  title: "Retirement Withdrawal Calculator",
  description: DESC,
  keywords: [
    "retirement withdrawal calculator",
    "how long will my money last",
    "retirement drawdown calculator",
    "safe withdrawal rate",
    "nest egg depletion",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Retirement Withdrawal Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Retirement Withdrawal Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What does this calculator show?",
    answer:
      "It simulates your retirement portfolio one year at a time. Each year the balance earns your expected return and then a withdrawal is taken, with the withdrawal rising with inflation so your buying power holds steady. The result tells you the ending balance or, if the pot runs dry, how many years it lasted.",
  },
  {
    question: "What is a safe withdrawal rate?",
    answer:
      "A safe withdrawal rate is the share of your starting balance you can draw in the first year, then raise with inflation, without running out too early. A commonly cited starting point is around four percent, but the right number depends on your returns, your time horizon and how much risk of depletion you can accept.",
  },
  {
    question: "Does withdrawal timing matter?",
    answer:
      "It does, a little. Taking the withdrawal at the start of the year removes that cash before it can earn a return, so the balance lasts marginally less time. Taking it at year end lets the full balance compound first. The tool lets you switch between the two so you can compare.",
  },
  {
    question: "Why might my money run out early?",
    answer:
      "The portfolio runs dry when withdrawals plus inflation outpace the returns the balance can earn. High starting withdrawals, low returns and high inflation all shorten the timeline. If the chart hits zero before your horizon ends, lower the withdrawal or extend the assumptions and try again.",
  },
];

export default async function RetirementWithdrawalCalculatorPage() {
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
    "💸"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Retirement Withdrawal Calculator",
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
      title="Retirement Withdrawal Calculator"
      intro="See how long your savings can support you in retirement. Enter your balance, the income you want to draw and your return and inflation assumptions, then press Calculate."
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
            { name: "Retirement Withdrawal Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Retirement Withdrawal Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RetirementWithdrawalCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the retirement withdrawal calculator works</H2>
            <P>
              Saving builds the pot; this tool tests whether the pot can actually pay you. It walks
              through retirement year by year. The balance earns your chosen return, then you take a
              withdrawal that grows with inflation so the income keeps the same purchasing power. The
              calculator tracks the running balance and flags the year the money would run out if it
              does.
            </P>
            <P>
              The shaded chart plots the portfolio balance across your horizon. A line that drifts
              upward or stays flat means your withdrawals are comfortably covered, while a line
              sloping toward zero is a warning that the income is too high for the returns you have
              assumed.
            </P>

            <H2>A worked example</H2>
            <P>
              Start with one million dollars, draw $40,000 in the first year, and assume a 6 percent
              return with 3 percent inflation over 30 years. That opening draw is a 4 percent rate.
              Because returns stay ahead of withdrawals in the early years, the balance holds up and
              still has a healthy cushion at the end of three decades. Lift the first draw to $60,000,
              though, and the same portfolio empties well before the horizon closes.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This model uses a single steady return, but real markets deliver good and bad years in
              an unpredictable order, and a run of poor returns early in retirement is especially
              damaging. Stay flexible, and trim spending in down years rather than drawing blindly.
              For a deeper look at sustainable spending, see{" "}
              <a href="https://www.investor.gov/additional-resources/retirement-toolkit/managing-lifetime-income" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To size the pot you start from, use our{" "}
              <Link href="/calculators/retirement-corpus-calculator" className="text-orange-600 underline">retirement corpus calculator</Link>.
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
