import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CarLoanRefinanceCalculator from "./CarLoanRefinanceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/car-loan-refinance-calculator";
const SELF_SLUG = "car-loan-refinance-calculator";

const DESC =
  "Free car loan refinance calculator. Compare your current auto loan against a new rate and term to see your new monthly payment, monthly savings and lifetime savings.";

export const metadata: Metadata = {
  title: "Car Loan Refinance Calculator",
  description: DESC,
  keywords: [
    "car loan refinance calculator",
    "auto refinance calculator",
    "refinance car loan",
    "auto loan refinance savings",
    "vehicle refinance calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Car Loan Refinance Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Car Loan Refinance Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does refinancing a car loan save money?",
    answer:
      "Refinancing replaces your current loan with a new one, usually at a lower interest rate. A lower rate means less interest accrues each month, which can reduce your payment and the total you pay over the life of the loan. Keeping the same term while lowering the rate gives the clearest savings.",
  },
  {
    question: "Does a longer new term always lower my payment?",
    answer:
      "A longer term spreads the balance over more months, so the monthly payment usually drops. However, stretching the term can increase the total interest you pay even at a lower rate. This calculator shows both the monthly payment and the lifetime cost so you can see the full picture.",
  },
  {
    question: "When is the best time to refinance a car loan?",
    answer:
      "Refinancing tends to make the most sense when interest rates have fallen, when your credit score has improved since you took the loan, or when your original rate was high. It is most effective earlier in the loan, when more interest is still left to pay.",
  },
  {
    question: "Are there costs to refinancing?",
    answer:
      "Some lenders charge title transfer or registration fees, and a few original loans have prepayment penalties. These costs are usually small, but you should confirm them and weigh them against the savings this calculator estimates before signing.",
  },
];

export default async function CarLoanRefinanceCalculatorPage() {
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
    "🚗"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Car Loan Refinance Calculator",
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
      title="Car Loan Refinance Calculator"
      intro="Compare your current auto loan with a new rate and term to see your new payment and how much you could save. Enter your numbers and press Calculate."
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
            { name: "Car Loan Refinance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Car Loan Refinance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CarLoanRefinanceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How car loan refinancing works</H2>
            <P>
              When you refinance, a new lender pays off your existing auto loan and issues a fresh
              loan in its place. The new loan has its own rate and term, so your monthly payment and
              total interest change. The chart above compares how the balance falls under each loan,
              which makes it easy to see which option pays off faster.
            </P>
            <P>
              The biggest lever is the interest rate. A lower rate means more of every payment goes to
              principal instead of interest. If your credit has improved or market rates have dropped
              since you bought the car, refinancing can free up cash each month.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you owe $22,000 with 48 months left at 9.5%. Your payment is about $554 a month.
              Refinance the same balance over 48 months at 6.5% and the payment falls to roughly $522,
              saving around $32 a month and over $1,500 in interest across the loan.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Watch the term carefully. Extending the loan can lower the monthly payment but raise the
              total cost. For consumer guidance on auto loans, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. You can also compare options with our{" "}
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
