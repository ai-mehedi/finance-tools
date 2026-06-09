import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import HomeLoanEmiCalculator from "./HomeLoanEmiCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/home-loan-emi-calculator";
const SELF_SLUG = "home-loan-emi-calculator";

const DESC =
  "Free home loan EMI calculator. Work out your monthly home loan EMI, total interest and total payment, with a chart of how the balance falls over time.";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator",
  description: DESC,
  keywords: [
    "home loan emi calculator",
    "housing loan emi calculator",
    "home loan calculator",
    "mortgage emi calculator",
    "home loan repayment calculator",
    "house loan emi calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Home Loan EMI Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Home Loan EMI Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is a home loan EMI calculated?",
    answer:
      "Home loan EMI uses the formula EMI = P·r(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate divided by 12 and by 100) and n is the number of monthly payments. It gives a fixed monthly amount that clears the loan over the chosen tenure.",
  },
  {
    question: "Why is so much of my early EMI just interest?",
    answer:
      "Interest is charged on the outstanding balance, which is highest at the start. So in the early years most of each EMI covers interest and only a small part reduces the principal. As the balance falls over time, more of every payment goes toward principal.",
  },
  {
    question: "Should I choose a longer or shorter tenure?",
    answer:
      "A longer tenure lowers your monthly EMI, which helps cash flow, but you pay much more total interest because the balance stays outstanding longer. A shorter tenure raises the EMI but saves a large amount of interest over the life of the home loan.",
  },
  {
    question: "Can prepaying my home loan save money?",
    answer:
      "Yes. Because home loans run for many years, extra payments toward principal, especially early on, cut the balance that interest is charged on and can save years of payments. Check whether your lender charges prepayment fees before you start.",
  },
];

export default async function HomeLoanEmiCalculatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Loan EMI Calculator",
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
      title="Home Loan EMI Calculator"
      intro="Work out your monthly home loan EMI, total interest and total payment, and see how the balance falls over time. Enter your numbers and press Calculate."
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
            { name: "Home Loan EMI Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Home Loan EMI Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HomeLoanEmiCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the home loan EMI calculator works</H2>
            <P>
              A home loan is usually the largest and longest loan most people take on, so small
              changes in rate or tenure move the numbers a lot. Each monthly EMI splits between the
              interest charged on the outstanding balance and the principal that reduces it. Because
              the balance starts high, the early years are interest heavy, which is why the balance
              chart above falls slowly at first and faster toward the end.
            </P>
            <P>
              The calculator uses the standard amortization formula and then works through the loan
              month by month. That lets it total the interest precisely and plot exactly how much you
              still owe at the end of each year over the full tenure.
            </P>

            <H2>A quick example</H2>
            <P>
              Take a $300,000 home loan at 7% over 30 years. The monthly EMI is about $1,996. Across
              the full term you repay roughly $718,000, of which around $418,000 is interest. Cutting
              the tenure to 20 years raises the EMI but saves well over a hundred thousand dollars in
              interest.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate of principal and interest only. Your real housing cost may also
              include property tax, insurance and other fees, and your rate depends on credit and
              lender. For guidance on shopping for a home loan, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              To add taxes and insurance, try our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>{" "}
              or browse our{" "}
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
