import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PmiCalculator from "./PmiCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/pmi-calculator";
const SELF_SLUG = "pmi-calculator";

const DESC =
  "Free PMI calculator. Estimate your monthly private mortgage insurance premium, see when PMI drops off as your loan amortizes, and find the total PMI you will pay before reaching 80 percent loan-to-value.";

const baseMetadata: Metadata = {
  title: "PMI Calculator",
  description: DESC,
  keywords: [
    "pmi calculator",
    "private mortgage insurance calculator",
    "monthly pmi cost",
    "pmi removal calculator",
    "loan to value calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "PMI Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "PMI Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is PMI and why do lenders charge it?",
    answer:
      "PMI stands for private mortgage insurance. On a conventional loan it is usually required when your down payment is less than 20 percent of the home price. It protects the lender, not you, if you stop making payments. Once you build enough equity the lender no longer needs that protection and the charge goes away.",
  },
  {
    question: "How is the monthly PMI premium calculated?",
    answer:
      "Most lenders quote PMI as an annual rate, often between 0.3 and 1.5 percent, applied to the loan balance. To get the monthly cost you multiply the loan balance by the annual rate and then divide by twelve. Because the balance shrinks as you pay down the loan, the dollar amount of PMI slowly falls over time.",
  },
  {
    question: "When does PMI automatically come off?",
    answer:
      "Under federal rules a lender must automatically cancel PMI once the loan is scheduled to reach 78 percent of the original home value, and you can request removal at 80 percent. This calculator amortizes your loan and shows the month the balance crosses the 80 percent mark so you know roughly when PMI should stop.",
  },
  {
    question: "How can I avoid paying PMI?",
    answer:
      "The most direct way is to put at least 20 percent down so PMI is never charged. Other options include making extra principal payments to reach the 80 percent threshold sooner, asking for a new appraisal if your home value has risen, or refinancing once you have enough equity. Some lender-paid PMI loans roll the cost into a slightly higher interest rate instead.",
  },
];

export default async function PmiCalculatorPage() {
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
    name: "PMI Calculator",
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
      title="PMI Calculator"
      intro="See how much private mortgage insurance adds to your payment and when it falls off. Enter your home price, down payment, rate and PMI rate, then press Calculate."
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
            { name: "PMI Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="PMI Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PmiCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the PMI calculator works</H2>
            <P>
              When you buy a home with less than 20 percent down, the lender treats the loan as
              higher risk and adds private mortgage insurance to your monthly bill. This tool takes
              your loan amount, multiplies it by the annual PMI rate, and divides by twelve to show
              the first month of insurance. It then amortizes the mortgage one month at a time,
              tracking your loan-to-value ratio as the balance falls.
            </P>
            <P>
              The chart plots that loan-to-value ratio over the life of the loan against the dashed
              80 percent line where PMI can be removed. Watching the curve cross that line tells you
              at a glance how many years you are likely to carry the extra cost.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you buy a $350,000 home with $35,000 down, a 30-year loan at 6.5 percent, and a
              PMI rate of 0.7 percent. Your loan is $315,000, which is 90 percent of the price, so PMI
              applies. The first monthly premium is about $184, and at this pace the balance reaches
              the 80 percent mark a little before year six, after which the charge should drop away,
              saving you a few thousand dollars in total.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Lenders set PMI rates based on your credit score and down payment, so the rate you are
              quoted may differ from a default estimate. For the federal rules on automatic
              cancellation, see the{" "}
              <a href="https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB guidance on removing PMI</a>.
              To see how the whole payment, including principal and interest, fits your budget, pair
              this with our{" "}
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
export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(SELF_SLUG, baseMetadata);
}
