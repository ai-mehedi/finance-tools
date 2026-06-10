import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import IncomeTaxCalculator from "./IncomeTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/income-tax-calculator";
const SELF_SLUG = "income-tax-calculator";

const DESC =
  "Free income tax calculator. Estimate your U.S. federal income tax from gross pay, filing status and deductions, then see your effective and marginal rates with a bracket-by-bracket chart.";

export const metadata: Metadata = {
  title: "Income Tax Calculator",
  description: DESC,
  keywords: [
    "income tax calculator",
    "federal tax calculator",
    "effective tax rate",
    "tax bracket calculator",
    "take home pay calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Income Tax Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Income Tax Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is federal income tax calculated?",
    answer:
      "Your income is first reduced by deductions to reach taxable income. That figure is then split across tax brackets, and each slice is taxed at its own rate. Adding up the tax from every slice gives the total you owe. This calculator does that step by step using the 2024 brackets.",
  },
  {
    question: "What is the difference between effective and marginal rate?",
    answer:
      "Your marginal rate is the rate applied to your last dollar of income, which is the top bracket you reach. Your effective rate is your total tax divided by your gross income, which is always lower because the early brackets are taxed at smaller rates.",
  },
  {
    question: "Does the standard deduction lower my tax?",
    answer:
      "Yes. The standard deduction is subtracted from your income before any tax is figured, so it directly shrinks the amount that gets taxed. This tool applies the 2024 standard deduction for your filing status automatically, and you can add extra deductions on top.",
  },
  {
    question: "Does this include state taxes or payroll taxes?",
    answer:
      "No. This estimate covers only federal income tax. It does not include state or local income tax, Social Security, or Medicare payroll withholding, so your actual paycheck deductions will be larger than the number shown here.",
  },
];

export default async function IncomeTaxCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Income Tax Calculator",
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
      title="Income Tax Calculator"
      intro="Estimate your federal income tax in seconds. Enter your gross income, pick a filing status, add any extra deductions, then press Calculate to see your tax and effective rate."
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
            { name: "Income Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Income Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the income tax calculator works</H2>
            <P>
              The calculator starts from your gross income and subtracts the standard deduction for
              your filing status, plus any extra deductions you enter. What remains is your taxable
              income, which is then run through the progressive 2024 federal brackets one rate at a
              time. The tax from each bracket is added together to produce your total.
            </P>
            <P>
              The chart breaks the result into bars, one per bracket you reach. It makes the
              progressive system visible: only the income that lands in a higher band is taxed at
              that higher rate, never your whole salary.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a single filer earns 85,000 dollars. After the 14,600 dollar standard deduction,
              taxable income is 70,400 dollars. The first 11,600 dollars is taxed at 10 percent, the
              next chunk at 12 percent, and the rest at 22 percent. The marginal rate is 22 percent,
              but the effective rate lands closer to 13 percent because the lower brackets pull the
              average down.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate of federal income tax only and ignores credits, state tax, and
              payroll withholding, so treat it as a planning figure rather than a filing number. For
              the official brackets and rules, see the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS website</a>.
              To see how a raise affects your monthly cushion, pair this with our{" "}
              <Link href="/calculators/income-vs-expense-calculator" className="text-orange-600 underline">income vs expense calculator</Link>.
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
