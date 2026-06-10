import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import AmortizationCalculator from "./AmortizationCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/amortization-calculator";
const SELF_SLUG = "amortization-calculator";

const DESC =
  "Free amortization schedule calculator. See your monthly payment, a full table of principal and interest for every payment, total interest, and a payoff chart.";

export const metadata: Metadata = {
  title: "Amortization Schedule Calculator",
  description: DESC,
  keywords: [
    "amortization calculator",
    "amortization schedule calculator",
    "loan amortization calculator",
    "amortization table",
    "loan payment schedule",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Amortization Schedule Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Amortization Schedule Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is loan amortization?",
    answer:
      "Amortization is the process of paying off a loan with equal payments over a set term. Each payment covers the interest due that month plus a slice of the principal, so the balance falls steadily until it reaches zero.",
  },
  {
    question: "Why is most of my early payment interest?",
    answer:
      "Interest is charged on the outstanding balance, which is largest at the start. So early payments are mostly interest with a small principal portion. As the balance shrinks, the interest share falls and more of each payment goes to principal.",
  },
  {
    question: "How is the monthly payment calculated?",
    answer:
      "It uses the standard formula M = P·r(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate and n is the total number of payments. This produces a level payment that fully clears the loan by the end of the term.",
  },
  {
    question: "Does making extra payments change the schedule?",
    answer:
      "Yes. Any amount above the scheduled payment goes straight to principal, which lowers the balance faster than planned. That shortens the term and reduces the total interest you pay over the life of the loan.",
  },
];

export default async function AmortizationCalculatorPage() {
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
    name: "Amortization Schedule Calculator",
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
      title="Amortization Schedule Calculator"
      intro="See your monthly payment, a full breakdown of principal and interest for every payment, and how the balance falls over time. Enter your loan details and press Calculate."
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
            { name: "Amortization Schedule Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Amortization Schedule Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AmortizationCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How an amortization schedule works</H2>
            <P>
              An amortizing loan is repaid with a level payment each period. Part of that payment is
              the interest owed on the current balance, and the rest reduces the principal. Because
              the balance falls over time, the interest portion shrinks while the principal portion
              grows, even though the total payment stays the same.
            </P>
            <P>
              The schedule above lists every payment with its principal and interest split and the
              balance that remains. The chart shows that balance curving down, slowly at first and
              faster near the end, which is the hallmark of amortization.
            </P>

            <H2>A quick example</H2>
            <P>
              Borrow $250,000 at 6.5% over 30 years and your payment is about $1,580 a month. In the
              first payment roughly $1,355 is interest and only $225 is principal. By the final year
              that flips, with almost the whole payment going to principal.
            </P>

            <H2>Using the schedule wisely</H2>
            <P>
              The table makes it easy to see how much interest you pay in early years and how extra
              payments could help. For official guidance on comparing loans, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              You can also model a home loan with our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>.
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
