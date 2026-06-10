import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PensionCalculator from "./PensionCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/pension-calculator";
const SELF_SLUG = "pension-calculator";

const DESC =
  "Free pension calculator. Estimate the annual and monthly income from a defined-benefit pension using your years of service, accrual rate and projected final salary, with an early or late retirement adjustment and an accrual chart.";

const baseMetadata: Metadata = {
  title: "Pension Calculator",
  description: DESC,
  keywords: [
    "pension calculator",
    "defined benefit pension calculator",
    "pension income estimator",
    "final salary pension",
    "retirement pension calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Pension Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Pension Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is a defined-benefit pension calculated?",
    answer:
      "A defined-benefit pension is usually years of service times an accrual rate times your final or average salary. For example 30 years of service at an accrual rate of one and a half percent gives 45 percent of your final salary as an annual pension.",
  },
  {
    question: "What is the accrual rate or multiplier?",
    answer:
      "The accrual rate is the share of salary you earn as pension for each year you are in the scheme. A rate of one sixtieth is about one point six seven percent per year, while one eightieth is one point two five percent per year. A higher rate builds a larger pension for the same service.",
  },
  {
    question: "Why does retiring early reduce my pension?",
    answer:
      "If you take the pension before the scheme's normal retirement age it is paid for longer, so most schemes apply a reduction for each year you draw it early. This tool lowers or raises the benefit by the adjustment percentage you enter for every year away from the normal age.",
  },
  {
    question: "What is a replacement ratio?",
    answer:
      "The replacement ratio is your annual pension divided by your final salary, shown as a percent. It tells you how much of your working income the pension replaces. Many people aim for a total of around two thirds of pre-retirement pay once state and personal savings are added.",
  },
];

export default async function PensionCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pension Calculator",
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
      title="Pension Calculator"
      intro="Estimate the yearly and monthly income from a final-salary pension. Enter your salary, service, accrual rate and retirement age, then press Calculate to see the projected benefit."
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
            { name: "Pension Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Pension Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PensionCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the pension calculator works</H2>
            <P>
              This tool models a defined-benefit, or final-salary, pension. It first projects your
              salary forward to your chosen retirement age using the pay-rise rate you enter, then
              multiplies that final salary by your total accrual, which is years of service times the
              accrual rate. The result is the pension you would receive each year.
            </P>
            <P>
              If your retirement age differs from the scheme's normal age, the tool applies an
              adjustment for each year early or late. The chart traces how the accrued benefit climbs
              year by year as your service and projected salary both grow.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn $60,000 today, expect 2 percent annual raises, and retire at 65 with 30
              years of service at a 1.5 percent accrual rate. Your salary grows to roughly $89,000, and
              30 years times 1.5 percent gives 45 percent of that, an annual pension near $40,000, or
              about $3,300 a month before any timing adjustment.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Real schemes differ on whether they use final or career-average salary, how they index
              payments, and what reductions apply for early retirement, so confirm the rules with your
              provider. For neutral guidance on retirement income, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To plan a separate savings pot alongside the pension, try our{" "}
              <Link href="/calculators/retirement-calculator" className="text-orange-600 underline">retirement calculator</Link>.
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
