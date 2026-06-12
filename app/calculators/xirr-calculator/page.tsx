import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import XirrCalculator from "./XirrCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/xirr-calculator";
const SELF_SLUG = "xirr-calculator";

const DESC =
  "Free XIRR calculator. Find the true annualized return on investments with deposits and withdrawals made on irregular dates, with a cumulative cash-flow chart.";

const baseMetadata: Metadata = {
  title: "XIRR Calculator",
  description: DESC,
  keywords: [
    "xirr calculator",
    "xirr return calculator",
    "annualized return calculator",
    "irregular cash flow return",
    "mutual fund xirr",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "XIRR Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "XIRR Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What is XIRR and how is it different from CAGR?",
    answer:
      "XIRR is the extended internal rate of return. It is the single annualized rate that makes the present value of every dated cash flow add up to zero. Unlike CAGR, which only looks at a starting and ending value, XIRR accounts for the exact timing and size of each deposit and withdrawal, so it works when you invest at many different dates.",
  },
  {
    question: "Why are some amounts negative and others positive?",
    answer:
      "Money that leaves your pocket and goes into the investment is an outflow, entered as a negative number. Money that comes back to you, such as a redemption, dividend or sale, is an inflow, entered as a positive number. You need at least one negative and one positive amount for a return to exist.",
  },
  {
    question: "How does this calculator find the XIRR?",
    answer:
      "It discounts each cash flow back to the first date using an actual divided by 365 day count, then searches for the rate that drives the total to zero. It uses the Newton method first and falls back to a bisection search if needed, so even unusual cash-flow patterns resolve to a stable answer.",
  },
  {
    question: "Can XIRR be negative or very large?",
    answer:
      "Yes. If you received back less than you put in, the XIRR is negative. If gains arrived quickly relative to the money invested, the annualized figure can be large. A short holding period magnifies the rate in both directions because the result is always expressed on a yearly basis.",
  },
];

export default async function XirrCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "XIRR Calculator",
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
      title="XIRR Calculator"
      intro="Measure the real annualized return on an investment funded by deposits and withdrawals on different dates. Add each dated cash flow, then press Calculate to get the XIRR."
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
            { name: "XIRR Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="XIRR Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <XirrCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the XIRR calculator works</H2>
            <P>
              XIRR answers a question a simple percentage cannot: when you fund an investment with
              several deposits and pull money out at different times, what single yearly rate ties the
              whole story together? The tool treats every line you enter as a dated cash flow and finds
              the rate at which all of them, discounted back to the first date, cancel out to zero.
            </P>
            <P>
              Because the timing of each flow is built into the math, a dollar invested early counts
              more than a dollar invested late. The cumulative chart below the results traces your
              running cash position, starting deep in the negative as you invest and climbing above
              zero once the inflows arrive.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you invest 10,000 dollars at the start of 2021, add 5,000 dollars that July and
              another 5,000 dollars in January 2022, then redeem the whole holding for 26,000 dollars in
              January 2024. You put in 20,000 dollars and took out 26,000 dollars, but because the money
              went in at three different times the plain 30 percent total gain does not describe the
              yearly rate. The XIRR works out to roughly 14 percent a year, which is the figure you can
              fairly compare against other investments.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              XIRR assumes any returned cash could be reinvested at the same rate, so for very lumpy cash
              flows treat it as a comparison tool rather than a literal forecast. For the formal
              definition of internal rate of return, see{" "}
              <a href="https://en.wikipedia.org/wiki/Internal_rate_of_return" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">this overview of IRR</a>.
              If your contributions are equal and evenly spaced, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              may be a simpler fit.
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
