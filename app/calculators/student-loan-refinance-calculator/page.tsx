import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StudentLoanRefinanceCalculator from "./StudentLoanRefinanceCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/student-loan-refinance-calculator";
const SELF_SLUG = "student-loan-refinance-calculator";

const DESC =
  "Free student loan refinance calculator. Compare your current loan with a new rate and term to see your new monthly payment, lifetime interest, and whether refinancing actually saves you money.";

const baseMetadata: Metadata = {
  title: "Student Loan Refinance Calculator",
  description: DESC,
  keywords: [
    "student loan refinance calculator",
    "refinance student loans",
    "loan refinance savings",
    "new monthly payment",
    "interest comparison calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Student Loan Refinance Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Student Loan Refinance Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "Does a lower rate always save money?",
    answer:
      "Not always. A lower rate cuts the interest charged each month, but stretching the loan over a longer term can erase that gain because you pay for more months. This calculator compares total interest and total paid on both loans so you see the true lifetime effect, not just the monthly payment.",
  },
  {
    question: "How is the new monthly payment worked out?",
    answer:
      "It uses the standard amortizing-loan formula: the balance, the new monthly rate and the new number of months produce a single level payment that clears the loan exactly at the end of the term. The same formula is applied to your current loan so the comparison is apples to apples.",
  },
  {
    question: "Should I refinance federal student loans?",
    answer:
      "Refinancing federal loans with a private lender gives up federal protections like income-driven repayment, deferment and forgiveness. If you rely on those, the rate savings may not be worth it. Refinancing tends to make most sense for private loans or for borrowers with stable income who will not need those programs.",
  },
  {
    question: "What rate do I need to make refinancing worthwhile?",
    answer:
      "There is no single threshold. Keep the term the same or shorter and any rate below your current one reduces total interest. If you lengthen the term to lower the payment, you may need a noticeably lower rate to still come out ahead overall. Run both scenarios here before deciding.",
  },
];

export default async function StudentLoanRefinanceCalculatorPage() {
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
    "🔁"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Student Loan Refinance Calculator",
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
      title="Student Loan Refinance Calculator"
      intro="Decide whether a refinance offer is worth it. Enter your current loan and the new rate and term, then press Calculate to compare monthly payments, lifetime interest and total savings."
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
            { name: "Student Loan Refinance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Student Loan Refinance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentLoanRefinanceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the student loan refinance calculator works</H2>
            <P>
              The tool builds two loans from the same balance. The first uses your current rate and the
              months you have left; the second uses the new rate and term you are considering. Each is
              run through the standard amortizing-payment formula to find a level monthly payment, then
              the lifetime interest and total paid.
            </P>
            <P>
              The chart plots the remaining balance on both loans year by year. Where the refinanced
              line sits below the current one, you are paying the loan down faster; where it sits above,
              the longer term is keeping you in debt longer even if the monthly payment feels lighter.
            </P>

            <H2>A quick example</H2>
            <P>
              Imagine $40,000 left at 7.5 percent with nine years to go. Refinancing to 5.25 percent
              over ten years drops the monthly payment noticeably, yet the extra year of payments eats
              into the interest savings. The calculator shows whether the lower rate still wins once the
              longer term is counted.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Refinancing federal loans into a private loan permanently gives up federal benefits, so
              weigh that before chasing a rate. Review what you would lose at{" "}
              <a href="https://studentaid.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">StudentAid.gov</a>.
              If you plan to keep your current loan instead, see how extra payments help with our{" "}
              <Link href="/calculators/student-loan-payoff-calculator" className="text-orange-600 underline">student loan payoff calculator</Link>.
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
