import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DebtPayoffCalculator from "./DebtPayoffCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/debt-payoff-calculator";
const SELF_SLUG = "debt-payoff-calculator";

const DESC =
  "Free debt payoff calculator. See how many months it takes to clear a credit card or loan balance at a fixed monthly payment and APR, plus the total interest and total amount you will pay.";

const baseMetadata: Metadata = {
  title: "Debt Payoff Calculator",
  description: DESC,
  keywords: [
    "debt payoff calculator",
    "debt payoff time",
    "credit card payoff calculator",
    "how long to pay off debt",
    "loan payoff calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Debt Payoff Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Debt Payoff Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How long will it take to pay off my debt?",
    answer:
      "It depends on your balance, your interest rate and how much you pay each month. This calculator solves for the payoff time directly: it charges interest on the balance each month, subtracts your payment, and counts the months until the balance reaches zero. An $8,000 balance at 19.99% APR with a $250 monthly payment, for example, clears in a little under four years.",
  },
  {
    question: "What does the total interest figure mean?",
    answer:
      "Total interest is everything you pay above the original balance. Because interest is charged on the remaining balance each month, a higher APR or a smaller payment leaves more of the debt outstanding for longer, so the interest piles up. Paying more each month shortens the timeline and cuts the interest sharply.",
  },
  {
    question: "Why does the calculator say my payment is too low?",
    answer:
      "If your monthly payment is smaller than the interest charged in the first month, the balance grows instead of shrinking and the debt can never be repaid. When that happens the calculator stops and asks you to raise the payment above that first interest charge so there is something left over to reduce the principal.",
  },
  {
    question: "Does this account for new spending on the card?",
    answer:
      "No. The calculator assumes a fixed starting balance and no new charges, which is the right way to model a focused payoff. If you keep adding purchases, the real payoff date moves further out. To clear debt fastest, stop adding to the balance while you pay it down.",
  },
];

export default async function DebtPayoffCalculatorPage() {
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
    name: "Debt Payoff Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Debt Payoff Calculator"
      intro="See how long it takes to become debt-free. Enter your balance, APR and the fixed amount you pay each month, then press Calculate to see the months to payoff, the total interest, and the total you will pay — plus a chart of your shrinking balance."
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
            { name: "Debt Payoff Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Debt Payoff Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DebtPayoffCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the debt payoff calculator works</H2>
            <P>
              Paying off a debt is a tug-of-war between your monthly payment and the interest your
              lender charges. Each month the calculator adds one month of interest to the balance —
              your APR divided by twelve — and then subtracts the payment you make. Whatever is left
              becomes next month&apos;s starting balance. It repeats this until the balance hits zero,
              counting the months along the way, so the payoff date reflects exactly how compounding
              interest behaves rather than a rough average.
            </P>
            <P>
              The headline result is the number of months to freedom, also shown in years and months
              for an easier read. Underneath you get the original balance, the total interest you pay,
              and the total amount that leaves your bank account over the life of the debt. The chart
              traces your remaining balance month by month, so you can see the slow start and the
              steepening drop as more of each payment finally goes toward principal.
            </P>

            <H2>Why your payment size matters so much</H2>
            <P>
              On high-rate debt, the gap between a minimum payment and a slightly larger one is
              dramatic. A small payment barely outpaces the interest, so the balance shrinks at a
              crawl and most of your money is swallowed by finance charges. Nudging the payment up
              attacks the principal directly, and because there is then less balance to charge interest
              against, the savings compound in your favor month after month.
            </P>
            <P>
              That is also why the calculator refuses to return a result when the payment cannot even
              cover the first month of interest: in that case the balance grows every month and the
              debt is mathematically unpayable at that rate. If you hit that wall, the fix is either a
              larger payment, a lower rate through a balance transfer or consolidation, or both. Even an
              extra twenty or thirty dollars a month can move the payoff date forward by many months.
            </P>

            <H2>Strategies to clear debt faster</H2>
            <P>
              If you carry more than one balance, the order you tackle them in matters. The{" "}
              <Link href="/calculators/debt-snowball-calculator" className="text-orange-600 underline">debt snowball calculator</Link>{" "}
              pays the smallest balance first for quick wins and momentum, while paying the highest-rate
              balance first saves the most money overall. Pick whichever keeps you motivated and
              consistent, because the plan you actually stick to beats the one that looks best on paper.
            </P>
            <P>
              For a single card, focus on cutting the rate and raising the payment. A zero-percent
              balance transfer can pause interest entirely for a window, and any windfall — a tax refund
              or bonus — thrown at the balance shortens the timeline immediately. When credit cards are
              your main concern, our{" "}
              <Link href="/calculators/credit-card-payoff-calculator" className="text-orange-600 underline">credit card payoff calculator</Link>{" "}
              digs deeper into card-specific scenarios so you can compare approaches side by side.
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
