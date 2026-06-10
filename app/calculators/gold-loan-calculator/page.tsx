import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import GoldLoanCalculator from "./GoldLoanCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/gold-loan-calculator";
const SELF_SLUG = "gold-loan-calculator";

const DESC =
  "Free gold loan calculator. Estimate how much you can borrow against pledged gold from its weight, purity and market rate, then see the monthly EMI and total interest for your tenure.";

export const metadata: Metadata = {
  title: "Gold Loan Calculator",
  description: DESC,
  keywords: [
    "gold loan calculator",
    "gold loan emi calculator",
    "loan against gold",
    "gold loan eligibility",
    "gold loan per gram",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Gold Loan Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Gold Loan Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is the gold loan amount calculated?",
    answer:
      "First the lender values your gold from its weight and purity at the current market rate, so 22 carat gold is valued at 22 divided by 24 of the pure rate. Then a loan to value cap is applied, often around 75 percent, and the loan you can raise is the gold value times that cap.",
  },
  {
    question: "What is loan to value or LTV in a gold loan?",
    answer:
      "Loan to value is the share of your gold's appraised worth that a lender is willing to advance. A 75 percent LTV on gold worth 100,000 means a maximum loan of 75,000. The cap protects the lender if gold prices fall, and regulators often set an upper limit on it.",
  },
  {
    question: "How is the EMI on a gold loan worked out?",
    answer:
      "When you repay in equal monthly instalments, the EMI uses the standard reducing balance formula. It is the loan times the monthly rate times one plus the monthly rate raised to the number of months, divided by one plus the monthly rate raised to the number of months minus one.",
  },
  {
    question: "Does purity affect how much I can borrow?",
    answer:
      "Yes. Lower purity gold contains less pure metal, so it is valued less per gram and supports a smaller loan. Most lenders accept gold of 18 carat and above and discount the value in proportion to purity, which is exactly how this calculator adjusts the figure.",
  },
];

export default async function GoldLoanCalculatorPage() {
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
    "🪙"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gold Loan Calculator",
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
      title="Gold Loan Calculator"
      intro="See how much cash your gold can unlock. Enter the weight, purity and market rate, set a loan to value cap and tenure, then press Calculate for your eligible amount and monthly EMI."
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
            { name: "Gold Loan Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Gold Loan Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GoldLoanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the gold loan calculator works</H2>
            <P>
              A gold loan lets you borrow against jewellery or coins without selling them. This tool
              mirrors how lenders size the offer. It values your gold from its weight, scales that by
              purity so 22 carat is worth slightly less than pure gold per gram, and multiplies by the
              current market rate to reach an appraised value.
            </P>
            <P>
              It then applies your loan to value cap to find the maximum amount you can raise, and runs
              the standard reducing balance formula to turn that into a monthly EMI. The chart traces
              how the outstanding principal falls over the tenure as each instalment chips away at the
              balance.
            </P>

            <H2>A worked example</H2>
            <P>
              Pledge 50 grams of 22 carat gold when pure gold trades at 7,000 per gram. The purity
              adjusted value is about 320,000, and at a 75 percent cap you could borrow roughly
              240,000. Repaid over 24 months at 12 percent a year, that works out to an EMI near
              11,300 with total interest of about 31,000 across the term.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Gold prices and lender LTV caps move, so the eligible amount is an estimate rather than a
              firm sanction, and missing repayments can put the pledged gold at risk. For background on
              how these loans are regulated, see{" "}
              <a href="https://www.rbi.org.in" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the Reserve Bank of India</a>.
              To compare the cost against a regular instalment loan, try our{" "}
              <Link href="/calculators/loan-calculator" className="text-orange-600 underline">loan calculator</Link>.
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
