import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PipCalculator from "./PipCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/pip-calculator";
const SELF_SLUG = "pip-calculator";

const DESC =
  "Free pip calculator for forex traders. Work out the cash value of one pip for any lot size and currency pair, in your own account currency, with a chart comparing micro, mini and standard positions.";

const baseMetadata: Metadata = {
  title: "Pip Calculator",
  description: DESC,
  keywords: [
    "pip calculator",
    "pip value calculator",
    "forex pip value",
    "lot size pip value",
    "pip to dollar",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Pip Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Pip Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a pip?",
    answer:
      "A pip is the smallest standard price move that a currency pair normally makes. For most pairs it is the fourth decimal place, or 0.0001, while for pairs quoted against the Japanese yen it is the second decimal place, or 0.01.",
  },
  {
    question: "How is pip value calculated?",
    answer:
      "Pip value equals the pip size times the number of units in your position, converted into your account currency. So pip value equals pip size times units times the rate that turns one unit of the quote currency into your account currency.",
  },
  {
    question: "Why does pip value change between pairs?",
    answer:
      "Because the pip value is measured in the quote currency, the second currency in the pair. When that currency is not the same as your account currency, the result has to be converted, so the same lot size can be worth different amounts depending on the pair you trade.",
  },
  {
    question: "What is the pip value of one standard lot?",
    answer:
      "A standard lot is 100,000 units. For a pair where the quote currency matches your account currency and the pip size is 0.0001, one pip is worth about 10 in your account currency. A mini lot is one tenth of that and a micro lot is one hundredth.",
  },
];

export default async function PipCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pip Calculator",
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
      title="Pip Calculator"
      intro="Find out exactly how much one pip is worth before you place a trade. Pick a lot size and pair, add the conversion rate to your account currency, then press Calculate."
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
            { name: "Pip Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Pip Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PipCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the pip calculator works</H2>
            <P>
              Every forex trade moves in pips, but a pip on its own is just a price step. What matters
              for your account is how many dollars, euros or pounds that step is worth. This tool turns
              a pip into real money by multiplying the pip size by the number of units you trade, then
              converting the result into the currency your account is held in.
            </P>
            <P>
              The chart lines up four common position sizes so you can see how pip value scales. Move
              from a micro lot to a standard lot and the value of each pip jumps by a factor of one
              hundred, which is why position sizing matters so much for risk.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you trade one standard lot of 100,000 units on a pair where the quote currency is
              the same as your account currency and the pip size is 0.0001. One pip is worth 0.0001
              times 100,000, which is 10 units of your account currency. A 25 pip move therefore swings
              your balance by 250, before any spread or commission.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The conversion rate you enter should reflect the live market, and it changes as prices
              move, so treat the pip value as a snapshot rather than a fixed figure. For a primer on how
              currency quotes and pips are defined, the{" "}
              <a href="https://www.babypips.com/learn/forex/pips-and-pipettes" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">BabyPips school</a>{" "}
              is a good neutral starting point. Once you know your pip value, size the trade against your
              capital with our{" "}
              <Link href="/calculators/portfolio-return-calculator" className="text-orange-600 underline">portfolio return calculator</Link>.
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
