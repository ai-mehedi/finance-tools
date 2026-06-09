import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import AnnualFeeCalculator from "./AnnualFeeCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/annual-fee-calculator";
const SELF_SLUG = "annual-fee-calculator";

const DESC =
  "Free annual fee calculator. Find out if a credit card's annual fee is worth it by weighing your rewards, perks and sign-up bonus against the cost.";

export const metadata: Metadata = {
  title: "Annual Fee Worth It Calculator",
  description: DESC,
  keywords: [
    "annual fee calculator",
    "is the annual fee worth it",
    "credit card annual fee calculator",
    "card rewards calculator",
    "annual fee break even calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Annual Fee Worth It Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Annual Fee Worth It Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "Is a credit card annual fee worth paying?",
    answer:
      "It is worth it when the rewards and perks you actually use are worth more than the fee. This calculator weighs your rewards rate, spending and the dollar value of perks against the fee so you can see the net value at a glance.",
  },
  {
    question: "How do I value card perks?",
    answer:
      "Only count perks you would genuinely use, at what they are worth to you. A travel credit you always use is worth its full value, while lounge access you rarely touch is worth little. Enter that honest total in the perks field.",
  },
  {
    question: "What is the break-even spend?",
    answer:
      "It is the amount you would need to spend in a year so that rewards alone cover the fee, after any perks are applied. Spend more than that and the rewards put you ahead. Spend less and you are relying on perks to make up the gap.",
  },
  {
    question: "Should I include the sign-up bonus?",
    answer:
      "A sign-up bonus only lands in the first year, so it is shown separately as first-year net value. For an ongoing decision about keeping the card, focus on the net value without the bonus, since that repeats each year.",
  },
];

export default async function AnnualFeeCalculatorPage() {
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
    "💳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Annual Fee Worth It Calculator",
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
      title="Annual Fee Worth It Calculator"
      intro="Find out whether a credit card's annual fee pays for itself. Enter your spending, rewards rate and the value of the perks you use, then press Calculate."
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
            { name: "Annual Fee Worth It Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Annual Fee Worth It Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnnualFeeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How to decide if an annual fee is worth it</H2>
            <P>
              The math is simple: add up the rewards you earn from your spending plus the dollar value
              of perks you actually use, then subtract the annual fee. If the result is positive, the
              card pays for itself. The calculator also shows the break-even spend so you know the
              tipping point.
            </P>
            <P>
              The bar chart compares the value you earn against the fee so the answer is easy to see
              at a glance. A long value bar that clears the fee bar means the card is working for you.
            </P>

            <H2>A quick example</H2>
            <P>
              A card charges a $95 fee and earns 2% back. On $1,500 of monthly spend that is $360 a
              year in rewards. Add $120 of travel credits you always use and you have $480 of value,
              comfortably ahead of the fee by $385 a year.
            </P>

            <H2>Be honest about perks</H2>
            <P>
              The trap with premium cards is counting perks you never use. Only value the credits,
              lounge visits or insurance you would actually claim. For unbiased guidance on choosing a
              card, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a solid source. You can also compare payoff costs with our{" "}
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
