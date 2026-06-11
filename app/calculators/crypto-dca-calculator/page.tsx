import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CryptoDcaCalculator from "./CryptoDcaCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/crypto-dca-calculator";
const SELF_SLUG = "crypto-dca-calculator";

const DESC =
  "Free crypto DCA calculator. Model dollar-cost averaging into Bitcoin or any coin with a recurring buy, see how many coins you accumulate, your average cost and projected portfolio value over time.";

const baseMetadata: Metadata = {
  title: "Crypto DCA Calculator",
  description: DESC,
  keywords: [
    "crypto dca calculator",
    "dollar cost averaging crypto",
    "bitcoin dca calculator",
    "recurring crypto buy",
    "average cost crypto",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Crypto DCA Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Crypto DCA Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is dollar-cost averaging in crypto?",
    answer:
      "Dollar-cost averaging means buying a fixed dollar amount of a coin on a regular schedule, such as 100 dollars every week, regardless of the price that day. You end up buying more coins when the price is low and fewer when it is high, which smooths out your average entry price over time.",
  },
  {
    question: "How does this calculator project the future price?",
    answer:
      "It applies the average annual growth rate you enter to the starting price and spreads it across every buy, then adds a small repeating up and down swing so the chart resembles a real market path. It is an illustration, not a forecast, because no one can predict crypto prices.",
  },
  {
    question: "What is my average cost per coin?",
    answer:
      "Your average cost is the total dollars you invested divided by the total coins you accumulated. Because DCA buys more coins at lower prices, this average is usually below the simple midpoint of the price range, which is the main benefit of the strategy.",
  },
  {
    question: "Is DCA better than buying all at once?",
    answer:
      "It depends on the price path. If a coin rises steadily, a single lump sum at the start tends to win. If prices are volatile or fall before recovering, spreading purchases reduces the risk of buying everything at a bad moment. DCA mainly trades some upside for lower timing risk and less stress.",
  },
];

export default async function CryptoDcaCalculatorPage() {
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
    "🪙"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Crypto DCA Calculator",
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
      title="Crypto DCA Calculator"
      intro="See how a steady, recurring crypto buy adds up. Enter your buy amount, frequency and a price assumption, then press Calculate to project the coins you hold and your portfolio value."
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
            { name: "Crypto DCA Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Crypto DCA Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CryptoDcaCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the crypto DCA calculator works</H2>
            <P>
              Each buy converts your fixed dollar amount into coins at whatever the price is that day,
              so coins bought equals the buy amount divided by the price. The tool repeats this for
              every period across your horizon, tallies the coins and dollars, and values the stack at
              the final price. The shaded area is your portfolio value and the dashed line is the total
              cash you put in.
            </P>
            <P>
              Because cheaper periods hand you more coins, your blended entry price ends up below the
              average market price over the run. That lower average cost is the whole point of
              dollar-cost averaging, and the calculator shows it directly alongside the coin count.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you buy 100 dollars of Bitcoin every week for 3 years starting at 30,000 dollars,
              and assume roughly 25 percent average annual growth. You invest about 15,600 dollars
              across 156 buys, accumulate a fraction of a coin at an average cost well under the ending
              price, and watch the value line pull away from the flat invested line as the position
              compounds.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Crypto is highly volatile and these projections assume a smooth average rather than the
              sharp drawdowns real markets deliver, so treat the output as a planning sketch. Factor in
              exchange fees and taxes, and never invest money you cannot afford to lose. For plain
              guidance on crypto risks, see the{" "}
              <a href="https://www.investor.gov/introduction-investing/investing-basics/glossary/crypto-assets" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC Investor.gov crypto pages</a>.
              To estimate the gain on a single trade instead, try our{" "}
              <Link href="/calculators/crypto-profit-calculator" className="text-orange-600 underline">crypto profit calculator</Link>.
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
