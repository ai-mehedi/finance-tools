import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SecondMortgageCalculator from "./SecondMortgageCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/second-mortgage-calculator";
const SELF_SLUG = "second-mortgage-calculator";

const DESC =
  "Free second mortgage calculator. Estimate the monthly payment, total interest and combined loan-to-value of a home equity loan, and see how much you can borrow under the lender's CLTV cap.";

const baseMetadata: Metadata = {
  title: "Second Mortgage Calculator",
  description: DESC,
  keywords: [
    "second mortgage calculator",
    "home equity loan calculator",
    "combined loan to value",
    "CLTV calculator",
    "home equity payment",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Second Mortgage Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Second Mortgage Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a second mortgage?",
    answer:
      "A second mortgage is a fixed-amount loan taken against the equity in a home you already own, on top of your existing first mortgage. It is repaid on its own amortization schedule and sits in second position, meaning the first mortgage lender is paid first if the home is ever sold under distress.",
  },
  {
    question: "What does combined loan-to-value mean?",
    answer:
      "Combined loan-to-value, or CLTV, is the total of your first mortgage balance plus the new second mortgage, divided by the home's value. Lenders cap this figure, often around 80 to 90 percent, so the calculator shows your borrowing room and flags the request if it would push the CLTV past the limit you enter.",
  },
  {
    question: "Why is the interest rate higher than my first mortgage?",
    answer:
      "Because a second mortgage is repaid only after the first in a forced sale, the lender takes on more risk and charges more to compensate. Rates are also usually fixed for the full term, so you trade a higher rate for a payment that does not move, unlike a variable home equity line of credit.",
  },
  {
    question: "How is a second mortgage different from a HELOC?",
    answer:
      "A second mortgage, sometimes called a home equity loan, hands you a single lump sum at a fixed rate with level payments. A home equity line of credit instead works like a credit card against your equity, with a variable rate and a draw period. This calculator models the fixed lump-sum version.",
  },
];

export default async function SecondMortgageCalculatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Second Mortgage Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Second Mortgage Calculator"
      intro="Work out what a home equity loan would cost. Enter your home value, first mortgage balance, the amount you want to borrow, a rate and a term, then press Calculate to see the payment and your borrowing room."
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
            { name: "Second Mortgage Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Second Mortgage Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SecondMortgageCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the second mortgage calculator works</H2>
            <P>
              The tool does two jobs. First it amortizes the amount you want to borrow over the term you
              choose, producing a level monthly payment and totaling the interest you would pay across
              the life of the loan. Second it checks whether you actually have the equity to borrow that
              much, by comparing your first mortgage balance plus the new loan against the lender's
              combined loan-to-value ceiling.
            </P>
            <P>
              The chart tracks two lines as the years pass. The shaded area is the principal you still
              owe on the second mortgage, falling toward zero, while the dashed grey line is the interest
              you have handed over so far. Early on the balance barely moves because most of each payment
              is interest; later the lines cross as principal repayment speeds up.
            </P>

            <H2>A worked example</H2>
            <P>
              Say your home is worth 450,000 dollars with 260,000 dollars left on the first mortgage. At
              an 85 percent CLTV cap the lender will allow combined debt of 382,500 dollars, leaving
              122,500 dollars of borrowing room. Borrow 50,000 dollars of that over 15 years at 8.5
              percent and the payment is roughly 492 dollars a month, with around 38,600 dollars of
              interest over the full term.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A second mortgage puts your home on the line, so a missed run of payments can lead to
              foreclosure just as a first mortgage can. Shop the rate, watch for closing costs the
              payment figure does not include, and read the consumer guidance from the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              before signing. If you only need to know the payment on a single loan, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              can show what investing the cash instead might grow into.
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
