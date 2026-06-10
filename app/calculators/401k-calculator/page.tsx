import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import Four01kCalculator from "./Four01kCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/401k-calculator";
const SELF_SLUG = "401k-calculator";

const DESC =
  "Free 401(k) calculator. Project your retirement balance from your salary, contribution rate, employer match and expected return, with a growth chart.";

export const metadata: Metadata = {
  title: "401k Calculator",
  description: DESC,
  keywords: [
    "401k calculator",
    "401k retirement calculator",
    "employer match calculator",
    "retirement savings calculator",
    "401k growth calculator",
    "401k projection",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "401k Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "401k Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does an employer 401(k) match work?",
    answer:
      "Your employer adds money to your 401(k) based on what you contribute, up to a cap. A common setup is 50% of your contributions on the first 6% of salary. If you earn $75,000 and put in 6%, you add $4,500 and the employer adds $2,250. Contributing at least up to the match limit is essentially free money.",
  },
  {
    question: "How is the future 401(k) balance calculated?",
    answer:
      "This tool simulates your account month by month. Each month it adds your contribution, adds the employer match, and grows the whole balance at the monthly equivalent of your expected annual return. The result is your projected balance plus a breakdown of your contributions, the employer match and investment growth.",
  },
  {
    question: "What return rate should I use?",
    answer:
      "Historically, a diversified stock-heavy 401(k) has averaged roughly 6% to 8% a year over long periods, before inflation. Markets fluctuate, so treat any single rate as a long-term average rather than a guarantee, and consider running a lower rate to see a more conservative outcome.",
  },
  {
    question: "Should I contribute more than the match limit?",
    answer:
      "Often yes. Once you capture the full employer match, extra contributions still grow tax-advantaged and compound for decades. The IRS sets annual contribution limits, so check the current cap, but for most savers raising the contribution rate is one of the most powerful levers for retirement.",
  },
];

export default async function Four01kCalculatorPage() {
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
    "🧓"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "401k Calculator",
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
      title="401k Calculator"
      intro="Project your retirement balance from your salary, contribution rate, employer match and expected return. Enter your details, then press Calculate."
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
            { name: "401k Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="401k Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <Four01kCalculator />

          {/* Ad 1 */}
          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How a 401(k) grows</H2>
            <P>
              A 401(k) is an employer-sponsored retirement account you fund directly from your
              paycheck. Three forces drive the final balance: the money you contribute, the match
              your employer adds, and the investment growth that compounds on top of both. Because
              contributions are made every pay period over many years, even modest percentages turn
              into large sums by the time you retire.
            </P>
            <P>
              This calculator simulates your account month by month. Each month it adds your
              contribution, calculated as your chosen percent of salary, then adds the employer
              match up to the match limit, and finally grows the whole balance at the monthly
              equivalent of your expected annual return. The chart above shows the gap between what
              you and your employer put in and what the account is actually worth widening over time.
            </P>

            <H2>Why the employer match matters</H2>
            <P>
              The employer match is one of the few guaranteed returns in investing. A 50% match on
              the first 6% of salary means every dollar you contribute up to that limit instantly
              becomes $1.50. Failing to contribute enough to capture the full match leaves real money
              on the table. As a rule of thumb, contribute at least up to the match limit before
              prioritizing other savings goals.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Projected returns are long-term averages, not promises, and real markets rise and fall
              from year to year. Contribution limits are set annually by the IRS, so confirm the
              current cap before raising your rate. For trustworthy retirement basics see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>{" "}
              from the SEC, and explore our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other financial calculators</Link>{" "}
              to plan the rest of your finances.
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <BlogCard key={a._id} article={a} size="sm" />
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
