import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BusinessLoanCalculator from "./BusinessLoanCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/business-loan-calculator";
const SELF_SLUG = "business-loan-calculator";

const DESC =
  "Free business loan calculator. Estimate your monthly payment, total interest, total repayment and the effective cost including a one-time origination fee, with a payoff chart.";

const baseMetadata: Metadata = {
  title: "Business Loan Calculator",
  description: DESC,
  keywords: [
    "business loan calculator",
    "business loan payment calculator",
    "commercial loan calculator",
    "small business loan calculator",
    "loan repayment calculator",
    "origination fee calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Business Loan Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Business Loan Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is a business loan payment calculated?",
    answer:
      "Most fixed-rate business loans amortize, meaning each monthly payment is the same and covers both interest and principal. The payment uses M = P·r(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly rate and n is the number of monthly payments.",
  },
  {
    question: "What is an origination fee?",
    answer:
      "An origination fee is a one-time charge a lender adds for processing the loan, usually a percentage of the amount borrowed. It is often deducted from the funds you receive or added to your balance, so it raises the real cost of the loan beyond the stated interest rate.",
  },
  {
    question: "What does effective cost include?",
    answer:
      "In this calculator, the effective cost is the total interest you pay over the life of the loan plus the one-time origination fee. Looking at this combined number gives you a clearer picture of what borrowing truly costs than the interest rate alone.",
  },
  {
    question: "How can I lower the cost of a business loan?",
    answer:
      "A shorter term, a lower rate or a smaller amount all reduce total interest. Comparing lenders, improving your business credit and negotiating or avoiding fees can also cut the effective cost. Paying extra toward principal when allowed shortens the term and saves interest.",
  },
];

export default async function BusinessLoanCalculatorPage() {
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
    "💼"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Business Loan Calculator",
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
      title="Business Loan Calculator"
      intro="Estimate your monthly business loan payment, total interest and the effective cost including any origination fee, and see how the balance falls over time. Enter your numbers and press Calculate."
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
            { name: "Business Loan Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Business Loan Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BusinessLoanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the business loan calculator works</H2>
            <P>
              A fixed-rate business loan is amortized, so every monthly payment is identical. Early
              payments are mostly interest because interest is charged on the full outstanding
              balance. As you pay the balance down, more of each payment goes to principal, which is
              why the payoff chart above falls slowly at first and faster toward the end.
            </P>
            <P>
              The total interest is simply the sum of every interest charge over the life of the
              loan. Add the one-time origination fee on top and you get the effective cost of
              borrowing, which is the most honest way to compare two offers that have different rates
              and fees.
            </P>

            <H2>A quick example</H2>
            <P>
              Borrow $100,000 at 9% over 5 years with a 2% origination fee. The monthly payment is
              about $2,076, and you pay roughly $24,560 in interest. The 2% fee adds $2,000, so the
              effective cost of the loan is close to $26,560 on top of the amount you borrowed.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate for a standard amortizing loan. Some business financing uses factor
              rates, daily payments or balloon structures that work differently. For guidance on small
              business financing, the{" "}
              <a href="https://www.sba.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Small Business Administration</a>{" "}
              is a reliable starting point. You can also compare scenarios with our{" "}
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
