import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import HourlyRateCalculator from "./HourlyRateCalculator";
import ShareButtons from "../../components/ShareButtons";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/hourly-rate-calculator";
const SELF_SLUG = "hourly-rate-calculator";

const DESC =
  "Free hourly rate calculator. Convert any wage or salary between hourly, daily, weekly, monthly and yearly pay based on your working hours.";

const baseMetadata: Metadata = {
  title: "Hourly Rate Calculator",
  description: DESC,
  keywords: [
    "hourly rate calculator",
    "salary to hourly",
    "hourly to salary",
    "wage calculator",
    "pay calculator",
    "convert salary to hourly",
    "annual salary to hourly rate",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    title: "Hourly Rate Calculator | TopicDrill",
    description: DESC,
  },
  twitter: {
    card: "summary",
    title: "Hourly Rate Calculator | TopicDrill",
    description: DESC,
  },
};

const FAQ = [
  {
    question: "How do you convert a yearly salary to an hourly rate?",
    answer:
      "Divide the annual salary by the number of paid hours you work in a year. Paid hours equal your hours per week multiplied by the weeks you work per year. For example, $52,000 a year at 40 hours a week for 52 weeks is 2,080 hours, which works out to $25 per hour.",
  },
  {
    question: "How many work hours are in a year?",
    answer:
      "A common full-time figure is 2,080 hours, which is 40 hours a week times 52 weeks. If you take unpaid time off, lower the weeks per year. At 48 paid weeks you would use 1,920 hours instead.",
  },
  {
    question: "Does this calculator account for taxes?",
    answer:
      "No. It shows gross pay before income tax, deductions and benefits. Your take-home pay will be lower depending on your tax bracket and withholdings.",
  },
  {
    question: "Should freelancers use this rate directly?",
    answer:
      "Not exactly. Freelancers should add self-employment taxes, unpaid admin time, software, insurance and downtime, so their billable hourly rate is usually well above an equivalent employee wage.",
  },
];

export default async function HourlyRateCalculatorPage() {
  // Pull related calculators and guides for internal linking, plus this tool's icon.
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
    "🧮"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hourly Rate Calculator",
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
      title="Hourly Rate Calculator"
      intro="Convert any wage or salary into hourly, daily, weekly, monthly and yearly pay. Enter an amount, pick its period, set your schedule and press Calculate."
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
            { name: "Hourly Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Hourly Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <HourlyRateCalculator />

          {/* Ad 1 — banner below the calculator */}
          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the hourly rate calculator works</H2>
            <P>
              The calculator converts your pay into a single yearly figure, then breaks it back down
              into every period. The key number is your paid hours per year, which is your hours per
              week multiplied by the weeks you work per year. A standard full-time schedule of 40
              hours across 52 weeks gives 2,080 paid hours.
            </P>
            <P>
              From there the math is simple: hourly pay is the yearly amount divided by those paid
              hours, weekly pay is the yearly amount divided by weeks worked, monthly pay is the
              yearly amount divided by 12, and daily pay is the weekly amount divided by days worked
              per week.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you earn $25 per hour, work 40 hours a week, 5 days a week, for 52 weeks. That is
              2,080 hours a year, so your gross pay is $52,000 a year, roughly $4,333 a month, $1,000
              a week and $200 a day. Change any input and press Calculate to update every figure.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These results are gross pay, before tax and deductions. For tax guidance see the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS</a>{" "}
              or your local tax authority. If you are self-employed, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              has useful budgeting resources, and remember to add taxes, expenses and unpaid time to
              set a sustainable billable rate. You can also browse all our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free financial calculators</Link>{" "}
              for more tools.
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

          {/* Related guides */}
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

          {/* Ad 2 — banner at the end of the content */}
          <div className="mt-10">
            <AdSlot minHeight={120} />
          </div>
        </div>

        {/* Sidebar */}
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

          {/* Ad 3 — sticky side banner */}
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
