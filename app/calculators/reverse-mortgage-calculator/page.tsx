import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ReverseMortgageCalculator from "./ReverseMortgageCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/reverse-mortgage-calculator";
const SELF_SLUG = "reverse-mortgage-calculator";

const DESC =
  "Free reverse mortgage calculator. Estimate the principal limit and net cash you can draw from a HECM, after insurance, closing costs and any existing loan, plus a chart of how the loan balance grows against your home value.";

const baseMetadata: Metadata = {
  title: "Reverse Mortgage Calculator",
  description: DESC,
  keywords: [
    "reverse mortgage calculator",
    "HECM calculator",
    "home equity conversion mortgage",
    "principal limit factor",
    "reverse mortgage payout",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Reverse Mortgage Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Reverse Mortgage Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much can I get from a reverse mortgage?",
    answer:
      "The amount is based on your home value (up to the federal lending limit), the age of the youngest borrower and the expected interest rate. These set a principal limit factor, and the principal limit is your capped home value times that factor. From it you subtract upfront mortgage insurance, financed closing costs and any existing mortgage that must be paid off.",
  },
  {
    question: "Why does borrower age matter so much?",
    answer:
      "A reverse mortgage is not repaid until the last borrower leaves the home, so the lender expects the loan to be outstanding for fewer years when borrowers are older. That shorter expected term lets older borrowers access a larger share of their equity, which is why the principal limit factor rises with age.",
  },
  {
    question: "Do I still owe money over time?",
    answer:
      "Yes. You make no monthly payments, but interest and ongoing mortgage insurance are added to the balance every month, so the loan grows. The chart shows the loan balance climbing while your home value drifts up more slowly, which is how equity is gradually consumed.",
  },
  {
    question: "What is the difference between a lump sum and tenure payout?",
    answer:
      "A lump sum draws the full available amount at closing, so interest accrues on the whole balance right away. A tenure or line of credit payout draws funds gradually, so the balance and interest build more slowly. This calculator lets you switch between them to compare how fast the loan grows.",
  },
];

export default async function ReverseMortgageCalculatorPage() {
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
    name: "Reverse Mortgage Calculator",
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
      title="Reverse Mortgage Calculator"
      intro="See how much equity you could turn into cash. Enter your home value, age and expected rate, pick a payout, then press Calculate to estimate the net amount and watch the loan balance grow over time."
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
            { name: "Reverse Mortgage Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Reverse Mortgage Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReverseMortgageCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the reverse mortgage calculator works</H2>
            <P>
              A reverse mortgage lets homeowners aged 62 and over borrow against their equity without
              monthly payments. This tool follows the logic of a Home Equity Conversion Mortgage. It
              first caps your home value at the federal lending limit, then multiplies it by a
              principal limit factor that grows with the borrower age and falls as the expected rate
              rises. That gives the gross principal limit.
            </P>
            <P>
              From the principal limit it subtracts the upfront mortgage insurance premium, your
              financed closing costs and any existing mortgage that has to be paid off at closing. What
              is left is the net cash you can actually receive, shown either as a single payout or an
              estimated monthly tenure amount.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose a 70 year old owns a home worth 500,000 dollars with a 40,000 dollar mortgage and
              expects a 6.5 percent rate. The principal limit factor lands near 39 percent, giving a
              principal limit around 195,000 dollars. After 10,000 dollars of insurance, 15,000 dollars
              of closing costs and the 40,000 dollar payoff, roughly 130,000 dollars of net cash
              remains. Over the next 15 years interest and insurance steadily push the balance higher.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These figures are estimates. Actual principal limit factors come from official HUD tables
              and your real rate, fees and counseling will move the numbers. Reverse mortgages also
              carry obligations like staying current on taxes, insurance and upkeep. Read the consumer
              guide at{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/reverse-mortgages/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB</a>{" "}
              before committing. If you simply want to compare a regular loan, try our{" "}
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
