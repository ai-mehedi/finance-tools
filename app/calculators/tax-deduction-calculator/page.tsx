import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TaxDeductionCalculator from "./TaxDeductionCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/tax-deduction-calculator";
const SELF_SLUG = "tax-deduction-calculator";

const DESC =
  "Free tax deduction calculator. Compare the 2024 standard deduction against your itemized deductions for mortgage interest, SALT, charity and medical, and see the tax you save.";

const baseMetadata: Metadata = {
  title: "Tax Deduction Calculator",
  description: DESC,
  keywords: [
    "tax deduction calculator",
    "standard vs itemized deduction",
    "itemized deduction calculator",
    "SALT deduction",
    "tax savings calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Tax Deduction Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Tax Deduction Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "Should I take the standard deduction or itemize?",
    answer:
      "Take whichever is larger. If your itemized deductions add up to more than the standard deduction for your filing status, itemizing lowers your taxable income further. If not, the standard deduction is simpler and gives you the bigger break.",
  },
  {
    question: "What counts as an itemized deduction?",
    answer:
      "The most common items are mortgage interest, state and local taxes, charitable donations, and medical expenses above a floor. This calculator totals those four categories, applies the relevant caps, and compares the result with the standard deduction.",
  },
  {
    question: "Why are my state and local taxes capped?",
    answer:
      "Federal law limits the state and local tax, or SALT, deduction to 10,000 dollars per return. Even if you paid more in property and state income tax, only the first 10,000 dollars counts toward your itemized total, which this tool applies automatically.",
  },
  {
    question: "How does a deduction translate into tax saved?",
    answer:
      "A deduction reduces the income you are taxed on, so its value is the deduction amount times your marginal tax rate. For example, a 1,000 dollar deduction for someone in the 22 percent bracket saves about 220 dollars, not the full 1,000 dollars.",
  },
];

export default async function TaxDeductionCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Tax Deduction Calculator",
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
      title="Tax Deduction Calculator"
      intro="Find out whether itemizing beats the standard deduction. Enter your mortgage interest, state and local taxes, charity and medical costs, then press Calculate to compare."
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
            { name: "Tax Deduction Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Tax Deduction Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaxDeductionCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the tax deduction calculator works</H2>
            <P>
              Every taxpayer can lower taxable income by either the flat standard deduction or the sum
              of their itemized deductions, whichever is bigger. The tool adds up your four main
              itemizable categories, applies the SALT cap to state and local taxes and the income floor
              to medical costs, and stacks them against the standard deduction for your filing status.
            </P>
            <P>
              The stacked bar chart shows each itemized category as its own segment, so you can see at
              a glance which expenses are pushing you over the standard deduction line and which barely
              move the needle.
            </P>

            <H2>A quick example</H2>
            <P>
              A single filer with $9,000 of mortgage interest, $12,000 of state and local taxes, $3,000
              in charity and $2,000 of medical bills itemizes to about $22,000 once the SALT cap and
              medical floor are applied. That beats the $14,600 standard deduction, so itemizing saves
              roughly the difference times their marginal rate.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This estimate uses 2024 standard deduction amounts and the common itemized categories, so
              it skips less frequent items and any phase-outs. The tax saved depends on the marginal
              rate you enter. For the full list of allowable deductions, see{" "}
              <a href="https://www.irs.gov/forms-pubs/about-schedule-a-form-1040" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS Schedule A</a>.
              To confirm the bracket to use here, run our{" "}
              <Link href="/calculators/tax-bracket-calculator" className="text-orange-600 underline">tax bracket calculator</Link> first.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40">
                    <span className="text-sm font-bold text-zinc-900">{a.title}</span>
                  </Link>
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
