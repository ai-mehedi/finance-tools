import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MoneyDoublingCalculator from "./MoneyDoublingCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/money-doubling-calculator";
const SELF_SLUG = "money-doubling-calculator";

const DESC =
  "Free money doubling time calculator. Find exactly how many years it takes your investment to double or hit any target multiple at a given return, compare the Rule of 72 and Rule of 69.3, and see the growth on a chart.";

export const metadata: Metadata = {
  title: "Money Doubling Time Calculator",
  description: DESC,
  keywords: [
    "money doubling calculator",
    "rule of 72 calculator",
    "doubling time calculator",
    "how long to double money",
    "investment doubling calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Money Doubling Time Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Money Doubling Time Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How long does it take to double money?",
    answer:
      "The exact answer is the natural log of 2 divided by the natural log of one plus your effective annual return. At eight percent compounded yearly that works out to about nine years, which the calculator computes precisely rather than relying on a shortcut.",
  },
  {
    question: "What is the Rule of 72?",
    answer:
      "The Rule of 72 is a mental shortcut: divide 72 by the annual return percentage to estimate the doubling time. At eight percent it gives nine years, and at six percent twelve years. It is most accurate for rates between roughly six and ten percent.",
  },
  {
    question: "Why does the calculator also show the Rule of 69.3?",
    answer:
      "The number 72 is chosen because it divides cleanly, but the mathematically pure constant for continuous compounding is 69.3, since the natural log of 2 is about 0.693. The 69.3 estimate is more accurate at low rates while 72 is friendlier for quick mental math.",
  },
  {
    question: "Does compounding frequency change the doubling time?",
    answer:
      "Yes. More frequent compounding raises the effective annual rate, so money doubles slightly faster at the same nominal rate. The calculator converts your chosen frequency to an effective rate first, then solves for the exact time.",
  },
];

export default async function MoneyDoublingCalculatorPage() {
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
    "⏳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Money Doubling Time Calculator",
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
      title="Money Doubling Time Calculator"
      intro="See exactly how long your money takes to double, or to reach any multiple you choose. Enter a starting amount, return and compounding, then press Calculate to compare the precise answer with the Rule of 72."
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
            { name: "Money Doubling Time Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Money Doubling Time Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoneyDoublingCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the doubling time calculator works</H2>
            <P>
              Doubling time depends only on the rate of growth, not the size of your starting balance,
              which is why a thousand dollars and a million dollars both double in the same number of
              years at the same return. The tool first converts your nominal rate and compounding choice
              into an effective annual rate, then solves the growth equation for time using natural
              logarithms, so the answer is exact rather than an approximation.
            </P>
            <P>
              Alongside the precise figure it shows two famous shortcuts. The Rule of 72 divides 72 by
              your rate, and the Rule of 69.3 uses the natural log of 2. Lining all three up makes it
              easy to see how close the mental tricks come to the real answer at your chosen rate.
            </P>

            <H2>A quick example</H2>
            <P>
              Put 10,000 dollars to work at eight percent compounded yearly. The Rule of 72 predicts
              doubling in exactly nine years, and the exact formula agrees almost perfectly at roughly
              nine years as well. Push the target to a three times multiple and the same money needs
              about fourteen and a quarter years to reach 30,000 dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The calculation assumes a steady return, but real markets deliver returns that bounce
              around year to year, so treat the result as a planning guide rather than a guarantee. For
              a plain-language primer on compounding from a neutral source, see{" "}
              <a href="https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To project the full dollar balance year by year instead of just the doubling point, use our{" "}
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
