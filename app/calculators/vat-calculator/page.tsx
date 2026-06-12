import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import VatCalculator from "./VatCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/vat-calculator";
const SELF_SLUG = "vat-calculator";

const DESC =
  "Free VAT calculator. Add Value Added Tax onto a net price or strip VAT out of a gross price at any rate, and see the net amount, the tax and the gross total split out clearly.";

const baseMetadata: Metadata = {
  title: "VAT Calculator",
  description: DESC,
  keywords: [
    "vat calculator",
    "add vat calculator",
    "remove vat calculator",
    "value added tax calculator",
    "reverse vat calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "VAT Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VAT Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How do I add VAT to a net price?",
    answer:
      "Multiply the net price by one plus the VAT rate written as a decimal. For a 20 percent rate that means multiplying by 1.2, so a net price of 100 becomes a gross price of 120. The VAT portion is the difference, which is 20. This calculator does that for you when you choose the add VAT direction.",
  },
  {
    question: "How do I remove VAT from a gross price?",
    answer:
      "Divide the gross price by one plus the VAT rate as a decimal. For a 20 percent rate you divide by 1.2, so a gross price of 120 gives a net price of 100 and a VAT amount of 20. A common mistake is to subtract 20 percent of the gross, which is wrong because the tax was charged on the smaller net figure, not the gross.",
  },
  {
    question: "What is the difference between VAT and sales tax?",
    answer:
      "VAT is collected in stages along the supply chain, with each business charging tax on its sales and reclaiming the tax on its purchases, so only the value it adds is taxed. Sales tax, common in the United States, is charged once to the final consumer at the point of sale. The headline price math is similar, but the way the tax is administered differs.",
  },
  {
    question: "Which VAT rate should I use?",
    answer:
      "Rates depend on the country and on the type of goods or services. Many countries apply a standard rate, a reduced rate for items like food or books, and a zero rate for exports. Enter whichever rate applies to your transaction. If you are unsure, check the current rate published by your national tax authority.",
  },
];

export default async function VatCalculatorPage() {
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
    name: "VAT Calculator",
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
      title="VAT Calculator"
      intro="Add Value Added Tax onto a net price, or strip it back out of a gross price, at any rate you like. Enter a figure and the VAT rate, then press Calculate to see the net, the tax and the gross."
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
            { name: "VAT Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="VAT Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VatCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the VAT calculator works</H2>
            <P>
              Value Added Tax is charged as a percentage of the price before tax. When you add VAT, the
              tool takes your net figure and multiplies it by one plus the rate to give the gross price
              the customer pays. When you remove VAT, it works in reverse, dividing the gross price by one
              plus the rate to recover the net amount that the tax was actually charged on.
            </P>
            <P>
              The bar shows the split between the part of the price that belongs to the business, the net,
              and the part that belongs to the tax authority, the VAT. Removing VAT correctly matters
              because subtracting the rate from the gross gives a number that is slightly too small.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a designer quotes a net fee of 100 dollars and the applicable VAT rate is 20 percent.
              Adding VAT gives 20 dollars of tax and a gross invoice of 120 dollars. Now imagine you only
              know the gross of 120 dollars and need the net for your records. Dividing 120 by 1.2 returns
              100 dollars net and 20 dollars of VAT, the same split read from the other end.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              VAT rules, registration thresholds and rates vary by country, and some goods are exempt or
              zero rated. For an overview of how the tax works internationally, see the{" "}
              <a href="https://www.oecd.org/tax/consumption/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">OECD consumption tax pages</a>.
              If you need to work out a plain percentage rather than a tax-inclusive price, our{" "}
              <Link href="/calculators/percentage-calculator" className="text-orange-600 underline">percentage calculator</Link> is the quicker route.
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
