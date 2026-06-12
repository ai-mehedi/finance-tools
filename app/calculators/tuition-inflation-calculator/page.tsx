import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TuitionInflationCalculator from "./TuitionInflationCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/tuition-inflation-calculator";
const SELF_SLUG = "tuition-inflation-calculator";

const DESC =
  "Free tuition inflation calculator. Project what college will cost when your child enrolls by inflating today's tuition forward, total the bill across all years, and see the monthly savings needed to fund it.";

const baseMetadata: Metadata = {
  title: "Tuition Inflation Calculator",
  description: DESC,
  keywords: [
    "tuition inflation calculator",
    "college cost calculator",
    "future college cost",
    "college savings calculator",
    "529 savings goal",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Tuition Inflation Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Tuition Inflation Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "Why does tuition need its own inflation rate?",
    answer:
      "Because college costs have climbed faster than the prices of most other goods for decades. Using the general inflation rate would understate the bill, so this tool lets you set a separate tuition inflation rate, often somewhere around 4 to 6 percent a year.",
  },
  {
    question: "How is the future cost worked out?",
    answer:
      "Each academic year is inflated on its own. The first year is today's cost grown by the inflation rate for the number of years until enrollment, and every year after that is grown one extra year, because that bill arrives later. Adding the years together gives the full projected cost of the degree.",
  },
  {
    question: "How is the required monthly saving calculated?",
    answer:
      "The tool grows your current savings to the date college starts, subtracts that from the total bill to find the gap, then solves for the level monthly contribution that, earning your expected return, reaches the gap by the time the first payment is due.",
  },
  {
    question: "Should I include room and board?",
    answer:
      "That is up to you. If you want the full cost of attendance, add room, board, books and fees into the annual cost field. If you only want to plan for tuition because housing will be covered another way, enter tuition alone.",
  },
];

export default async function TuitionInflationCalculatorPage() {
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
    name: "Tuition Inflation Calculator",
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
      title="Tuition Inflation Calculator"
      intro="See what college could cost by the time your child enrolls. Enter today's tuition, the years until they start, the length of the degree and an inflation rate, then press Calculate to project the bill and the savings it takes to cover it."
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
            { name: "Tuition Inflation Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Tuition Inflation Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TuitionInflationCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the tuition inflation calculator works</H2>
            <P>
              The tool inflates today's annual cost forward to each year your child will be enrolled.
              Because a degree spans several years, the later years cost more than the first, so the
              calculator prices every year separately and adds them up to get the full bill. The chart
              shows that rising staircase of yearly costs.
            </P>
            <P>
              It then asks the savings question in reverse. It grows whatever you have saved to the
              start of college, finds the shortfall against the projected bill, and works out the level
              monthly contribution that closes that gap given the return you expect to earn.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose tuition is $28,000 a year today, college starts in 12 years, the degree takes 4
              years, and tuition rises 5 percent a year. The first year alone inflates to roughly
              $50,000, and the four-year total climbs well past $200,000, far above the $112,000 the
              same four years would cost at today's prices.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Inflation rates and investment returns are assumptions, not guarantees, so revisit the
              numbers every year or two and adjust your saving. For current data on what college
              actually costs, the U.S. Department of Education's{" "}
              <a href="https://collegescorecard.ed.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">College Scorecard</a>{" "}
              is a useful reference. To see how a fixed monthly contribution grows on its own, try our{" "}
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
