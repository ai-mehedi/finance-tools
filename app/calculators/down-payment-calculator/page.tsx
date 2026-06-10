import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DownPaymentCalculator from "./DownPaymentCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/down-payment-calculator";
const SELF_SLUG = "down-payment-calculator";

const DESC =
  "Free down payment calculator. Work out your down payment, loan amount, closing costs and total cash needed to buy a home from the price and percentage down.";

const baseMetadata: Metadata = {
  title: "Down Payment Calculator",
  description: DESC,
  keywords: [
    "down payment calculator",
    "home down payment calculator",
    "mortgage down payment calculator",
    "cash to close calculator",
    "loan to value calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Down Payment Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Down Payment Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is a down payment calculated?",
    answer:
      "Multiply the home price by your down payment percentage. A 20% down payment on a $350,000 home is $70,000. The rest, $280,000, becomes the loan amount you borrow from a lender.",
  },
  {
    question: "How much should I put down on a house?",
    answer:
      "A 20% down payment is a common target because it lets you avoid private mortgage insurance on most conventional loans. Many buyers put down less, sometimes as little as 3% to 5%. A larger down payment lowers your loan, your monthly payment and your total interest.",
  },
  {
    question: "What are closing costs?",
    answer:
      "Closing costs are the fees paid to finalise a home purchase, such as lender fees, title insurance, appraisal and taxes. They often run about 2% to 5% of the price and are paid on top of your down payment, so budget for both.",
  },
  {
    question: "What is loan to value (LTV)?",
    answer:
      "Loan to value is the loan amount divided by the home price, shown as a percentage. A $280,000 loan on a $350,000 home is an 80% LTV. Lenders use LTV to gauge risk, and a lower LTV usually means better terms and no mortgage insurance.",
  },
];

export default async function DownPaymentCalculatorPage() {
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
    name: "Down Payment Calculator",
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
      title="Down Payment Calculator"
      intro="See your down payment, loan amount, closing costs and the total cash you need to buy a home. Enter the price and percentage down, then press Calculate."
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
            { name: "Down Payment Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Down Payment Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DownPaymentCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the down payment calculator works</H2>
            <P>
              Your down payment is simply the home price multiplied by the percentage you choose to
              pay up front. Whatever is left becomes the loan. The calculator also estimates closing
              costs as a percentage of the price, then adds them to the down payment so you can see
              the full amount of cash you need at the table.
            </P>
            <P>
              The split bar shows how much of the price you cover with cash versus how much you
              borrow. Putting more down shrinks the orange loan portion and lowers both your monthly
              payment and the interest you pay over the life of the loan.
            </P>

            <H2>Why 20% matters</H2>
            <P>
              On most conventional loans, a down payment of 20% or more lets you skip private mortgage
              insurance, which can save a meaningful amount each month. The calculator flags when your
              percentage falls below that threshold. Once you know your loan amount, estimate the
              payment with our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Closing costs and down payment requirements vary by loan type and lender, so treat these
              numbers as a planning estimate. For guidance on saving for a home, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. Browse all of our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>{" "}
              for more.
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
