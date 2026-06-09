import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CollegeCostCalculator from "./CollegeCostCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/college-cost-calculator";
const SELF_SLUG = "college-cost-calculator";

const DESC =
  "Free college cost calculator. Project the future cost of a degree by growing today's tuition with education inflation across each year of study, with a year by year chart.";

export const metadata: Metadata = {
  title: "College Cost Calculator",
  description: DESC,
  keywords: [
    "college cost calculator",
    "future college cost calculator",
    "tuition cost calculator",
    "college tuition inflation",
    "cost of college calculator",
    "education cost calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "College Cost Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "College Cost Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is future college cost calculated?",
    answer:
      "The tool grows today's annual cost by an education inflation rate for each year until the student starts, then for each additional year of study. Adding up the inflated cost across all years of the degree gives the projected total.",
  },
  {
    question: "What is a realistic college inflation rate?",
    answer:
      "College costs have historically risen faster than general inflation, often in the range of 4% to 6% a year. The default here is 5%, but you can adjust it to match your school or to test a more conservative or aggressive scenario.",
  },
  {
    question: "Should I include more than tuition?",
    answer:
      "Yes. A useful estimate is the all in cost of attendance, which includes tuition, fees, housing, meals, books and supplies. Enter that full yearly figure so the projection reflects what you will actually pay.",
  },
  {
    question: "How can I prepare for these costs?",
    answer:
      "Starting early gives savings more time to grow and softens the impact of rising tuition. A dedicated education account and a regular contribution plan are common approaches. Pair this projection with a savings calculator to set a monthly target.",
  },
];

export default async function CollegeCostCalculatorPage() {
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
    "🎓"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "College Cost Calculator",
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
      title="College Cost Calculator"
      intro="Project what a college degree will really cost by the time your student enrolls, after years of rising tuition. See the cost for each year of study and the total. Enter your numbers and press Calculate."
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
            { name: "College Cost Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="College Cost Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CollegeCostCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the college cost calculator works</H2>
            <P>
              College is rarely a single bill. The price tends to climb each year, so a degree that
              starts a decade from now can cost far more than today's sticker price. This calculator
              projects that growth by applying an education inflation rate to today's annual cost.
            </P>
            <P>
              First it inflates the cost forward to the year your student enrolls. Then it continues to
              inflate the price for each additional year of study, since tuition keeps rising while
              they are enrolled. Adding those yearly amounts gives the total, and the chart shows how
              each year of the degree is more expensive than the last.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a year of college costs $28,000 today, your child starts in 10 years, the degree
              takes 4 years, and costs rise 5% a year. The first year alone is around $45,600 by then,
              and the full four years total well over $190,000, far above the $112,000 it would be at
              today's prices.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The projection depends heavily on the inflation rate you choose, so try a few values to
              bracket the range. Financial aid, scholarships and in state tuition can lower the real
              number. For official data on prices and aid, the{" "}
              <a href="https://nces.ed.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">National Center for Education Statistics</a>{" "}
              is a reliable source. Plan saving with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>.
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
