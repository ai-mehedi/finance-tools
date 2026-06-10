import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CurrencyConverterCalculator from "./CurrencyConverterCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/currency-converter";
const SELF_SLUG = "currency-converter";

const DESC =
  "Free currency converter. Convert between US dollars, euros, pounds, yen and more using clear reference exchange rates, with the rate shown for every pair.";

export const metadata: Metadata = {
  title: "Currency Converter",
  description: DESC,
  keywords: [
    "currency converter",
    "exchange rate converter",
    "convert usd to eur",
    "money converter",
    "foreign exchange calculator",
    "currency calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Currency Converter | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Currency Converter | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does a currency converter work?",
    answer:
      "It multiplies your amount by an exchange rate, the price of one currency in terms of another. This tool converts through the US dollar: it changes your starting currency into dollars, then changes those dollars into the target currency, which keeps every pair consistent.",
  },
  {
    question: "Are these live exchange rates?",
    answer:
      "No. This converter uses fixed reference rates so the result is consistent and predictable. Real market rates move constantly during the day. For an actual transaction, always check the live rate your bank or payment provider will use.",
  },
  {
    question: "Why is the rate I get different from this one?",
    answer:
      "Banks, cards and money apps add a margin or fee on top of the mid-market rate, so the rate you receive is usually a little worse. The gap is how providers make money on currency exchange. Compare a few providers before sending money abroad.",
  },
  {
    question: "What is the mid-market rate?",
    answer:
      "The mid-market rate is the midpoint between the buy and sell prices for a currency pair, often called the real or interbank rate. It is the fairest reference point, but consumers rarely get exactly that rate after fees and spreads are applied.",
  },
];

export default async function CurrencyConverterPage() {
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
    "💱"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Currency Converter",
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
      title="Currency Converter"
      intro="Convert between major world currencies using clear reference rates and see the exchange rate for every pair. Pick your currencies and press Calculate."
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
            { name: "Currency Converter", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Currency Converter" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CurrencyConverterCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the currency converter works</H2>
            <P>
              An exchange rate tells you how much one currency is worth in another. To convert, you
              multiply your amount by the rate for that pair. This tool routes every conversion through
              the US dollar, so converting euros to yen, for example, first turns the euros into dollars
              and then the dollars into yen. That keeps all pairs consistent with one another.
            </P>
            <P>
              The rate shown next to your result is the units of the target currency you get for one
              unit of your starting currency. Flip the from and to fields, or use the swap link, to see
              the reverse rate instantly.
            </P>

            <H2>A quick example</H2>
            <P>
              Convert $100 to euros at a rate of 0.92 euros per dollar and you receive about 92 euros.
              Reverse it and 100 euros at roughly 1.09 dollars per euro comes back to about $109. Small
              differences in the rate add up quickly on larger amounts.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These are fixed reference rates for illustration, not live quotes, and your bank or app
              will add its own margin. Before sending money abroad, compare providers and check the
              live rate. For background on managing money across borders, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a helpful resource. Explore more with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>.
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
