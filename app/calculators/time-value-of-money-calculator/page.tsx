import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TimeValueOfMoneyCalculator from "./TimeValueOfMoneyCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/time-value-of-money-calculator";
const SELF_SLUG = "time-value-of-money-calculator";

const DESC =
  "Free time value of money calculator. Solve for future value, present value, payment or interest rate across any compounding schedule, with a chart of how the balance evolves period by period.";

const baseMetadata: Metadata = {
  title: "Time Value of Money Calculator",
  description: DESC,
  keywords: [
    "time value of money calculator",
    "TVM calculator",
    "present and future value",
    "solve for interest rate",
    "annuity calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Time Value of Money Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Time Value of Money Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What is the time value of money?",
    answer:
      "The time value of money is the idea that a dollar today is worth more than the same dollar in the future, because money you hold now can be invested and earn a return. Five quantities describe it: present value, future value, payment, the interest rate and the number of periods. Know any four and you can solve for the fifth.",
  },
  {
    question: "What does solving for the interest rate tell me?",
    answer:
      "It returns the annual rate that ties your present value, future value, payment and time horizon together. If you put in a starting amount, a target balance and a schedule of deposits, the solved rate is the yearly return you would need to hit that target. The tool finds it by searching for the rate where the projected balance exactly matches your future value.",
  },
  {
    question: "Why does choosing payments at the start of the period change the answer?",
    answer:
      "When payments arrive at the start of each period instead of the end, every deposit earns one extra period of interest. That is called an annuity-due, and it always produces a slightly larger future value or a slightly smaller required payment than an ordinary annuity at the same rate and term.",
  },
  {
    question: "How does compounding frequency affect the result?",
    answer:
      "Periods per year sets how often interest is applied and how often payments occur. At the same nominal annual rate, more frequent compounding produces a higher future value because earnings start compounding sooner. Monthly compounding, for example, edges out annual compounding, and the gap widens with higher rates and longer horizons.",
  },
];

export default async function TimeValueOfMoneyCalculatorPage() {
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
    "⏳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Time Value of Money Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Time Value of Money Calculator"
      intro="Pick any one of future value, present value, payment or interest rate to solve for, fill in the rest, and the calculator works out the missing piece and charts how the balance moves over time."
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
            { name: "Time Value of Money Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Time Value of Money Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TimeValueOfMoneyCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the time value of money calculator works</H2>
            <P>
              Every time value problem connects five numbers: a present value, a future value, a level
              payment, a per-period interest rate and a count of periods. This tool lets you nominate
              one of them as the unknown. For future value, present value and payment it rearranges the
              standard annuity formula directly. For the interest rate it has no closed-form answer, so
              it searches for the rate that makes the projected balance land exactly on your target.
            </P>
            <P>
              The chart traces the balance one period at a time, applying interest and then your payment
              in each step. Watching the curve makes the compounding visible: early periods barely move,
              while the later years climb steeply as earnings begin earning on themselves.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you have 5,000 dollars today, add 200 dollars at the end of every month, and earn
              6 percent a year compounded monthly for 20 years. Solving for future value returns roughly
              112,000 dollars. Switch the unknown to interest rate, keep the same deposits and ask what
              rate reaches a 150,000 dollar target, and the tool reports the precise annual return that
              would be required.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The result assumes a steady rate and steady payments, which real markets rarely deliver, so
              treat it as a planning estimate rather than a guarantee. For a primer on the concept from a
              neutral source, see{" "}
              <a href="https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              If you only need to grow a single lump sum and contributions forward, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link> is a faster starting point.
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
