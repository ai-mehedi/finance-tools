import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SalesTaxCalculator from "./SalesTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/sales-tax-calculator";
const SELF_SLUG = "sales-tax-calculator";

const DESC =
  "Free sales tax calculator. Add sales tax to a pre-tax price or back the tax out of a tax-inclusive total at any rate, with a clear breakdown of net price, tax amount and gross total.";

const baseMetadata: Metadata = {
  title: "Sales Tax Calculator",
  description: DESC,
  keywords: [
    "sales tax calculator",
    "add sales tax",
    "reverse sales tax calculator",
    "tax inclusive price",
    "net price after tax",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Sales Tax Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Sales Tax Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How do I add sales tax to a price?",
    answer:
      "Multiply the pre-tax price by the tax rate written as a decimal to get the tax amount, then add it back to the price. For a 100 dollar item at a 7.25 percent rate, the tax is 7.25 dollars and the total comes to 107.25 dollars. The calculator does this the moment you choose the add tax mode.",
  },
  {
    question: "How do I remove sales tax from a total?",
    answer:
      "Divide the tax-inclusive total by one plus the rate as a decimal to recover the original net price, then subtract that from the total to find the tax. A 107.25 dollar receipt at 7.25 percent divides by 1.0725 to give a 100 dollar net price and 7.25 dollars of tax. This is the reverse, or remove tax, mode.",
  },
  {
    question: "What sales tax rate should I enter?",
    answer:
      "Use the combined rate that applies where the sale takes place, which is often a state rate plus county or city add ons. Rates vary widely across jurisdictions and some items are exempt, so check the rate for the specific location and product category rather than assuming a single national figure.",
  },
  {
    question: "Is sales tax the same as VAT?",
    answer:
      "They are related but not identical. Sales tax is charged once, at the final retail sale to the consumer. A value added tax is collected in stages along the supply chain, with businesses reclaiming the tax they pay. The arithmetic in this tool matches a single stage retail sales tax.",
  },
];

export default async function SalesTaxCalculatorPage() {
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
    name: "Sales Tax Calculator",
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
      title="Sales Tax Calculator"
      intro="Add sales tax to a price or strip it back out of a total. Pick a direction, enter the amount and rate, then press Calculate to see the net price, tax and gross total."
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
            { name: "Sales Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Sales Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the sales tax calculator works</H2>
            <P>
              The tool runs in two directions. In add tax mode it treats your amount as the price
              before tax, multiplies it by the rate to find the tax, and adds the two together for a
              gross total. In remove tax mode it treats your amount as a tax-inclusive total and
              divides by one plus the rate to recover the original net price.
            </P>
            <P>
              The donut underneath splits every dollar of the total into the portion that is the
              product price and the portion that is tax. As the rate climbs, the orange tax slice
              grows, which is a quick way to feel how much of a receipt the tax really represents.
            </P>

            <H2>A quick example</H2>
            <P>
              A 100 dollar purchase at a 7.25 percent rate adds 7.25 dollars of tax for a 107.25
              dollar total. Run it the other way and a 107.25 dollar tax-inclusive total divides by
              1.0725, returning a 100 dollar net price and confirming the same 7.25 dollars of tax.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Combined rates differ by state, county and city, and certain goods like groceries or
              prescriptions are often exempt or taxed differently. The{" "}
              <a href="https://www.usa.gov/state-taxes" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">USA.gov guide to state taxes</a>{" "}
              points to each state authority for the exact figure. If you need to plan around income
              rather than purchases, see our{" "}
              <Link href="/calculators/income-tax-calculator" className="text-orange-600 underline">income tax calculator</Link>.
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
