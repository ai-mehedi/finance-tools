import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MortgageComparisonCalculator from "./MortgageComparisonCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mortgage-comparison-calculator";
const SELF_SLUG = "mortgage-comparison-calculator";

const DESC =
  "Free mortgage comparison calculator. Put two loan offers side by side on the same amount and compare monthly payment, total interest, points and fees, with a break-even point and total cost chart.";

export const metadata: Metadata = {
  title: "Mortgage Comparison Calculator",
  description: DESC,
  keywords: [
    "mortgage comparison calculator",
    "compare mortgage offers",
    "mortgage points vs rate",
    "loan break even calculator",
    "best mortgage rate",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mortgage Comparison Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mortgage Comparison Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How should I compare two mortgage offers?",
    answer:
      "Looking at the interest rate alone can mislead you, because a lower rate often comes with higher upfront points and fees. This tool compares both offers on the same loan amount and adds up monthly payment, total interest and upfront cost, so you can judge them on the true total you would pay.",
  },
  {
    question: "What are mortgage points?",
    answer:
      "Points are an upfront fee paid to the lender to lower your interest rate, where one point equals one percent of the loan amount. Paying points raises your closing cost but reduces every monthly payment, so they pay off only if you keep the loan long enough to recover the upfront money.",
  },
  {
    question: "What does the break-even point tell me?",
    answer:
      "The break-even point is how long it takes for the monthly savings of the cheaper-payment offer to recover the extra you paid upfront for it. If you expect to keep the loan past that point you come out ahead, and if you plan to sell or refinance sooner the other offer is usually better.",
  },
  {
    question: "Can the two offers have different terms?",
    answer:
      "Yes. You can set a different term for each offer, for example a 30 year loan against a 15 year loan. The shorter term usually has a higher monthly payment but far less total interest, and the total cost figure makes that trade clear at a glance.",
  },
];

export default async function MortgageComparisonCalculatorPage() {
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
    "⚖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Comparison Calculator",
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
      title="Mortgage Comparison Calculator"
      intro="Weigh two mortgage offers against each other on the same loan amount. Enter each rate, term, points and fees, then press Compare to see which one costs less and when it pays off."
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
            { name: "Mortgage Comparison Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mortgage Comparison Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MortgageComparisonCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the comparison works</H2>
            <P>
              Both offers run against the same loan amount so the only differences are the terms you
              enter. For each one the tool works out the level monthly payment, multiplies it across the
              full term to find total interest, then adds the upfront cost of points and fees to reach a
              single total cost you can line up side by side.
            </P>
            <P>
              The offer with the lower total cost is the cheaper loan if you hold it for the whole term.
              But because a lower rate often costs more upfront, the tool also finds the break-even
              month where the smaller payments finally repay that extra upfront money.
            </P>

            <H2>A worked example</H2>
            <P>
              On a 300,000 dollar loan, Offer A is 6.5 percent with no points, and Offer B is 6.0
              percent with one point, about 3,000 dollars extra upfront. Offer B trims roughly 95
              dollars a month, so it recovers that point in around 32 months and saves a large amount of
              interest if you keep the loan past that point.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Use the official Loan Estimate forms from each lender for an apples-to-apples comparison,
              as explained in the{" "}
              <a href="https://www.consumerfinance.gov/owning-a-home/loan-estimate/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB Loan Estimate guide</a>.
              Once you pick an offer, map out the full payment schedule with our{" "}
              <Link href="/calculators/mortgage-amortization-calculator" className="text-orange-600 underline">mortgage amortization calculator</Link>.
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
