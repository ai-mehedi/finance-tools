import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BiweeklyMortgageCalculator from "./BiweeklyMortgageCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/biweekly-mortgage-calculator";
const SELF_SLUG = "biweekly-mortgage-calculator";

const DESC =
  "Free biweekly mortgage calculator. Compare paying half your mortgage every two weeks against monthly payments to see the interest saved and how many years sooner you pay off your loan.";

const baseMetadata: Metadata = {
  title: "Biweekly Mortgage Calculator",
  description: DESC,
  keywords: [
    "biweekly mortgage calculator",
    "biweekly vs monthly mortgage",
    "mortgage payoff calculator",
    "extra mortgage payment calculator",
    "biweekly payment savings",
    "pay off mortgage early calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Biweekly Mortgage Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Biweekly Mortgage Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does a biweekly mortgage work?",
    answer:
      "Instead of one monthly payment, you pay half of it every two weeks. Because there are 52 weeks in a year, that means 26 half-payments, which equals 13 full monthly payments instead of 12. The one extra payment each year goes straight to principal and shortens the loan.",
  },
  {
    question: "How much can a biweekly schedule save?",
    answer:
      "On a typical 30-year loan, switching to true biweekly payments often pays the mortgage off about four to six years early and can save tens of thousands of dollars in interest. The exact figures depend on your loan amount, rate and term, which this calculator works out for you.",
  },
  {
    question: "Is a biweekly mortgage the same as paying extra?",
    answer:
      "Essentially yes. The savings come from the single extra monthly payment spread across the year. You could achieve the same result by adding one-twelfth of your payment to each monthly bill, as long as the lender applies the extra to principal.",
  },
  {
    question: "Are there any downsides to biweekly payments?",
    answer:
      "Some lenders or third-party services charge setup or transaction fees for biweekly programs, which can erode the savings. Always confirm there is no prepayment penalty and that extra amounts are applied to principal. Doing it yourself by paying extra each month avoids most fees.",
  },
];

export default async function BiweeklyMortgageCalculatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Biweekly Mortgage Calculator",
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
      title="Biweekly Mortgage Calculator"
      intro="See how paying half your mortgage every two weeks pays the loan off years early and saves interest compared with monthly payments. Enter your numbers and press Calculate."
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
            { name: "Biweekly Mortgage Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Biweekly Mortgage Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BiweeklyMortgageCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the biweekly mortgage calculator works</H2>
            <P>
              A standard mortgage is paid once a month, twelve times a year. A biweekly schedule
              splits that payment in half and charges it every two weeks. Since a year has 52 weeks,
              you make 26 half-payments, which adds up to 13 full monthly payments instead of 12. That
              one extra payment each year goes entirely to principal.
            </P>
            <P>
              Knocking down the principal faster means less interest accrues on the remaining balance,
              so the loan is paid off sooner. The chart above shows both plans side by side: the
              biweekly balance (orange) falls below the monthly balance (dashed) and reaches zero
              years earlier.
            </P>

            <H2>A quick example</H2>
            <P>
              Take a $300,000 loan at 6.5% over 30 years. The monthly payment is about $1,896, so the
              biweekly payment is roughly $948. Paying that every two weeks clears the loan in about 25
              years instead of 30 and saves well over $60,000 in interest, simply from one extra
              payment a year.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The savings rely on the extra amount actually reaching principal, so confirm your lender
              applies it that way and that there is no prepayment penalty. Watch out for biweekly
              programs that charge fees. For guidance on managing a mortgage, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. Compare more scenarios with our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
