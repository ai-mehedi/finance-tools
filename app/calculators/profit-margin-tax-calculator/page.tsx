import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ProfitMarginTaxCalculator from "./ProfitMarginTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/profit-margin-tax-calculator";
const SELF_SLUG = "profit-margin-tax-calculator";

const DESC =
  "Free profit margin with tax calculator. Enter revenue, cost, and a tax rate to see pre-tax profit, tax owed, after-tax profit, and both your pre-tax and after-tax margins side by side.";

const baseMetadata: Metadata = {
  title: "Profit Margin With Tax Calculator",
  description: DESC,
  keywords: [
    "profit margin with tax calculator",
    "after-tax profit margin",
    "net margin after tax",
    "business tax calculator",
    "pre-tax vs after-tax profit",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Profit Margin With Tax Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Profit Margin With Tax Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is after-tax profit margin calculated?",
    answer:
      "First find pre-tax profit by subtracting cost from revenue. Multiply that profit by the tax rate to get the tax, subtract it, then divide the remaining after-tax profit by revenue. That percentage is your after-tax margin, the share of sales you actually keep.",
  },
  {
    question: "Does the tax rate apply to revenue or to profit?",
    answer:
      "Income tax applies to profit, not to total sales. This tool taxes only the pre-tax profit, so if your costs equal your revenue there is no profit and no tax. Sales taxes and payroll taxes work differently and are not modeled here.",
  },
  {
    question: "What happens if the business runs at a loss?",
    answer:
      "When cost is higher than revenue, pre-tax profit is negative and the calculator applies no tax to it. In reality a loss may create a deduction or carryforward, but that depends on your jurisdiction and is outside the scope of this simple estimate.",
  },
  {
    question: "Which tax rate should I enter?",
    answer:
      "Use the effective rate that applies to your business profit, such as a flat corporate rate or your blended marginal rate as a sole proprietor. If you are unsure, estimate with a round figure and treat the after-tax result as a planning guide rather than a filing.",
  },
];

export default async function ProfitMarginTaxCalculatorPage() {
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
    name: "Profit Margin With Tax Calculator",
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
      title="Profit Margin With Tax Calculator"
      intro="Find out what you really keep after tax. Enter revenue, cost, and your tax rate to see pre-tax profit, the tax bite, after-tax profit, and how your margin shrinks once the tax bill is paid."
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
            { name: "Profit Margin With Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Profit Margin With Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfitMarginTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the after-tax margin calculator works</H2>
            <P>
              The calculator subtracts cost from revenue to get pre-tax profit, applies your tax rate to
              that profit, and then divides what is left by revenue. The result is the after-tax margin,
              which is almost always the number that matters most for cash you can actually spend or reinvest.
            </P>
            <P>
              The stacked bar splits every dollar of revenue into three parts: the grey portion that paid
              for cost, the light orange slice claimed by tax, and the solid orange slice you keep. Watching
              the tax slice grow makes it obvious how much a higher rate eats into a healthy-looking margin.
            </P>

            <H2>A quick example</H2>
            <P>
              On $10,000 of sales with $6,500 of cost, pre-tax profit is $3,500, a 35 percent pre-tax margin.
              At a 21 percent tax rate the tax is $735, leaving $2,765 in after-tax profit. That trims the
              margin you keep to roughly 27.7 percent, a meaningful gap from the headline number.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This estimate uses one flat rate on profit and ignores deductions, credits and the difference
              between corporate and personal tax. For current federal rates and rules, check the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS</a>.
              To work out the pre-tax picture first, start with our{" "}
              <Link href="/calculators/profit-margin-calculator" className="text-orange-600 underline">profit margin calculator</Link>.
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
