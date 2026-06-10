import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CreditScoreCalculator from "./CreditScoreCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/credit-score-simulator";
const SELF_SLUG = "credit-score-simulator";

const DESC =
  "Free credit score simulator. Estimate a FICO-style score from the five weighted factors, payment history, utilization, history length, credit mix and new credit.";

export const metadata: Metadata = {
  title: "Credit Score Simulator",
  description: DESC,
  keywords: [
    "credit score simulator",
    "credit score calculator",
    "fico score estimator",
    "estimate credit score",
    "credit score factors",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Credit Score Simulator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Credit Score Simulator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What factors make up a credit score?",
    answer:
      "FICO weights five factors: payment history at about 35%, amounts owed and utilization at 30%, length of credit history at 15%, credit mix at 10%, and new credit and inquiries at 10%. This simulator scores each factor and combines them on the 300 to 850 scale.",
  },
  {
    question: "Is this my real credit score?",
    answer:
      "No. It is an educational estimate based on the inputs you provide and the published FICO weightings. Your actual score uses your full bureau file, the exact scoring model and lender specific data, so the real number can differ.",
  },
  {
    question: "What is the fastest way to raise my score?",
    answer:
      "Paying every bill on time and lowering credit utilization tend to have the biggest, fastest impact, since together they account for around 65% of the score. Avoiding unnecessary hard inquiries and keeping old accounts open also help over time.",
  },
  {
    question: "What is a good credit score?",
    answer:
      "On the common 300 to 850 scale, 670 and up is generally considered good, 740 and up is very good, and 800 and up is exceptional. Scores below 580 are usually labeled poor and make borrowing more expensive.",
  },
];

export default async function CreditScoreSimulatorPage() {
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
    name: "Credit Score Simulator",
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
      title="Credit Score Simulator"
      intro="Estimate a FICO-style credit score from the five factors that drive it, and see how each one contributes. Adjust your profile and press Calculate."
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
            { name: "Credit Score Simulator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Credit Score Simulator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreditScoreCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the score simulator works</H2>
            <P>
              FICO scores are built from five categories with published weights: payment history
              (35%), amounts owed and utilization (30%), length of credit history (15%), credit mix
              (10%) and new credit (10%). The simulator rates how well your inputs perform in each
              category, multiplies by the weight, and maps the result onto the 300 to 850 scale.
            </P>
            <P>
              The factor bars above show the strength of each category, so you can see where you are
              strong and where there is room to improve. Because payment history and utilization
              together carry about 65% of the weight, small wins there move the score the most.
            </P>

            <H2>A quick example</H2>
            <P>
              A profile with 98% on-time payments, 25% utilization, a six year average account age,
              three credit types and one recent inquiry lands in the very good range. Push
              utilization down toward 10% and the estimate climbs noticeably, since that single
              change improves the second heaviest factor.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a learning tool, not your official score. Lenders use specific models and your
              full bureau file. To see your real reports for free, use the federally authorized site{" "}
              <a href="https://www.annualcreditreport.com" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">AnnualCreditReport.com</a>,
              and review the basics at the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              Lower your utilization first with our{" "}
              <Link href="/calculators/credit-utilization-calculator" className="text-orange-600 underline">credit utilization calculator</Link>.
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
