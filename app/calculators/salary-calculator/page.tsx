import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SalaryCalculator from "./SalaryCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/salary-calculator";
const SELF_SLUG = "salary-calculator";

const DESC =
  "Free salary calculator. Convert any pay rate between hourly, daily, weekly, biweekly, monthly and annual using your hours and days worked, with a chart comparing each paycheck.";

const baseMetadata: Metadata = {
  title: "Salary Calculator",
  description: DESC,
  keywords: [
    "salary calculator",
    "hourly to salary calculator",
    "annual salary calculator",
    "pay period converter",
    "hourly wage calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Salary Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Salary Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How do you convert an hourly wage to an annual salary?",
    answer:
      "Multiply your hourly rate by the hours you work each week, then multiply that by 52 weeks. For example, 30 dollars an hour at 40 hours a week is 30 times 40 times 52, which equals 62,400 dollars a year before tax.",
  },
  {
    question: "Why does the calculator ask for hours and days per week?",
    answer:
      "Hours per week set the bridge between hourly pay and yearly pay, while days per week let it work out a daily rate. Part-time, compressed or shift schedules change both numbers, so entering your real hours and days keeps every conversion accurate.",
  },
  {
    question: "Is the salary shown before or after tax?",
    answer:
      "All figures are gross pay, meaning before income tax, Social Security, Medicare, retirement contributions and benefits are taken out. Your take-home pay will be lower once those deductions are applied.",
  },
  {
    question: "What is the difference between biweekly and semi-monthly pay?",
    answer:
      "Biweekly pay arrives every two weeks, giving 26 paychecks a year. Semi-monthly pay arrives twice a month, giving 24 paychecks a year. Because the count differs, the same annual salary produces a slightly larger semi-monthly check.",
  },
];

export default async function SalaryCalculatorPage() {
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
    "💼"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salary Calculator",
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
      title="Salary Calculator"
      intro="Turn any pay rate into every other one. Enter what you earn for one period, set your hours and days per week, then press Calculate to see hourly, weekly, monthly and annual pay side by side."
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
            { name: "Salary Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Salary Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalaryCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the salary calculator works</H2>
            <P>
              Pay is quoted in many ways, but they all describe the same yearly amount. The tool first
              reduces whatever you enter to an annual figure, using your hours per week to bridge from
              an hourly rate and your days per week to find a daily rate. From that single annual number
              it then divides back out into every other period.
            </P>
            <P>
              That is why the same salary produces a larger semi-monthly check than a biweekly one: a
              year has 24 semi-monthly periods but 26 biweekly periods, so each semi-monthly paycheck
              carries a bit more. The bar chart lets you compare those paychecks at a glance.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you earn 30 dollars an hour, work 40 hours over 5 days a week. The calculator returns
              an annual salary of 62,400 dollars, about 5,200 dollars a month, roughly 2,400 dollars
              every two weeks, 1,200 dollars a week and 240 dollars a day. Drop your hours to 30 a week
              and the annual figure falls to 46,800 dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These are gross numbers. Federal and state income tax, Social Security and Medicare, plus
              any retirement or health deductions, all reduce what lands in your account. For a sense of
              typical wages by occupation, see the{" "}
              <a href="https://www.bls.gov/oes/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Bureau of Labor Statistics wage data</a>.
              To estimate the tax bite on a one-off payment, try our{" "}
              <Link href="/calculators/bonus-calculator" className="text-orange-600 underline">bonus calculator</Link>.
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
