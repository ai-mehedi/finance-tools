import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SalaryToHourlyCalculator from "./SalaryToHourlyCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/salary-to-hourly-calculator";
const SELF_SLUG = "salary-to-hourly-calculator";

const DESC =
  "Free salary to hourly calculator. Convert an annual, monthly or weekly salary into an equivalent hourly wage based on your hours per week and weeks worked per year, with a chart of rate versus hours.";

const baseMetadata: Metadata = {
  title: "Salary to Hourly Calculator",
  description: DESC,
  keywords: [
    "salary to hourly calculator",
    "annual salary to hourly",
    "hourly wage calculator",
    "convert salary to hourly",
    "pay rate calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Salary to Hourly Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Salary to Hourly Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How do you convert an annual salary to an hourly rate?",
    answer:
      "Divide the yearly salary by the number of hours you actually work in a year. Hours per year equals hours worked each week times the number of weeks you work. For a full time schedule of 40 hours across 52 weeks, that is 2,080 hours, so a 65,000 dollar salary works out to about 31.25 dollars per hour.",
  },
  {
    question: "Should I use 52 weeks or fewer when converting?",
    answer:
      "Use the weeks you are actually paid to work. If you take two weeks of unpaid leave, set weeks per year to 50 so the hourly figure reflects real working time. Salaried roles usually keep paid vacation, so 52 weeks is a fair default, but adjust it to match your situation.",
  },
  {
    question: "Does this account for overtime or extra hours?",
    answer:
      "No. The result is a simple average rate that spreads your fixed salary across the hours you enter. If you regularly work more hours than your contract assumes, your true hourly value falls, which is exactly why raising the hours per week in the calculator lowers the rate.",
  },
  {
    question: "Is the hourly figure before or after tax?",
    answer:
      "It is a gross figure, before income tax, payroll deductions and benefits. Your take home pay per hour will be lower once those are removed, but gross is the right number to compare against quoted hourly job offers, which are also stated before tax.",
  },
];

export default async function SalaryToHourlyCalculatorPage() {
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
    "⏱️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salary to Hourly Calculator",
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
      title="Salary to Hourly Calculator"
      intro="Turn a yearly, monthly or weekly salary into the hourly wage it really represents. Enter your pay, hours per week and weeks per year, then press Calculate."
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
            { name: "Salary to Hourly Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Salary to Hourly Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalaryToHourlyCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the salary to hourly calculator works</H2>
            <P>
              A salary is a fixed annual figure, but an hourly wage depends on how many hours that
              salary has to cover. The tool first converts whatever period you pick into a yearly
              amount, then divides by your total working hours for the year, which is your weekly
              hours multiplied by the number of weeks you work.
            </P>
            <P>
              The chart makes the trade off visible. Holding the salary fixed, it plots the hourly
              rate against a range of weekly hours. The line slopes downward because the same pay
              spread over more hours is worth less per hour, a useful check before agreeing to a
              heavier schedule.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn 65,000 dollars a year and work 40 hours a week across all 52 weeks.
              That is 2,080 hours, so each hour is worth about 31.25 dollars. Bump the schedule to 50
              hours a week and the same salary now buys 2,600 hours of your time, dropping the rate to
              roughly 25 dollars an hour.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The result is a gross average and ignores overtime premiums, bonuses and the value of
              benefits like health coverage or retirement matching. For the federal rules on minimum
              wage and overtime, see the{" "}
              <a href="https://www.dol.gov/agencies/whd/flsa" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Department of Labor</a>.
              To go the other direction and price up an hourly rate into a salary, use our{" "}
              <Link href="/calculators/hourly-to-salary-calculator" className="text-orange-600 underline">hourly to salary calculator</Link>.
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
