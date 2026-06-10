import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CryptoTaxCalculator from "./CryptoTaxCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/crypto-tax-calculator";
const SELF_SLUG = "crypto-tax-calculator";

const DESC =
  "Free crypto tax calculator. Estimate US federal capital gains tax on a crypto sale from your proceeds, cost basis and holding period, with short-term and long-term rates and a bracket breakdown chart.";

export const metadata: Metadata = {
  title: "Crypto Tax Calculator",
  description: DESC,
  keywords: [
    "crypto tax calculator",
    "cryptocurrency capital gains tax",
    "bitcoin tax calculator",
    "crypto capital gains",
    "long term crypto tax",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Crypto Tax Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Crypto Tax Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the difference between short-term and long-term crypto tax?",
    answer:
      "It comes down to how long you held the coins before selling. Hold one year or less and the gain is short-term, taxed at your ordinary income rate. Hold more than one year and it becomes long-term, taxed at the lower 0, 15 or 20 percent capital gains rates.",
  },
  {
    question: "How do the long-term capital gains brackets work?",
    answer:
      "The long-term rate depends on your total taxable income, not the gain alone. Your gain is stacked on top of your other income, then it fills the 0 percent band first, the 15 percent band next, and only the part above the upper breakpoint is taxed at 20 percent.",
  },
  {
    question: "What is cost basis and why does it matter?",
    answer:
      "Cost basis is what you originally paid for the crypto, including purchase fees. Your taxable gain is the sale proceeds minus that basis. A higher basis means a smaller gain and a smaller tax bill, which is why keeping accurate purchase records is so valuable.",
  },
  {
    question: "What happens if I sold crypto at a loss?",
    answer:
      "When your proceeds are below your cost basis you have a capital loss, and there is no gain to tax. Losses can offset other capital gains and, within limits, a portion of ordinary income, so they are worth tracking even though this tool focuses on the gain itself.",
  },
];

export default async function CryptoTaxCalculatorPage() {
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
    name: "Crypto Tax Calculator",
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
      title="Crypto Tax Calculator"
      intro="Estimate the US federal capital gains tax on a crypto sale. Enter your proceeds, cost basis and how long you held, then press Calculate to see the tax and your profit after tax."
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
            { name: "Crypto Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Crypto Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CryptoTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the crypto tax calculator works</H2>
            <P>
              The calculator starts with your capital gain, which is the sale proceeds minus your cost
              basis. If you held the coins for one year or less, that gain is short-term and is taxed at
              the ordinary income rate you supply. If you held longer, the gain is long-term and runs
              through the preferential 0, 15 and 20 percent bands instead.
            </P>
            <P>
              For long-term gains the tool stacks the gain on top of your other taxable income, because
              the bands are filled by total income. The bar chart then shows how much of the gain lands
              in each rate band, making it clear why two people with the same gain can owe very
              different amounts.
            </P>

            <H2>A worked example</H2>
            <P>
              Say you are single with $60,000 of taxable income and sell crypto for an $8,000 long-term
              gain. The 0 percent band for a single filer ends around $47,025, which your income has
              already passed, so the whole gain falls in the 15 percent band. The estimated tax is about
              $1,200, leaving roughly $6,800 of profit after tax.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate of the federal capital gains piece only. It does not include state tax,
              the net investment income tax, or wash-sale style rules, and brackets shift each year. Treat
              the number as a planning guide and confirm specifics with the{" "}
              <a href="https://www.irs.gov/businesses/small-businesses-self-employed/digital-assets" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS digital assets guidance</a>{" "}
              or a tax professional. To work out the gain itself from a trade first, use our{" "}
              <Link href="/calculators/crypto-roi-calculator" className="text-orange-600 underline">crypto ROI calculator</Link>.
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
