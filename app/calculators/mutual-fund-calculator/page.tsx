import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MutualFundCalculator from "./MutualFundCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mutual-fund-calculator";
const SELF_SLUG = "mutual-fund-calculator";

const DESC =
  "Free mutual fund returns calculator. Project the maturity value of a one-time lump sum or a monthly SIP at an expected return, see the drag from the expense ratio, and chart value against money invested.";

export const metadata: Metadata = {
  title: "Mutual Fund Returns Calculator",
  description: DESC,
  keywords: [
    "mutual fund calculator",
    "mutual fund returns calculator",
    "SIP calculator",
    "lump sum mutual fund calculator",
    "expense ratio impact",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mutual Fund Returns Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mutual Fund Returns Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is a mutual fund SIP different from a lump sum?",
    answer:
      "A SIP invests a fixed amount every month, so your money goes in gradually and only the early contributions enjoy the full compounding period. A lump sum invests everything at the start, giving the whole amount the maximum time to grow. This tool lets you model either style and compare the outcomes.",
  },
  {
    question: "Why does the expense ratio matter so much?",
    answer:
      "The expense ratio is the annual fee a fund charges as a percentage of your holdings. The calculator subtracts it from your expected return to get a net return, then compounds that. Even half a percent compounds against you year after year, which is why it can quietly cost a meaningful slice of your final value.",
  },
  {
    question: "Are the returns shown guaranteed?",
    answer:
      "No. Mutual funds invest in markets that rise and fall, so the expected return you enter is only an assumption. Real returns are lumpy and can be negative in some years. Use the projection to compare scenarios, not as a promise of what you will earn.",
  },
  {
    question: "How does compounding frequency affect the result?",
    answer:
      "This calculator compounds monthly, which matches how SIP contributions are made and gives a smooth growth curve. The more often returns compound, the slightly higher the ending value at the same annual rate, because earnings start earning sooner.",
  },
];

export default async function MutualFundCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mutual Fund Returns Calculator",
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
      title="Mutual Fund Returns Calculator"
      intro="Estimate what a mutual fund investment could grow into. Choose a monthly SIP or a one-time lump sum, set an expected return and expense ratio, then press Calculate to see the projected value."
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
            { name: "Mutual Fund Returns Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mutual Fund Returns Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MutualFundCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the mutual fund returns calculator works</H2>
            <P>
              Pick a style and the tool does the rest. For a SIP it adds your monthly amount at the
              start of each month and grows the running balance at the net monthly return. For a lump
              sum it invests the whole amount on day one and compounds it forward. Either way it
              subtracts the expense ratio from your expected return first, so fees are baked in.
            </P>
            <P>
              The chart shows two lines: the rising value of your holdings and the flat or stepped line
              of money you actually invested. The widening gap between them is your estimated gain, the
              part of the final balance that came from growth rather than your own contributions.
            </P>

            <H2>A worked example</H2>
            <P>
              Invest $500 a month for 15 years at a 12% expected return with a 0.6% expense ratio. The
              net return works out to 11.4% a year, your own contributions total $90,000, and the
              projected value climbs well above that thanks to compounding. Switch to a lump sum and you
              can see how investing the same money earlier changes the outcome.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Projections assume a steady return, but real funds swing year to year, so the final number
              is a planning estimate rather than a forecast. Lower-cost index funds tend to keep more of
              the market&rsquo;s return in your pocket. For investing basics from a neutral source, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To project a single deposit with no contributions, try our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>.
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
