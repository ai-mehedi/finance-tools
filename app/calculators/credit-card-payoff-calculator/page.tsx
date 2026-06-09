import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CreditCardPayoffCalculator from "./CreditCardPayoffCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/credit-card-payoff-calculator";
const SELF_SLUG = "credit-card-payoff-calculator";

const DESC =
  "Free credit card payoff calculator. See how long it takes to clear your balance, how much interest you pay, and watch the balance fall month by month.";

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator",
  description: DESC,
  keywords: [
    "credit card payoff calculator",
    "credit card interest calculator",
    "pay off credit card",
    "debt payoff calculator",
    "credit card balance calculator",
    "how long to pay off credit card",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Credit Card Payoff Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Credit Card Payoff Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is credit card payoff time calculated?",
    answer:
      "Each month the card adds interest equal to the balance times the monthly rate (APR divided by 12). Your payment first covers that interest, and the rest reduces the balance. The calculator repeats this month by month until the balance reaches zero, then reports the number of months and total interest.",
  },
  {
    question: "Why does a small payment take so long?",
    answer:
      "On a high APR card, much of a small payment goes to interest, so the balance barely moves. If your payment does not even cover the first month of interest, the balance grows and never gets paid off. Paying more than the minimum is the fastest way to break that cycle.",
  },
  {
    question: "Should I pay more than the minimum?",
    answer:
      "Almost always yes. Minimum payments are designed to stretch repayment over many years, which maximizes interest. Even a modest fixed extra amount each month can cut years off the payoff and save hundreds or thousands in interest.",
  },
  {
    question: "Does a balance transfer help?",
    answer:
      "A 0% introductory balance transfer can pause interest for a set period so more of each payment hits principal. Watch for transfer fees and the rate after the promo ends. Use this calculator to compare the payoff with and without the lower rate.",
  },
];

export default async function CreditCardPayoffCalculatorPage() {
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
    name: "Credit Card Payoff Calculator",
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
      title="Credit Card Payoff Calculator"
      intro="See how long it takes to clear your credit card and how much interest you pay along the way. Enter your balance, APR and monthly payment, then press Calculate."
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
            { name: "Credit Card Payoff Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Credit Card Payoff Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreditCardPayoffCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the payoff calculator works</H2>
            <P>
              Credit cards charge interest daily, which works out to roughly your APR divided by
              twelve each month. The calculator applies that interest to your balance, subtracts your
              payment, and repeats. Early on most of your payment fights interest, so the balance
              falls slowly. As the balance shrinks, more of each payment hits principal and the
              payoff speeds up. That is why the chart curves down gently at first and faster later.
            </P>
            <P>
              The single biggest lever is your monthly payment. Raising it even a little shortens the
              timeline and cuts total interest, because every extra dollar goes straight to
              principal that stops accruing interest.
            </P>

            <H2>A quick example</H2>
            <P>
              A $6,000 balance at 21.5% APR with a $250 fixed monthly payment takes roughly 30 months
              to clear and costs about $1,400 in interest. Bump the payment to $400 a month and you
              are debt free in around 17 months, paying far less interest overall.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This assumes a fixed payment and no new spending on the card. Adding new charges resets
              the math. For unbiased guidance on managing card debt, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              You can also compare strategies with our{" "}
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
