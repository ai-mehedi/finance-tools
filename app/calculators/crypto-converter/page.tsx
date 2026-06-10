import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CryptoConverter from "./CryptoConverter";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/crypto-converter";
const SELF_SLUG = "crypto-converter";

const DESC =
  "Free crypto converter. Convert any amount between Bitcoin, Ethereum and other coins, or to and from US dollars, euros and pounds, with the exchange rate and USD value shown side by side.";

export const metadata: Metadata = {
  title: "Crypto Converter",
  description: DESC,
  keywords: [
    "crypto converter",
    "bitcoin to usd converter",
    "crypto to fiat",
    "eth to usd",
    "coin conversion calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Crypto Converter | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Crypto Converter | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does the crypto converter work?",
    answer:
      "Every asset is priced in US dollars, so the converter first turns your amount into a dollar value using the source price, then divides by the target price to express it in the target asset. That single bridge lets it convert coin to coin, coin to currency or currency to coin.",
  },
  {
    question: "Are the conversion rates live?",
    answer:
      "No. The tool uses static reference prices so the result stays consistent and loads instantly. They are close to typical market levels but will drift over time, so always confirm the current price on an exchange before you trade or send funds.",
  },
  {
    question: "Can I convert between two cryptocurrencies?",
    answer:
      "Yes. Pick one coin as the source and another as the target, and the converter routes through the dollar value of each. For example one Bitcoin can be expressed in Ethereum, and the rate line shows how many of one equal a single unit of the other.",
  },
  {
    question: "Why does the dollar value not change when I swap the assets?",
    answer:
      "Swapping flips which asset is the source and which is the target, but the underlying dollar worth of your holding is the same either way. What changes is the unit you read the answer in, while the value in USD line stays the anchor.",
  },
];

export default async function CryptoConverterPage() {
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
    "🔁"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Crypto Converter",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Crypto Converter"
      intro="Convert between coins and currencies in one step. Enter an amount, choose what to convert from and to, then press Calculate to see the converted figure, the rate and the dollar value."
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
            { name: "Crypto Converter", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this tool</p>
        <ShareButtons url={abs(PATH)} title="Crypto Converter" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CryptoConverter />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the crypto converter works</H2>
            <P>
              Behind the scenes every coin and currency is quoted against the US dollar. To convert
              from one asset to another, the tool multiplies your amount by the source price to find
              its dollar worth, then divides by the target price. Because the dollar acts as a common
              bridge, the same logic handles coin to coin, coin to cash and cash to coin without any
              special cases.
            </P>
            <P>
              The bar chart on the right gives a quick sense of scale, plotting the dollar price of a
              single unit of each coin. The two assets you are converting are highlighted in deep
              orange so you can spot how far apart their unit prices sit.
            </P>

            <H2>A worked example</H2>
            <P>
              Convert 2 ETH to US dollars with Ethereum at $2,400. The tool finds the dollar value,
              2 times $2,400, which is $4,800, and since the target is the dollar the answer is simply
              $4,800. Flip the conversion and 4,800 dollars buys exactly 2 ETH, with the rate line
              confirming that one ETH equals 2,400 dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Real prices move every second and exchanges add spreads and fees, so treat these
              reference rates as a guide rather than a quote. For live market data from a neutral
              source, see{" "}
              <a href="https://www.coingecko.com" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CoinGecko</a>.
              Once you know your average entry, you can track gains with our{" "}
              <Link href="/calculators/crypto-average-calculator" className="text-orange-600 underline">crypto average buy calculator</Link>.
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>}
                    </div>
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
                    <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
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
