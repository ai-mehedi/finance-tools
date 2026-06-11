import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import HomeAffordabilityCalculator from "./HomeAffordabilityCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/home-affordability-calculator";
const SELF_SLUG = "home-affordability-calculator";

const DESC =
  "Free home affordability calculator. Find the home price you can comfortably afford from your income, debts, down payment and mortgage rate, with a breakdown of the monthly principal, interest, tax and insurance.";

const baseMetadata: Metadata = {
  title: "Home Affordability Calculator",
  description: DESC,
  keywords: [
    "home affordability calculator",
    "how much house can I afford",
    "mortgage affordability calculator",
    "debt to income home price",
    "home buying budget calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Home Affordability Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Home Affordability Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much house can I afford?",
    answer:
      "A common guideline caps your total monthly debts, including the new housing payment, at about 36 percent of your gross monthly income. This calculator applies that limit, subtracts your existing debts, sets aside room for property tax and insurance, and then works out the largest loan and home price that still fit.",
  },
  {
    question: "What is the debt-to-income ratio?",
    answer:
      "The debt-to-income ratio, or DTI, is your monthly debt payments divided by your gross monthly income. Lenders use it to judge how much new debt you can handle. A back-end DTI of 36 percent is a conservative default, though some loan programs stretch higher for strong borrowers.",
  },
  {
    question: "Why are property tax and insurance included?",
    answer:
      "Your true monthly housing cost is more than principal and interest. Property tax and homeowners insurance are usually collected with the mortgage payment, so they eat into the same budget. Leaving them out would overstate the home price you can afford, so the tool subtracts them before sizing the loan.",
  },
  {
    question: "Does a bigger down payment let me buy more?",
    answer:
      "Yes. The down payment is cash that does not need to be borrowed, so it adds directly on top of the loan your income can support. A larger down payment also lowers the loan, which shrinks the monthly principal and interest and can help you avoid mortgage insurance.",
  },
];

export default async function HomeAffordabilityCalculatorPage() {
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
    name: "Home Affordability Calculator",
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
      title="Home Affordability Calculator"
      intro="Find out how much house your budget can really stretch to. Enter your income, debts, down payment and mortgage details, then press Calculate to see an affordable home price and the monthly payment behind it."
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
            { name: "Home Affordability Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Home Affordability Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HomeAffordabilityCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the affordability calculator works</H2>
            <P>
              Affordability starts from your paycheck, not the listing price. The tool takes your
              gross income, applies a debt-to-income cap, and subtracts the debts you already pay each
              month. What is left is the budget available for housing. From that budget it carves out
              property tax and insurance, then uses the mortgage formula in reverse to find the loan,
              and therefore the home price, that the remaining payment can support.
            </P>
            <P>
              The donut chart shows where each dollar of the monthly payment goes. Principal and
              interest usually dominate, but tax and insurance can together claim a surprisingly large
              slice, especially in high-tax areas.
            </P>

            <H2>A worked example</H2>
            <P>
              Take a 90,000 dollar income, 400 dollars of monthly debts, a 40,000 dollar down payment,
              a 6.5 percent rate over 30 years, and a 36 percent DTI cap. The housing budget works out
              to about 2,300 dollars a month. After tax and insurance, that supports a loan of roughly
              290,000 dollars, which combined with the down payment puts an affordable home near
              330,000 dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Lenders also weigh your credit score, employment history and cash reserves, so a quote
              may differ from this estimate. Buying at the very top of your budget leaves little room
              for repairs or rate changes, so many buyers aim lower on purpose. For a neutral guide to
              the mortgage process, see{" "}
              <a href="https://www.consumerfinance.gov/owning-a-home/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB home-buying guide</a>.
              To pin down the exact monthly payment on a specific price, use our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              to project the savings for your down payment first.
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
