import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CarLoanCalculator from "./CarLoanCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/car-loan-calculator";
const SELF_SLUG = "car-loan-calculator";

const DESC =
  "Free car loan calculator. Estimate your monthly car payment, total interest and total cost from the vehicle price, down payment, interest rate and loan term, with a payoff chart.";

const baseMetadata: Metadata = {
  title: "Car Loan Calculator",
  description: DESC,
  keywords: [
    "car loan calculator",
    "auto loan calculator",
    "monthly car payment calculator",
    "car finance calculator",
    "vehicle loan calculator",
    "car payment estimator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Car Loan Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Car Loan Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is a monthly car payment calculated?",
    answer:
      "The payment uses the amortizing loan formula M = P·r(1+r)^n / ((1+r)^n − 1), where P is the amount financed, r is the monthly interest rate and n is the number of monthly payments. The amount financed is the car price minus your down payment.",
  },
  {
    question: "How much should I put down on a car?",
    answer:
      "A common guideline is at least 20% down on a new car and 10% on a used one. A larger down payment lowers the amount you finance, which reduces both your monthly payment and the total interest you pay over the life of the loan.",
  },
  {
    question: "Does a longer loan term save me money?",
    answer:
      "A longer term lowers the monthly payment but raises the total interest, because you borrow the money for more time. A 72 or 84 month loan can also leave you owing more than the car is worth. Shorter terms cost more per month but less overall.",
  },
  {
    question: "What is not included in this estimate?",
    answer:
      "This calculator covers principal and interest on the loan only. It does not include sales tax, title and registration fees, dealer add-ons, or gap and extended warranty products, which are sometimes rolled into the financed amount and would increase your payment.",
  },
];

export default async function CarLoanCalculatorPage() {
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
    name: "Car Loan Calculator",
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
      title="Car Loan Calculator"
      intro="Estimate your monthly car payment, total interest and total cost, and see how the balance falls over time. Enter your numbers and press Calculate."
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
            { name: "Car Loan Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Car Loan Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CarLoanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the car loan calculator works</H2>
            <P>
              Your monthly payment is split into two parts: paying down what you borrowed (principal)
              and the interest the lender charges. In the early months most of each payment goes to
              interest. As the balance falls, more goes to principal, which is why the payoff chart
              above curves down slowly at first and faster near the end.
            </P>
            <P>
              The amount you finance is simply the car price minus your down payment. A bigger down
              payment shrinks the loan, which lowers both your monthly payment and the total interest
              you pay. Trade-in value works the same way as cash down.
            </P>

            <H2>A quick example</H2>
            <P>
              Finance a $35,000 car with $5,000 down at 7.5% over 5 years. The $30,000 loan costs
              about $601 a month. Over the full term you pay roughly $6,053 in interest, so the total
              cost of the loan is about $36,053 on top of your down payment.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate of principal and interest only. Your real out-the-door cost also
              includes sales tax, fees and any add-ons. Your rate depends on your credit, the lender
              and whether the car is new or used. For tips on shopping for an auto loan, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              You can also compare scenarios with our{" "}
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

export async function generateMetadata(): Promise<Metadata> {
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
