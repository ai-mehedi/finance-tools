import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ClvCalculator from "./ClvCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/clv-calculator";
const SELF_SLUG = "clv-calculator";

const DESC =
  "Free customer lifetime value (CLV) calculator. Estimate the gross profit an average customer brings over their lifetime, net of acquisition cost, with a clear breakdown.";

const baseMetadata: Metadata = {
  title: "Customer Lifetime Value Calculator",
  description: DESC,
  keywords: [
    "clv calculator",
    "customer lifetime value calculator",
    "ltv calculator",
    "lifetime value calculator",
    "clv to cac ratio",
    "customer value calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Customer Lifetime Value Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Customer Lifetime Value Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is customer lifetime value calculated?",
    answer:
      "A common method multiplies average order value by purchase frequency to get annual revenue, applies the gross margin to get annual profit, then multiplies by the average customer lifespan in years. This calculator follows that approach and then subtracts acquisition cost to show net value.",
  },
  {
    question: "What is a good CLV to CAC ratio?",
    answer:
      "Many businesses aim for a CLV to CAC ratio of about 3 to 1, meaning a customer is worth three times what it costs to acquire them. A ratio near 1 to 1 suggests you are spending too much to win customers, while a very high ratio can mean you are under investing in growth.",
  },
  {
    question: "Should I use revenue or profit for CLV?",
    answer:
      "Gross profit is the more useful figure because it reflects the money left after the cost of goods sold. Using revenue alone overstates a customer's worth, especially for low margin products. This tool applies your gross margin so the result is profit based.",
  },
  {
    question: "How can I increase customer lifetime value?",
    answer:
      "Raise average order value, encourage repeat purchases, improve retention to extend the lifespan, and protect margins. Even small gains in any of these inputs compound across the whole customer base.",
  },
];

export default async function ClvCalculatorPage() {
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
    "💎"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Customer Lifetime Value Calculator",
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
      title="Customer Lifetime Value Calculator"
      intro="Estimate how much gross profit an average customer brings over their whole relationship with your business, and how that compares to what you spend to acquire them. Enter your numbers and press Calculate."
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
            { name: "Customer Lifetime Value Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Customer Lifetime Value Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClvCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How customer lifetime value works</H2>
            <P>
              Customer lifetime value, often shortened to CLV or LTV, is the total gross profit you
              expect from a typical customer across the whole time they buy from you. It turns
              scattered transactions into a single number you can plan around, from marketing budgets
              to retention programs.
            </P>
            <P>
              The model here builds up in stages. Average order value times purchase frequency gives
              annual revenue. Your gross margin converts that into annual profit. Multiply by the
              average customer lifespan and you have gross lifetime value. Subtract the cost to acquire
              the customer to see the net figure that actually lands in your business.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a customer spends $75 an order, buys four times a year at a 60% margin, and stays
              for five years. That is $300 a year in revenue, $180 in annual profit, and $900 of gross
              lifetime value. If acquisition cost is $120, net value is $780 and the CLV to CAC ratio
              is a healthy 7.5 to 1.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              CLV is an estimate built on averages, so revisit it as your data improves. Watch the CLV
              to CAC ratio when planning spend, and pair this with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>{" "}
              to model margins and growth together.
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
