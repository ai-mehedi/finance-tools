import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MarkupCalculator from "./MarkupCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/markup-calculator";
const SELF_SLUG = "markup-calculator";

const DESC =
  "Free markup calculator. Enter a unit cost and a markup percentage to find the selling price, profit per unit and the equivalent gross margin, with a chart comparing common markup levels.";

const baseMetadata: Metadata = {
  title: "Markup Calculator",
  description: DESC,
  keywords: [
    "markup calculator",
    "markup percentage calculator",
    "selling price calculator",
    "cost plus pricing",
    "markup vs margin",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Markup Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Markup Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is markup?",
    answer:
      "Markup is the amount you add to the cost of an item to set its selling price, written as a percentage of the cost. A 60 percent markup on a 50 dollar item adds 30 dollars, giving a 80 dollar price. It is the heart of cost-plus pricing.",
  },
  {
    question: "How do I calculate selling price from markup?",
    answer:
      "Multiply the cost by the markup percentage written as a decimal to get the profit, then add that profit to the cost. In short, selling price equals cost times one plus the markup divided by 100.",
  },
  {
    question: "Is markup the same as margin?",
    answer:
      "No. Markup measures profit against the cost, while margin measures the same profit against the selling price. Because price is larger than cost, the margin percent is always smaller than the markup percent. A 50 percent markup, for example, equals a 33 percent margin.",
  },
  {
    question: "How do I convert markup to margin?",
    answer:
      "Divide the markup by one plus the markup, both written as decimals, to get the margin. For a 60 percent markup, that is 0.6 divided by 1.6, which is 0.375, or a margin of 37.5 percent. This tool shows the equivalent margin for you automatically.",
  },
];

export default async function MarkupCalculatorPage() {
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
    "🏷️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Markup Calculator",
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
      title="Markup Calculator"
      intro="Price your products with confidence. Enter a unit cost and the markup you want to apply, then press Calculate to see the selling price, profit per unit and the equivalent gross margin."
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
            { name: "Markup Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Markup Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarkupCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the markup calculator works</H2>
            <P>
              Markup is the simplest way to price from cost. The tool takes your unit cost, multiplies
              it by the markup percentage to find the profit you are adding, and then sums the two to
              give the selling price. It also flips the markup into its equivalent margin so you can see
              both views of the same profit.
            </P>
            <P>
              The bar chart lines up several common markup levels against your chosen one, making it easy
              to see how the selling price climbs as you raise the markup, and to sanity-check your price
              against the competition.
            </P>

            <H2>A quick example</H2>
            <P>
              Say an item costs you 50 dollars and you apply a 60 percent markup. The profit you add is
              30 dollars, the selling price becomes 80 dollars, and the gross margin works out to 37.5
              percent. Notice the margin is smaller than the markup because it is measured against the
              larger price rather than the cost.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A markup that only covers the cost of goods can leave you short once overhead, returns and
              fees are counted, so build a cushion into the percentage. For practical pricing advice for
              small businesses, see the SCORE resource library at{" "}
              <a href="https://www.score.org" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SCORE.org</a>.
              To view the same numbers from the price side instead of the cost side, use our{" "}
              <Link href="/calculators/margin-calculator" className="text-orange-600 underline">margin calculator</Link>.
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
