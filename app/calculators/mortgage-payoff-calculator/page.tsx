import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MortgagePayoffCalculator from "./MortgagePayoffCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mortgage-payoff-calculator";
const SELF_SLUG = "mortgage-payoff-calculator";

const DESC =
  "Free mortgage payoff calculator. Find out when your loan will be paid off and how much interest you save by adding an extra amount to each monthly payment, with a side-by-side balance chart.";

export const metadata: Metadata = {
  title: "Mortgage Payoff Calculator",
  description: DESC,
  keywords: [
    "mortgage payoff calculator",
    "early mortgage payoff",
    "extra payment calculator",
    "mortgage payoff date",
    "pay off home loan early",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mortgage Payoff Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mortgage Payoff Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is my mortgage payoff date calculated?",
    answer:
      "The calculator amortises your balance one month at a time. Each month it charges interest on what you owe, applies your payment, and reduces the principal by the rest. The payoff date is the month the balance reaches zero, which arrives sooner once an extra amount is added to every payment.",
  },
  {
    question: "Does adding an extra payment really shorten the loan?",
    answer:
      "Yes, and the effect is larger than people expect. Every extra dollar reduces principal directly, so future interest is charged on a smaller balance. On a long loan even a modest extra payment can cut years off the term and save a substantial sum in interest.",
  },
  {
    question: "What is the difference between this and an overpayment calculator?",
    answer:
      "They are close cousins. This payoff tool focuses on the final payoff date and the interest saved from a fixed extra monthly amount. An overpayment calculator emphasises the same comparison but is often framed around lender overpayment limits. Both rely on identical amortisation math.",
  },
  {
    question: "Should I make extra payments or build an emergency fund first?",
    answer:
      "Liquidity usually comes first. Money paid into a mortgage is hard to get back, so most planners suggest a cash buffer of a few months of expenses before accelerating the loan. Once that safety net exists, extra payments are a low-risk way to cut interest and own your home outright sooner.",
  },
];

export default async function MortgagePayoffCalculatorPage() {
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
    "🔑"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Payoff Calculator",
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
      title="Mortgage Payoff Calculator"
      intro="Find out exactly when your mortgage will be gone. Enter your balance, rate, remaining term and an extra monthly amount, then press Calculate to see your new payoff date and the interest you save."
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
            { name: "Mortgage Payoff Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mortgage Payoff Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MortgagePayoffCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the mortgage payoff calculator works</H2>
            <P>
              First the tool derives the scheduled payment that would clear your balance over the
              remaining term. Then it simulates two loans: one paying only that scheduled amount, and
              one paying the scheduled amount plus your extra contribution. It tracks each balance month
              by month until both reach zero.
            </P>
            <P>
              The difference between the two payoff dates is the time you save, and the difference in
              total interest is the money you save. The chart shows the accelerated balance plunging
              below the standard line, with the gap at the end representing interest you never had to
              pay.
            </P>

            <H2>A worked example</H2>
            <P>
              Picture a 300,000 dollar balance at 6.5 percent with 30 years to go. The payment is about
              1,896 dollars a month. Add 200 dollars extra and the loan is gone in roughly 25 years
              instead of 30, trimming around five years off the term and saving well over 60,000 dollars
              in interest.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Tell your servicer to apply extra funds to principal, not to prepay the next bill, or the
              payoff date will not move. Check for any prepayment penalty in your loan documents first.
              The{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>{" "}
              site is a neutral place to weigh extra payments against investing. To explore steady extra
              payments under lender limits, see our{" "}
              <Link href="/calculators/mortgage-overpayment-calculator" className="text-orange-600 underline">mortgage overpayment calculator</Link>.
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
