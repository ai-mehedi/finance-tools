import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RentVsBuyCalculator from "./RentVsBuyCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/rent-vs-buy-calculator";
const SELF_SLUG = "rent-vs-buy-calculator";

const DESC =
  "Free rent vs buy calculator. Compare the true cost of renting against buying over your time in the home, including the down payment, taxes, upkeep, appreciation and the investment value of money you would have rented.";

const baseMetadata: Metadata = {
  title: "Rent vs Buy Calculator",
  description: DESC,
  keywords: [
    "rent vs buy calculator",
    "should I rent or buy",
    "buy vs rent a home",
    "cost of renting vs buying",
    "break even on buying a house",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Rent vs Buy Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Rent vs Buy Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does a rent vs buy calculator decide which is cheaper?",
    answer:
      "It simulates both paths month by month over the years you plan to stay. The buying side adds up the down payment, mortgage, property tax, insurance and upkeep, then subtracts what you net from selling the home at the end. The renting side adds up the rent you pay and subtracts the growth of money you invest instead of tying it up in a house. The path with the lower net cost wins.",
  },
  {
    question: "Why does the time you stay matter so much?",
    answer:
      "Buying carries large upfront and exit costs, the down payment, closing and the agent fees when you sell. The longer you stay, the more years those one-time costs get spread across, and the more time the home has to appreciate. Stay only a couple of years and renting almost always wins; stay long enough and buying usually pulls ahead. The point where they cross is your break-even.",
  },
  {
    question: "What is the opportunity cost of a down payment?",
    answer:
      "A buyer locks a large sum into the home as a down payment. A renter could invest that same money instead. This calculator credits the renter with the growth that money could have earned at the investment return you set, which is why renting is not simply the rent you pay.",
  },
  {
    question: "Does this include the tax benefits of owning a home?",
    answer:
      "Not directly. Mortgage interest and property tax deductions can lower the cost of owning for some buyers, but they only help if you itemize and they vary widely by income and location. Treat the result as a pre-tax comparison and adjust for your own situation, ideally with a tax professional.",
  },
];

export default async function RentVsBuyCalculatorPage() {
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
    name: "Rent vs Buy Calculator",
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
      title="Rent vs Buy Calculator"
      intro="See whether renting or buying costs less over the years you plan to stay. Enter the home and rent details, then press Calculate to compare the full cost of each path."
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
            { name: "Rent vs Buy Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Rent vs Buy Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RentVsBuyCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the rent vs buy calculator works</H2>
            <P>
              The honest answer to renting versus buying is rarely about the monthly mortgage being
              higher or lower than the rent. It is about total cost over time once you account for the
              money you sink into a home, what that money could have earned elsewhere, and what you walk
              away with when you sell. This tool runs both stories side by side and tells you which one
              leaves you better off.
            </P>
            <P>
              The chart plots the cumulative net cost of each path, so the line that ends up lower is the
              cheaper choice. Early on the buying line sits high because of the down payment and closing,
              then it bends down as the loan is paid off and the home appreciates. The point where the two
              lines cross is your break-even, the year buying starts to pay off.
            </P>

            <H2>A quick example</H2>
            <P>
              On a $400,000 home with 20 percent down at 6.5 percent, owning costs more than $2,200 of rent
              in the early years once you add taxes, insurance and upkeep. Stay seven years with 3.5 percent
              appreciation and the sale proceeds plus paid-down principal can flip the comparison so buying
              edges out renting. Shorten the stay to three years and renting wins easily, because there is no
              time to recover the upfront costs.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Every number here is an assumption about the future, and small changes to appreciation, rent
              growth or investment return can swing the verdict. Treat the result as a guide, not a guarantee,
              and try a few scenarios. For a broader checklist on the decision, the{" "}
              <a href="https://www.consumerfinance.gov/owning-a-home/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB owning-a-home guide</a>{" "}
              is a neutral resource. Once you lean toward buying, size up the loan with our{" "}
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
