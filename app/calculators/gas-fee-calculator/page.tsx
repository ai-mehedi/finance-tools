import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import GasFeeCalculator from "./GasFeeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/gas-fee-calculator";
const SELF_SLUG = "gas-fee-calculator";

const DESC =
  "Free Ethereum gas fee calculator. Estimate a transaction fee in ETH and USD from the gas limit, base fee and priority tip in gwei, with a base fee versus tip breakdown.";

const baseMetadata: Metadata = {
  title: "Gas Fee Calculator",
  description: DESC,
  keywords: [
    "gas fee calculator",
    "ethereum gas calculator",
    "eth transaction fee",
    "gwei to usd",
    "gas price calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Gas Fee Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Gas Fee Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is an Ethereum gas fee calculated?",
    answer:
      "The fee equals the gas limit multiplied by the gas price. Gas price is quoted in gwei, and one gwei is one billionth of an ETH. So fee in ETH = gas units times gas price in gwei, divided by 1,000,000,000.",
  },
  {
    question: "What is the difference between base fee and priority tip?",
    answer:
      "Under EIP-1559, every transaction pays a base fee set by the network plus a priority tip you choose to reward validators. The base fee is burned, the tip is paid out. Total gas price is base fee plus tip.",
  },
  {
    question: "How much gas does a transaction use?",
    answer:
      "A simple ETH transfer uses 21,000 gas. Token transfers use around 65,000, and a swap or NFT mint can use well over 150,000. The calculator includes presets for these common actions.",
  },
  {
    question: "How can I pay lower gas fees?",
    answer:
      "Transact when the network is quiet, since the base fee drops with demand. You can also lower the priority tip if you are not in a hurry, or use a layer 2 network where fees are a small fraction of mainnet.",
  },
];

export default async function GasFeeCalculatorPage() {
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
    "⛽"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gas Fee Calculator",
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
      title="Gas Fee Calculator"
      intro="Estimate what an Ethereum transaction will cost in ETH and dollars. Pick a transaction type, set the base fee, tip and ETH price, then press Calculate."
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
            { name: "Gas Fee Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Gas Fee Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GasFeeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the gas fee calculator works</H2>
            <P>
              Every action on Ethereum consumes gas, a unit that measures computational work. You pay
              for that gas at a price quoted in gwei, a tiny fraction of an ETH. Multiply the gas your
              transaction uses by the gas price and you get the fee.
            </P>
            <P>
              Since EIP-1559, the gas price splits into a base fee that the network sets automatically
              and a priority tip you add to get included faster. The result panel shows how much each
              part costs so you can see where your fee is going.
            </P>

            <H2>A quick example</H2>
            <P>
              Send ETH using 21,000 gas at a 20 gwei base fee plus a 2 gwei tip. That is 22 gwei
              total, or 0.000462 ETH. With ETH at $3,000, the fee comes to about $1.39. The same
              22 gwei on a 180,000 gas swap would cost closer to $11.88.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Gas prices change every block, so use a live source for the current base fee before you
              transact. The official{" "}
              <a href="https://ethereum.org/en/developers/docs/gas/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Ethereum gas documentation</a>{" "}
              explains the mechanics in depth. For trading math, see our other{" "}
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

export async function generateMetadata(): Promise<Metadata> {
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
