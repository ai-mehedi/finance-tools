import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BitcoinProfitCalculator from "./BitcoinProfitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/bitcoin-profit-calculator";
const SELF_SLUG = "bitcoin-profit-calculator";

const DESC =
  "Free Bitcoin profit calculator. Work out your profit, loss and ROI on a bitcoin trade from the buy price, sell price, amount invested and trading fees.";

export const metadata: Metadata = {
  title: "Bitcoin Profit Calculator",
  description: DESC,
  keywords: [
    "bitcoin profit calculator",
    "btc profit calculator",
    "bitcoin roi calculator",
    "crypto profit calculator",
    "bitcoin gains calculator",
    "bitcoin investment return",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Bitcoin Profit Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Bitcoin Profit Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is bitcoin profit calculated?",
    answer:
      "First the amount you invested, minus any buy fee, is divided by the buy price to find how much bitcoin you hold. That amount is multiplied by the sell price and reduced by the sell fee to get your proceeds. Profit is proceeds minus your original investment.",
  },
  {
    question: "Do trading fees really matter?",
    answer:
      "Yes. Exchanges usually charge a fee on both the buy and the sell, often around 0.1 to 0.5 percent each. On a round trip those fees stack up and eat into your gains, so this calculator subtracts them on both sides for a realistic figure.",
  },
  {
    question: "What does ROI mean here?",
    answer:
      "ROI, or return on investment, is your profit divided by the amount you put in, shown as a percent. A $1,000 profit on a $5,000 investment is a 20 percent ROI. It lets you compare trades of different sizes on equal footing.",
  },
  {
    question: "Does this account for taxes?",
    answer:
      "No. The result is your pre-tax trading profit. Many countries treat crypto gains as taxable, so your take-home can be lower. Check the rules in your jurisdiction or speak with a tax professional before relying on the number.",
  },
];

export default async function BitcoinProfitCalculatorPage() {
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
    "₿"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bitcoin Profit Calculator",
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
      title="Bitcoin Profit Calculator"
      intro="See your profit, loss and ROI on a bitcoin trade after fees. Enter your buy price, sell price and amount invested, then press Calculate."
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
            { name: "Bitcoin Profit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Bitcoin Profit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BitcoinProfitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the bitcoin profit calculator works</H2>
            <P>
              The calculator treats your trade as a simple round trip. It takes the dollars you invested,
              removes the buy fee, and divides by the buy price to learn exactly how much bitcoin you own.
              Fewer coins than the headline amount, because the fee comes out first.
            </P>
            <P>
              When you sell, those coins are valued at the sell price, then the sell fee is subtracted.
              The money left over is your net proceeds, and the difference between that and your original
              investment is your profit or loss in plain dollars.
            </P>

            <H2>A quick example</H2>
            <P>
              Put in $5,000 at $40,000 per bitcoin with a 0.5 percent buy fee. You hold about 0.1244 BTC.
              Sell at $60,000 with a 0.5 percent sell fee and you net roughly $7,425, a profit of about
              $2,425 and an ROI near 48 percent after fees.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Crypto prices swing hard and past results never guarantee future ones. Gains may be taxable
              too. For balanced guidance on the risks, the{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC investor education site</a>{" "}
              is worth a read. Compare scenarios with our{" "}
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
