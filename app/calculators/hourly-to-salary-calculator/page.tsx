import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import HourlyToSalaryCalculator from "./HourlyToSalaryCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/hourly-to-salary-calculator";
const SELF_SLUG = "hourly-to-salary-calculator";

const DESC =
  "Free hourly to salary calculator. Convert an hourly wage into weekly, biweekly, monthly and annual gross pay based on your hours per week and paid weeks per year, with a pay-by-period chart.";

const baseMetadata: Metadata = {
  title: "Hourly to Salary Calculator",
  description: DESC,
  keywords: [
    "hourly to salary calculator",
    "hourly wage to annual salary",
    "hourly to yearly calculator",
    "convert hourly to salary",
    "annual salary calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Hourly to Salary Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Hourly to Salary Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How do I convert an hourly wage to an annual salary?",
    answer:
      "Multiply your hourly rate by the hours you work each week, then multiply that weekly pay by the number of paid weeks you work in a year. For a full-time job that often means rate times 40 times 52. At 25 dollars an hour that works out to 52,000 dollars a year before taxes.",
  },
  {
    question: "Why does this tool ask for weeks per year?",
    answer:
      "Not everyone is paid for all 52 weeks. If you take two weeks of unpaid time off, you are really earning across 50 paid weeks, which lowers the annual figure. Letting you set the weeks makes the conversion honest for contractors, part-timers and anyone with unpaid leave.",
  },
  {
    question: "Is the result before or after taxes?",
    answer:
      "It is gross pay, meaning before income tax, payroll tax and any benefit deductions. Your take-home pay will be lower once those are withheld. Use this as the starting point, then apply your tax bracket to estimate what actually lands in your account.",
  },
  {
    question: "How is the biweekly amount different from twice the weekly pay?",
    answer:
      "A biweekly paycheck covers two weeks, but the calculator divides the full year into 26 pay periods rather than simply doubling one week. Because a year has slightly more than 52 weeks, spreading the annual total across 26 periods is the cleaner way to match how employers actually pay.",
  },
];

export default async function HourlyToSalaryCalculatorPage() {
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
    "💵"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hourly to Salary Calculator",
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
      title="Hourly to Salary Calculator"
      intro="Turn an hourly wage into a yearly salary and every paycheck in between. Enter your rate, weekly hours and paid weeks, then press Calculate to see weekly, biweekly, monthly and annual gross pay."
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
            { name: "Hourly to Salary Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Hourly to Salary Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlyToSalaryCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the hourly to salary calculator works</H2>
            <P>
              The conversion is straightforward once you fix your schedule. The tool multiplies your
              hourly rate by the hours you work in a week to get weekly pay, then scales that up by the
              number of paid weeks you work in a year for the annual figure. From the annual total it
              derives monthly, biweekly and daily pay so you can match whatever cadence your employer
              uses.
            </P>
            <P>
              Because the weeks-per-year input is yours to set, the result respects unpaid time off.
              Drop from 52 to 50 weeks and the annual number falls accordingly. The bar chart lines up
              each pay period side by side so the relative size of a daily, weekly, biweekly and
              monthly check is easy to see at a glance.
            </P>

            <H2>A worked example</H2>
            <P>
              Take a wage of 25 dollars an hour at 40 hours a week for all 52 weeks. Weekly pay is
              1,000 dollars, the annual salary is 52,000 dollars, monthly pay is about 4,333 dollars,
              and a biweekly paycheck is roughly 2,000 dollars. Cut back to 50 paid weeks and the
              annual figure slips to 50,000 dollars, a clean reminder of what two unpaid weeks cost.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These numbers are gross, before any tax or deduction, so your take-home pay will be
              lower. Overtime, bonuses and shift differentials are not included either. For the current
              federal minimum wage and overtime rules, see the{" "}
              <a href="https://www.dol.gov/general/topic/wages/minimumwage" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Department of Labor</a>.
              To see how much of that salary you could set aside each month, try our{" "}
              <Link href="/calculators/savings-calculator" className="text-orange-600 underline">savings calculator</Link>.
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
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
