import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PropertyTaxCalculator from "./PropertyTaxCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/property-tax-calculator";
const SELF_SLUG = "property-tax-calculator";

const DESC =
  "Free property tax calculator. Estimate your annual and monthly property tax from a home's market value, assessment ratio, exemptions and tax rate or mill rate, with a multi-year projection.";

const baseMetadata: Metadata = {
  title: "Property Tax Calculator",
  description: DESC,
  keywords: [
    "property tax calculator",
    "property tax estimator",
    "annual property tax",
    "mill rate calculator",
    "home property tax",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Property Tax Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Tax Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How is property tax calculated?",
    answer:
      "Property tax is the taxable value of your home multiplied by the local tax rate. The taxable value is usually your home's market value times an assessment ratio, minus any exemptions. So if a $350,000 home is assessed at 100 percent with a $25,000 exemption and a 1.1 percent rate, the tax is ($350,000 − $25,000) × 1.1% = $3,575 a year.",
  },
  {
    question: "What is a mill rate?",
    answer:
      "A mill is one dollar of tax per $1,000 of taxable value, so a mill rate of 11 mills equals 1.1 percent. Many counties quote rates in mills rather than percent. This calculator accepts either — switch the rate type and enter the number exactly as your assessor states it.",
  },
  {
    question: "What is an assessment ratio?",
    answer:
      "Some jurisdictions tax only a fraction of a home's market value. An assessment ratio of 80 percent means a $400,000 home is assessed at $320,000 before the rate is applied. If your area taxes full market value, leave the ratio at 100 percent.",
  },
  {
    question: "Why does my real tax bill differ from this estimate?",
    answer:
      "This is an estimate. Actual bills can include special district levies, school or municipal add-ons, and exemptions that vary by owner (homestead, senior, veteran, disability). Always confirm the exact figure with your county assessor or tax collector.",
  },
];

export default async function PropertyTaxCalculatorPage() {
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
    "🏡"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Property Tax Calculator",
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
      title="Property Tax Calculator"
      intro="Estimate the property tax on a home. Enter the market value, assessment ratio, any exemption and your local rate or mill rate, then press Calculate to see the annual and monthly bill plus a multi-year projection."
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
            { name: "Property Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Property Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PropertyTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the property tax calculator works</H2>
            <P>
              Property tax is a yearly charge levied by your local government on the value of real
              estate you own. The bill comes from three numbers: the assessed value of your home, any
              exemptions that lower it, and the tax rate set by your county, city and school district.
              This calculator takes your market value, applies the assessment ratio to get the assessed
              value, subtracts your exemption to reach the taxable value, and multiplies by the rate.
            </P>
            <P>
              Rates are quoted two ways. A percentage rate is applied directly to taxable value, while a
              mill rate charges one dollar per $1,000 of value — eleven mills and 1.1 percent are the same
              thing. Pick whichever your assessor uses so the estimate matches your statement.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose your home has a market value of $350,000, your county assesses at full value, you
              qualify for a $25,000 homestead exemption, and the combined rate is 1.1 percent. The taxable
              value is $325,000, so the annual tax is about $3,575, or roughly $298 a month. Raise the
              appreciation assumption and the projection chart shows how the bill drifts up as your home
              gains value over the years.
            </P>

            <H2>Ways to lower a property tax bill</H2>
            <P>
              Check that your assessed value is accurate — assessors make mistakes, and you can appeal an
              over-assessment. Claim every exemption you qualify for, such as homestead, senior, veteran or
              disability relief. For the official rules in your area, your county assessor's website is the
              authority. Once you know the annual cost, our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>{" "}
              can fold it into a full monthly housing payment.
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
