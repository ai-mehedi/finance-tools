import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CarLeaseCalculator from "./CarLeaseCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/car-lease-calculator";
const SELF_SLUG = "car-lease-calculator";

const DESC =
  "Free car lease calculator. Estimate your monthly lease payment from the price, residual value, money factor and term, broken down into depreciation, finance and tax.";

const baseMetadata: Metadata = {
  title: "Car Lease Calculator",
  description: DESC,
  keywords: [
    "car lease calculator",
    "lease payment calculator",
    "auto lease calculator",
    "monthly lease payment",
    "money factor calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Car Lease Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Car Lease Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is a car lease payment calculated?",
    answer:
      "A lease payment has two parts. The depreciation charge is the value lost over the term, split monthly, and the finance charge is interest on the car's value. Sales tax is added to that total. This calculator computes all three from your inputs.",
  },
  {
    question: "What is the money factor?",
    answer:
      "The money factor is the lease version of an interest rate. To convert an APR to a money factor, divide by 2400. For example, a 6% APR equals a money factor of 0.0025. A lower money factor means a smaller finance charge each month.",
  },
  {
    question: "What is residual value?",
    answer:
      "Residual value is what the leasing company expects the car to be worth at the end of the lease, usually a percentage of the MSRP. A higher residual means less depreciation to pay for, which lowers your monthly payment.",
  },
  {
    question: "Is leasing cheaper than buying?",
    answer:
      "Leasing often has a lower monthly payment because you only pay for the depreciation during the term, not the whole car. But you own nothing at the end and face mileage limits. Over many years, buying and keeping a car is usually cheaper.",
  },
];

export default async function CarLeaseCalculatorPage() {
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
    "🔑"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Car Lease Calculator",
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
      title="Car Lease Calculator"
      intro="Estimate your monthly lease payment and see how it splits into depreciation, finance charge and tax. Enter the price, residual, money factor and term, then press Calculate."
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
            { name: "Car Lease Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Car Lease Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CarLeaseCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the car lease calculator works</H2>
            <P>
              A lease payment is built from two charges. The depreciation charge is the gap between the
              car's price and its residual value, spread evenly across the months of the lease. The
              finance charge is interest, found by multiplying the sum of the price and residual by the
              money factor. Sales tax is then applied to that combined amount.
            </P>
            <P>
              Your down payment and any trade-in lower the capitalized cost, which reduces the
              depreciation charge. A higher residual percentage also helps, because the car keeps more
              of its value, leaving less for you to pay during the term.
            </P>

            <H2>A quick example</H2>
            <P>
              Lease a $40,000 MSRP car negotiated to $37,000, with $2,500 down, a 55% residual, a 6%
              APR and 36 months. The residual is $22,000 and the capitalized cost is $34,500.
              Depreciation runs about $347 a month, the finance charge about $141, and with 7% tax the
              payment lands near $522 a month.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Real leases add acquisition and disposition fees, mileage limits and wear charges, so
              confirm the full contract before signing. For unbiased guidance on auto financing, see
              the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              Compare leasing against buying with our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
