import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PropertyTaxEstimator from "./PropertyTaxEstimator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/property-tax-estimator";
const SELF_SLUG = "property-tax-estimator";

const DESC =
  "Free property tax estimator. Enter your assessed value, exemption, and a rate in percent or mills to estimate annual and monthly property tax, your effective rate, and a multi-year projection as values rise.";

const baseMetadata: Metadata = {
  title: "Property Tax Estimator",
  description: DESC,
  keywords: [
    "property tax estimator",
    "property tax calculator",
    "mill rate calculator",
    "annual property tax",
    "homestead exemption",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Property Tax Estimator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Property Tax Estimator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is property tax calculated?",
    answer:
      "Take the assessed value, subtract any exemption, and multiply the remaining taxable value by the tax rate. If the rate is given in mills, divide it by 1,000 first. This estimator does that math and also splits the result into a monthly figure.",
  },
  {
    question: "What is a mill rate?",
    answer:
      "A mill is one dollar of tax for every one thousand dollars of taxable value, so 10 mills equals 1 percent. Many local governments publish their rate in mills. You can switch the rate unit in this tool between percent and mills to match your bill.",
  },
  {
    question: "What does the exemption field do?",
    answer:
      "An exemption, such as a homestead exemption, lowers the value that is actually taxed. Enter the exemption amount and the estimator subtracts it from the assessed value before applying the rate, which reduces the tax you owe.",
  },
  {
    question: "Why does the projected tax rise over the years?",
    answer:
      "If you enter an annual value growth rate, the estimator grows the assessed value each year, so the tax grows with it. This shows how reassessments and rising home values can push your bill higher even when the rate stays the same.",
  },
];

export default async function PropertyTaxEstimatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Property Tax Estimator",
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
      title="Property Tax Estimator"
      intro="Estimate what you will owe on a home or property. Enter the assessed value, any exemption, and a rate in percent or mills to see the annual tax, a monthly figure, your effective rate, and how the bill grows over time."
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
            { name: "Property Tax Estimator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Property Tax Estimator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PropertyTaxEstimator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the property tax estimator works</H2>
            <P>
              The estimator subtracts your exemption from the assessed value to find the taxable value,
              then multiplies it by the rate. Rates can be entered as a percentage or in mills, where one
              mill is a dollar of tax per thousand dollars of value, so the tool converts whichever you choose.
            </P>
            <P>
              Because values rarely hold still, you can add an annual growth rate. The chart then projects
              the tax year by year, with the shaded area showing how a rising assessment can lift your bill
              over a decade even if the local rate never changes.
            </P>

            <H2>A quick example</H2>
            <P>
              On a home assessed at $350,000 with a $25,000 exemption and a 1.1 percent rate, the taxable
              value is $325,000 and the first-year tax is about $3,575, or roughly $298 a month. With 3
              percent annual value growth, that yearly bill climbs steadily across the projection horizon.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Assessed value often differs from market value, and local rules, caps and special levies vary
              widely by area. For how assessments and appeals work, the{" "}
              <a href="https://www.usa.gov/property-taxes" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">USA.gov property tax guide</a>{" "}
              is a neutral starting point. If you are budgeting for a purchase, pair this with our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>.
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
