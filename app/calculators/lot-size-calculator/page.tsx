import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LotSizeCalculator from "./LotSizeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/lot-size-calculator";
const SELF_SLUG = "lot-size-calculator";

const DESC =
  "Free forex lot size calculator. Work out the right position size in standard, mini and micro lots from your account balance, risk percentage and stop loss so every trade risks the same amount.";

const baseMetadata: Metadata = {
  title: "Lot Size Calculator",
  description: DESC,
  keywords: [
    "lot size calculator",
    "forex position size calculator",
    "risk per trade calculator",
    "standard mini micro lots",
    "stop loss position sizing",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Lot Size Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Lot Size Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a lot in forex trading?",
    answer:
      "A lot is a standard unit of trade size. One standard lot is 100,000 units of the base currency, a mini lot is 10,000 units and a micro lot is 1,000 units. Lot size decides how much each pip of price movement is worth, so it directly controls how much you win or lose per trade.",
  },
  {
    question: "How is the correct lot size calculated?",
    answer:
      "First the calculator finds the cash you are willing to lose, which is your account balance times your risk percentage. It then divides that by the loss one standard lot would take if your stop loss were hit, which is the stop distance in pips times the pip value per lot. The answer is the position size in standard lots.",
  },
  {
    question: "Why risk a fixed percentage on each trade?",
    answer:
      "Risking the same small percentage, often one or two percent, keeps any single loss from doing serious damage to the account. Because the percentage is applied to the current balance, your position sizes shrink after losses and grow after wins, which protects capital during a losing run.",
  },
  {
    question: "What is the pip value per lot I need to enter?",
    answer:
      "It is the cash value of a one pip move for one standard lot of the pair you trade. For most pairs quoted against the US dollar this is about ten dollars per standard lot. For pairs where the dollar is not the quote currency the value differs, so check your broker for the exact figure.",
  },
];

export default async function LotSizeCalculatorPage() {
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
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Lot Size Calculator",
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
      title="Lot Size Calculator"
      intro="Size every forex trade so it risks the same slice of your account. Enter your balance, risk percentage, stop loss and pip value, then press Calculate to see the position size in lots."
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
            { name: "Lot Size Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Lot Size Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LotSizeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the lot size calculator works</H2>
            <P>
              Position sizing turns a vague feeling about risk into a precise number of lots. The tool
              starts from the cash you are prepared to lose on the trade, found by applying your risk
              percentage to the account balance. It then asks how much one standard lot would lose if
              the stop were hit, which is the stop distance in pips multiplied by the pip value, and
              divides one by the other to get the lot size.
            </P>
            <P>
              The donut shows what share of the account is exposed on this single trade, while the bars
              compare how many lots different risk levels would allow. Together they make it obvious
              how quickly position size grows as you loosen the stop or raise the risk percentage.
            </P>

            <H2>A quick example</H2>
            <P>
              With a $10,000 account, 1% risk, a 25 pip stop and a pip value of $10 per standard lot,
              you are willing to lose $100. One standard lot would lose 25 times 10, or $250, if the
              stop is hit. Dividing $100 by $250 gives 0.4 standard lots, which is 4 mini lots or 40
              micro lots, and 40,000 units.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The figure assumes your stop is honoured at the exact price. Slippage, gaps and widening
              spreads can push the real loss past the planned amount, so trade liquid pairs and avoid
              major news if you want the math to hold. For a primer on managing trading risk, see{" "}
              <a href="https://www.investopedia.com/terms/r/riskmanagement.asp" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">this risk management overview</a>.
              To gauge the upside of a position, pair this with our{" "}
              <Link href="/calculators/profit-margin-calculator" className="text-orange-600 underline">profit margin calculator</Link>.
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
