import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RetirementCalculator from "./RetirementCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/retirement-calculator";
const SELF_SLUG = "retirement-calculator";

const DESC =
  "Free retirement calculator. Project your nest egg at retirement from your savings and monthly contributions, then check whether it can fund your target income using a safe withdrawal rate.";

const baseMetadata: Metadata = {
  title: "Retirement Calculator",
  description: DESC,
  keywords: [
    "retirement calculator",
    "retirement savings calculator",
    "nest egg calculator",
    "how much to retire",
    "safe withdrawal rate calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Retirement Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Retirement Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much do I need to retire?",
    answer:
      "A common rule of thumb is to multiply the annual income you want in retirement by 25, which matches a 4 percent withdrawal rate. If you want 60,000 dollars a year, that points to a nest egg near 1.5 million dollars. This calculator does that math for you and compares it against what your current savings plan is projected to reach.",
  },
  {
    question: "What is a safe withdrawal rate?",
    answer:
      "A safe withdrawal rate is the percentage of your nest egg you can take out in the first year of retirement, then adjust for inflation each year, with a strong chance of not running out of money. The well known starting point is 4 percent, based on historical market returns over 30 year retirements. A lower rate is more cautious; a higher rate is riskier.",
  },
  {
    question: "Why does starting early matter so much?",
    answer:
      "Because of compounding. Money invested in your twenties has decades to grow, so each early dollar can become many dollars by retirement, while a dollar saved a few years before retirement barely has time to grow. On the chart you will see the gap between what you paid in and your balance widen dramatically over time, and most of that gap is growth on early contributions.",
  },
  {
    question: "Does this calculator account for inflation?",
    answer:
      "It keeps the comparison in today's dollars by treating your desired income and the return as real, before-inflation style figures, which keeps the result easy to read. For a more precise plan, lower the return you enter by your expected inflation rate to get a rough inflation-adjusted projection, and revisit the numbers every few years.",
  },
];

export default async function RetirementCalculatorPage() {
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
    "🌴"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Retirement Calculator",
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
      title="Retirement Calculator"
      intro="Find out if you are on track to retire. Enter your age, savings and monthly contributions, set the income you want, and press Calculate to project your nest egg and the income it can support."
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
            { name: "Retirement Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Retirement Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RetirementCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the retirement calculator works</H2>
            <P>
              Retirement planning has two halves. First, how big will your savings grow by the day you
              stop working? Second, will that pile actually cover the lifestyle you want once the
              paychecks stop? This tool answers both. It grows your current savings and monthly
              contributions year by year, then converts the projected nest egg into a yearly income
              using the withdrawal rate you choose.
            </P>
            <P>
              The chart traces your balance climbing from today to retirement. The dashed line is the
              money you actually pay in, and the shaded area above it is investment growth. Early on
              they hug each other, but the gap stretches wider every year as compounding takes over,
              which is the whole reason saving sooner beats saving more later.
            </P>

            <H2>A quick example</H2>
            <P>
              A 30 year old with $25,000 saved who adds $600 a month and earns 7 percent a year is
              projected to reach roughly $1.4 million by age 65. At a 4 percent withdrawal rate that
              supports about $56,000 of yearly income. If the goal is $60,000 a year, the tool flags a
              small shortfall, and bumping the monthly contribution up by a hundred dollars or so closes
              the gap.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Markets do not deliver a smooth 7 percent every year, so treat the nest egg as a midpoint,
              not a promise, and revisit your plan regularly. Real plans also juggle Social Security,
              pensions, taxes and healthcare, none of which are modeled here. For unbiased basics on
              saving for retirement, see{" "}
              <a href="https://www.investor.gov/additional-resources/retirement-toolkit" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov's retirement toolkit</a>.
              To pin down a smaller milestone first, our{" "}
              <Link href="/calculators/emergency-fund-calculator" className="text-orange-600 underline">emergency fund calculator</Link>{" "}
              is a good companion.
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
