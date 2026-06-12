import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanAffordabilityCalculator from "./LoanAffordabilityCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/loan-affordability-calculator";
const SELF_SLUG = "loan-affordability-calculator";

const DESC =
  "Free loan affordability calculator. Enter your income, existing debts, debt-to-income limit, rate and term to find the largest monthly payment and loan amount you can comfortably afford.";

const baseMetadata: Metadata = {
  title: "Loan Affordability Calculator",
  description: DESC,
  keywords: [
    "loan affordability calculator",
    "how much can I borrow",
    "debt to income calculator",
    "affordable loan amount",
    "borrowing power calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Loan Affordability Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Loan Affordability Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does this calculator decide what I can afford?",
    answer:
      "It works backward from your budget. Your gross monthly income times the debt-to-income ceiling gives the most a lender will let go to all debt. Subtracting your existing debt payments leaves the room for a new loan, and that affordable payment is converted into the loan amount it can support at your rate and term.",
  },
  {
    question: "What is debt-to-income ratio and what is a safe number?",
    answer:
      "Debt-to-income, or DTI, is the share of your gross income that goes to debt payments each month. Many lenders cap total DTI around 36 to 43 percent. A lower ceiling leaves more breathing room in your budget, while a higher one stretches you closer to the limit.",
  },
  {
    question: "Does a longer term let me borrow more?",
    answer:
      "Yes. Spreading the same affordable payment over more months supports a larger principal, so a longer term raises the loan amount. The trade-off is more total interest over the life of the loan, since you carry the balance for longer.",
  },
  {
    question: "Should I borrow the full amount the calculator shows?",
    answer:
      "Not necessarily. The figure is a ceiling based on a lender's ratio, not a comfort level. It ignores savings goals, irregular expenses and emergencies, so many people choose to borrow well below the maximum to keep their monthly budget flexible.",
  },
];

export default async function LoanAffordabilityCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Loan Affordability Calculator",
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
      title="Loan Affordability Calculator"
      intro="Find out how much you can realistically borrow. Enter your income, existing debts, a debt-to-income limit, rate and term, then press Calculate to see your affordable payment and loan amount."
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
            { name: "Loan Affordability Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan Affordability Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanAffordabilityCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan affordability calculator works</H2>
            <P>
              Rather than asking how much a loan costs, this tool asks how much loan your budget can
              carry. It multiplies your gross monthly income by the debt-to-income ceiling to find the
              total your lender will allow toward debt, then subtracts the payments you already make.
              What is left is the room available for a new loan payment.
            </P>
            <P>
              That affordable payment is then turned into a principal using the present value of an
              annuity, which is the same math a lender uses in reverse. Feed in a different rate or
              term and the loan amount moves, since both change how much principal a fixed payment can
              support.
            </P>

            <H2>A worked example</H2>
            <P>
              Say you earn 6,000 dollars a month, already pay 650 dollars toward other debts, and a
              lender uses a 36 percent DTI cap. That allows 2,160 dollars of total debt, leaving 1,510
              dollars for a new loan. At 7.5 percent over five years, that payment supports a loan of
              roughly 75,000 dollars before interest is added on top.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Lenders also weigh credit history, down payment, taxes and insurance, so an approval may
              land above or below this estimate. The maximum is a ceiling, not a goal, and borrowing
              below it protects your budget. For a primer on the ratio behind the math, see the{" "}
              <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-en-1791/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB explainer on debt-to-income ratio</a>.
              Once you settle on an amount, our{" "}
              <Link href="/calculators/loan-calculator" className="text-orange-600 underline">loan calculator</Link> will show the full payment schedule.
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
