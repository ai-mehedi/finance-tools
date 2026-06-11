import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ExchangeRateCalculator from "./ExchangeRateCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/exchange-rate-calculator";
const SELF_SLUG = "exchange-rate-calculator";

const DESC =
  "Free exchange rate calculator. Convert any amount between two currencies using a quoted rate, and see how a markup or conversion fee reduces what you actually receive.";

const baseMetadata: Metadata = {
  title: "Exchange Rate Calculator",
  description: DESC,
  keywords: [
    "exchange rate calculator",
    "currency conversion calculator",
    "foreign exchange calculator",
    "fx rate calculator",
    "money conversion calculator",
    "exchange rate with fee",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Exchange Rate Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Exchange Rate Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does an exchange rate work?",
    answer:
      "An exchange rate tells you how many units of one currency you get for one unit of another. If the USD to EUR rate is 0.92, then 1 US dollar buys 0.92 euros, so $100 converts to 92 euros before any fees.",
  },
  {
    question: "What is the difference between the rate and the effective rate?",
    answer:
      "The quoted rate is the headline price of one currency in another. The effective rate is what you actually get after a markup or conversion fee is subtracted. A 1% fee on a 0.92 rate gives an effective rate closer to 0.9108, which is the figure that matters for your wallet.",
  },
  {
    question: "Why is the rate I get worse than the one I see online?",
    answer:
      "Published mid-market rates are wholesale prices banks trade at. Retail providers add a margin, a flat fee or both, so the rate you receive is usually a little worse. Enter that markup in the fee field to see the realistic amount you will receive.",
  },
  {
    question: "How do I reverse a conversion?",
    answer:
      "To convert the other way, use the inverse rate. If 1 USD equals 0.92 EUR, then 1 EUR equals 1 divided by 0.92, or about 1.087 USD. The calculator shows this inverse rate beneath the result.",
  },
];

export default async function ExchangeRateCalculatorPage() {
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
    name: "Exchange Rate Calculator",
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
      title="Exchange Rate Calculator"
      intro="Convert an amount between two currencies using a quoted rate, and see how a markup or conversion fee changes what you actually receive. Enter your numbers and press Calculate."
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
            { name: "Exchange Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Exchange Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExchangeRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the exchange rate calculator works</H2>
            <P>
              Converting money is simple multiplication. The calculator takes your amount in the source
              currency and multiplies it by the exchange rate to get the value in the target currency.
              If you add a fee or markup, it subtracts that from the result so you see the realistic
              amount you would actually receive, not just the textbook figure.
            </P>
            <P>
              It also shows the effective rate, which folds the fee back into a single number you can
              compare across providers, and the inverse rate, so you can quickly convert in the other
              direction.
            </P>

            <H2>A quick example</H2>
            <P>
              Convert $1,000 to euros at a rate of 0.92 with a 1% conversion fee. The raw conversion is
              920 euros, the fee is about 9.20 euros, and you receive roughly 910.80 euros. That works
              out to an effective rate near 0.9108 per dollar.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Live rates move constantly, so use a current quote for anything important. Providers
              differ in how they charge, some build the margin into the rate and some add a separate
              fee. For mid-market reference rates, the{" "}
              <a href="https://www.federalreserve.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Federal Reserve</a>{" "}
              publishes daily figures. Browse all of our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link> for more.
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
