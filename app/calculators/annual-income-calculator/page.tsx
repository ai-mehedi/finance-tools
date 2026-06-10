import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import AnnualIncomeCalculator from "./AnnualIncomeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/annual-income-calculator";
const SELF_SLUG = "annual-income-calculator";

const DESC =
  "Free annual income calculator. Convert any pay rate, hourly, daily, weekly or monthly, into yearly income, and back into monthly, weekly, daily and hourly figures.";

const baseMetadata: Metadata = {
  title: "Annual Income Calculator",
  description: DESC,
  keywords: [
    "annual income calculator",
    "yearly income calculator",
    "hourly to annual salary",
    "convert pay to annual income",
    "income calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Annual Income Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Annual Income Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How do I calculate my annual income?",
    answer:
      "Multiply your pay rate by how often you are paid across a full year. For hourly pay, multiply your hourly rate by the hours you work each week and by the weeks you work per year. This calculator does that for any pay period you choose.",
  },
  {
    question: "How many work hours are in a year?",
    answer:
      "A standard full-time schedule of 40 hours a week over 52 weeks is 2,080 hours a year. If you take unpaid time off, lower the weeks per year so the total reflects the hours you are actually paid for.",
  },
  {
    question: "Is this gross or net income?",
    answer:
      "These figures are gross income, before taxes and deductions. Your take-home pay will be lower once income tax, payroll taxes and any benefits are withheld. Use a take-home or paycheck calculator to estimate the net amount.",
  },
  {
    question: "How do I convert an hourly wage to a yearly salary?",
    answer:
      "Choose the hourly option, enter your rate, and set your hours per week and weeks per year. The annual figure is your rate times total paid hours. For example, $25 an hour at 40 hours over 52 weeks is $52,000 a year.",
  },
];

export default async function AnnualIncomeCalculatorPage() {
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
    name: "Annual Income Calculator",
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
      title="Annual Income Calculator"
      intro="Convert any pay rate into yearly income, and see it broken down into monthly, weekly, daily and hourly figures. Enter your pay and schedule, then press Calculate."
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
            { name: "Annual Income Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Annual Income Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnnualIncomeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the annual income calculator works</H2>
            <P>
              The calculator first turns your pay into a single yearly figure, then divides that
              total back down into every common cadence. That way you can compare an hourly rate, a
              monthly salary and a weekly paycheck on equal terms, all from one entry.
            </P>
            <P>
              Your work schedule matters. Hours per week, days per week and weeks per year decide how
              an hourly or daily rate scales up to a year. Adjusting weeks per year is the easiest way
              to account for unpaid time off.
            </P>

            <H2>A quick example</H2>
            <P>
              Earn $25 an hour, work 40 hours a week and are paid for 52 weeks. That is 2,080 paid
              hours, so your annual income is $52,000. Split back down, that is about $4,333 a month,
              $1,000 a week and $200 a day.
            </P>

            <H2>Gross vs take-home pay</H2>
            <P>
              These numbers are gross, before any tax. What lands in your account is lower once income
              tax and payroll taxes are withheld. To estimate the net figure, try a take-home pay tool
              and review the basics at the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS</a>.
              You can also explore our{" "}
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
