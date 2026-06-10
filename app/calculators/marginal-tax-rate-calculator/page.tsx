import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MarginalTaxRateCalculator from "./MarginalTaxRateCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/marginal-tax-rate-calculator";
const SELF_SLUG = "marginal-tax-rate-calculator";

const DESC =
  "Free marginal tax rate calculator. Enter your taxable income and filing status to see the rate on your next dollar, your effective rate, total tax owed and the tax paid in each bracket.";

const baseMetadata: Metadata = {
  title: "Marginal Tax Rate Calculator",
  description: DESC,
  keywords: [
    "marginal tax rate calculator",
    "effective tax rate",
    "tax bracket calculator",
    "federal income tax brackets",
    "income tax calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Marginal Tax Rate Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Marginal Tax Rate Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a marginal tax rate?",
    answer:
      "Your marginal tax rate is the rate applied to your last dollar of taxable income, in other words the rate on the next dollar you earn. In a progressive system only the income that falls inside the top bracket you reach is taxed at that rate, not your whole income.",
  },
  {
    question: "How is the marginal rate different from the effective rate?",
    answer:
      "The marginal rate is the rate on your highest band of income, while the effective rate is your total tax divided by your total taxable income. The effective rate is always lower than the marginal rate because the first bands of income are taxed at lower rates.",
  },
  {
    question: "Does earning more push all my income into a higher bracket?",
    answer:
      "No. Only the portion of income above each threshold is taxed at the higher rate. Moving into a new bracket raises the rate on the extra income only, so a raise always leaves you with more after-tax money than before.",
  },
  {
    question: "Which brackets does this calculator use?",
    answer:
      "It uses illustrative 2024 federal ordinary-income brackets for single, married filing jointly and head of household. It works from taxable income, meaning income after deductions, and does not include state taxes, payroll taxes or credits, so treat the result as an estimate.",
  },
];

export default async function MarginalTaxRateCalculatorPage() {
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
    name: "Marginal Tax Rate Calculator",
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
      title="Marginal Tax Rate Calculator"
      intro="See the tax rate on your next dollar of income. Enter your taxable income and filing status, then press Calculate to view your marginal rate, effective rate and the tax owed in each bracket."
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
            { name: "Marginal Tax Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Marginal Tax Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarginalTaxRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the marginal tax rate calculator works</H2>
            <P>
              A progressive tax system slices your income into bands and taxes each band at its own
              rate. This tool walks up the brackets for your filing status, taxes only the income that
              lands in each band, and adds the pieces together to get your total tax. The highest band
              you reach sets your marginal rate, while the average across all your income is your
              effective rate.
            </P>
            <P>
              The bar chart breaks the bill down band by band, so you can see how the lower brackets
              cost relatively little and most of the tax tends to come from the middle bands once
              income climbs.
            </P>

            <H2>A quick example</H2>
            <P>
              A single filer with 85,000 dollars of taxable income reaches the 22 percent bracket, so
              their marginal rate is 22 percent. Yet the first chunks of income were taxed at 10 and 12
              percent, which pulls the effective rate down to roughly 17 percent. The next dollar earned
              is taxed at 22 percent, not the whole 85,000 dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This estimate uses federal brackets and taxable income only, so it leaves out state tax,
              payroll tax, credits and the standard deduction. For the official current brackets and
              rules, check the IRS at{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS.gov</a>.
              To see how pre-tax retirement contributions can lower the income these brackets apply to,
              try our{" "}
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

export async function generateMetadata(): Promise<Metadata> {
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
