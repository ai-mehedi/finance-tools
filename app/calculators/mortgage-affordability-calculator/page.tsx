import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MortgageAffordabilityCalculator from "./MortgageAffordabilityCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/mortgage-affordability-calculator";
const SELF_SLUG = "mortgage-affordability-calculator";

const DESC =
  "Free mortgage affordability calculator. Find the home price and loan amount you can afford from your income, debts and down payment using lender front-end and back-end DTI limits.";

const baseMetadata: Metadata = {
  title: "Mortgage Affordability Calculator",
  description: DESC,
  keywords: [
    "mortgage affordability calculator",
    "how much house can I afford",
    "home affordability calculator",
    "debt to income mortgage",
    "DTI calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Mortgage Affordability Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Mortgage Affordability Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does a lender decide how much house I can afford?",
    answer:
      "Lenders compare your monthly debts to your gross monthly income using two debt to income ratios. The front-end ratio looks only at the housing payment, and the back-end ratio adds your other debts such as car loans and credit cards. Your affordable payment is whichever of those two limits is lower, and that payment is then turned back into a loan amount and home price.",
  },
  {
    question: "What are the 28 and 36 rules?",
    answer:
      "A common guideline says your housing payment should stay at or below 28 percent of gross monthly income, and your total debt payments should stay at or below 36 percent. Those are the default front-end and back-end limits in this tool, but you can raise or lower them to match a specific loan program or your own comfort level.",
  },
  {
    question: "Does the calculator include taxes and insurance?",
    answer:
      "Yes. Property tax, homeowners insurance and any HOA dues all count toward the housing payment a lender measures, so the tool subtracts them before solving for principal and interest. Because property tax rises with the home price, the calculator solves for the price where the full payment exactly meets your limit.",
  },
  {
    question: "Is the affordable amount how much I should actually spend?",
    answer:
      "Not necessarily. The result is the maximum a typical lender would approve, not a recommendation. Many buyers choose to borrow less to keep room for savings, repairs and changes in income, so treat the number as a ceiling rather than a target.",
  },
];

export default async function MortgageAffordabilityCalculatorPage() {
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
    "🏡"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mortgage Affordability Calculator",
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
      title="Mortgage Affordability Calculator"
      intro="See how much home you can realistically buy. Enter your income, debts, down payment and a rate, then press Calculate to get the price and loan amount that fit standard lender limits."
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
            { name: "Mortgage Affordability Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mortgage Affordability Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MortgageAffordabilityCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the affordability calculator works</H2>
            <P>
              The tool starts from two debt to income ratios that mortgage underwriters use. The
              front-end ratio caps your housing payment at a share of gross income, while the
              back-end ratio caps every debt payment combined. Whichever ceiling is stricter sets the
              most you can spend on housing each month.
            </P>
            <P>
              From that monthly ceiling the calculator removes the parts of the payment that are not
              loan repayment, namely property tax, homeowners insurance and HOA dues, and then converts
              what is left into the largest mortgage that rate and term can support. Adding your down
              payment back on top gives the home price you can afford.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you earn 90,000 dollars a year, carry 450 dollars of monthly debt and have 40,000
              dollars to put down at a 6.5 percent rate over 30 years. With 28 and 36 percent limits the
              back-end rule allows about 2,250 dollars for housing. After tax and insurance, that
              supports a loan near 290,000 dollars and a home price around 330,000 dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Approval also depends on credit score, cash reserves and the lender's own overlays, so the
              real limit can differ. For neutral guidance on shopping for a loan, see the{" "}
              <a href="https://www.consumerfinance.gov/owning-a-home/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB home buying guide</a>.
              Once you settle on a price, estimate the monthly payment with our{" "}
              <Link href="/calculators/mortgage-amortization-calculator" className="text-orange-600 underline">mortgage amortization calculator</Link>.
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
