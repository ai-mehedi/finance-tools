import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ProRataSalaryCalculator from "./ProRataSalaryCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/pro-rata-salary-calculator";
const SELF_SLUG = "pro-rata-salary-calculator";

const DESC =
  "Free pro rata salary calculator. Work out the part-time or partial-year pay from a full-time equivalent salary based on the hours or days you actually work.";

const baseMetadata: Metadata = {
  title: "Pro Rata Salary Calculator",
  description: DESC,
  keywords: [
    "pro rata salary calculator",
    "pro rata pay",
    "part time salary calculator",
    "full time equivalent salary",
    "prorated salary",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Pro Rata Salary Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Rata Salary Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What does pro rata salary mean?",
    answer:
      "Pro rata is Latin for 'in proportion'. A pro rata salary is the share of a full-time salary you earn for working less than full time — fewer hours per week, fewer days, or only part of the year. A £40,000 full-time role worked three days a week pays £24,000 pro rata.",
  },
  {
    question: "How do you calculate pro rata pay?",
    answer:
      "Divide the hours (or days) you work by the full-time hours, then multiply by the full-time salary. For example, 20 worked hours ÷ 40 full-time hours = 0.5, and 0.5 × $50,000 = $25,000. The same logic works for a partial year: weeks worked ÷ 52.",
  },
  {
    question: "Is pro rata salary before or after tax?",
    answer:
      "Pro rata is calculated on gross (pre-tax) salary. Tax, pension and other deductions are then applied to the prorated figure exactly as they would be to a full-time wage, so your take-home is lower again.",
  },
  {
    question: "Does pro rata affect holiday and benefits?",
    answer:
      "Usually yes. Paid leave, bonuses and many benefits are also prorated to the fraction you work. A part-timer on 0.6 of full time typically accrues 0.6 of the full-time holiday entitlement.",
  },
];

export default async function ProRataSalaryCalculatorPage() {
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
    "💼"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pro Rata Salary Calculator",
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
      title="Pro Rata Salary Calculator"
      intro="Turn a full-time salary into the pro rata amount for part-time or partial-year work. Enter the full-time salary and the hours, days or weeks you actually work, then press Calculate."
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
            { name: "Pro Rata Salary Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Pro Rata Salary Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProRataSalaryCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the pro rata salary calculator works</H2>
            <P>
              A pro rata salary scales a full-time wage down to the portion you actually work. The
              calculator divides your worked time by the full-time standard to get a fraction — your
              full-time equivalent, or FTE — and multiplies the advertised salary by it. Whether the role
              is quoted by hours per week, days per week, or weeks of the year, the proportion is what
              matters.
            </P>
            <P>
              Job adverts often list a full-time salary even for a part-time post, with the words "pro
              rata" attached. That figure is not what you take home — it is the basis from which your real
              pay is worked out. This tool removes the guesswork and shows the annual, monthly and weekly
              equivalents.
            </P>

            <H2>A quick example</H2>
            <P>
              A role advertised at $50,000 full time, based on a 40-hour week, is offered to you at 24
              hours a week. Your fraction is 24 ÷ 40 = 0.6, so the pro rata salary is 0.6 × $50,000 =
              $30,000 a year, about $2,500 a month before tax. If instead you only work 30 weeks of a
              52-week year, the same logic gives 30 ÷ 52 × $50,000 ≈ $28,846.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Pro rata applies to gross pay; deductions come off afterwards, so confirm your net figure
              with a payslip or our{" "}
              <Link href="/calculators/salary-calculator" className="text-orange-600 underline">salary calculator</Link>.
              Check whether holiday, bonus and pension contributions are also prorated, as they usually
              are. If your pay is quoted hourly instead, the{" "}
              <Link href="/calculators/hourly-to-salary-calculator" className="text-orange-600 underline">hourly to salary calculator</Link>{" "}
              converts in the other direction.
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
