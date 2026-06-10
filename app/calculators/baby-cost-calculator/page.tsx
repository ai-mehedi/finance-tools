import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BabyCostCalculator from "./BabyCostCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/baby-cost-calculator";
const SELF_SLUG = "baby-cost-calculator";

const DESC =
  "Free baby cost calculator. Estimate the cost of a baby in the first year, including one-time gear, diapers, food, childcare, healthcare and clothing.";

const baseMetadata: Metadata = {
  title: "Baby Cost Calculator",
  description: DESC,
  keywords: [
    "baby cost calculator",
    "cost of a baby",
    "first year baby costs",
    "newborn budget",
    "baby budget calculator",
    "how much does a baby cost",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Baby Cost Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Baby Cost Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How much does a baby cost in the first year?",
    answer:
      "It varies widely by location and choices, but many families in the United States spend somewhere between $12,000 and $25,000 in the first year. Childcare is usually the single largest line item, often dwarfing diapers, food and clothing combined.",
  },
  {
    question: "What is the biggest baby expense?",
    answer:
      "For most working parents it is childcare. Full-time daycare can run several hundred to over a thousand dollars a month depending on the region. If a relative provides care or a parent stays home, this calculator lets you set childcare to zero.",
  },
  {
    question: "How can I cut baby costs?",
    answer:
      "Accept hand-me-downs, buy gear secondhand, use cloth diapers, breastfeed where possible and check whether your employer offers a dependent care FSA. Borrowing big-ticket items like bassinets and clothes from friends also adds up quickly.",
  },
  {
    question: "Does this include hospital and birth costs?",
    answer:
      "No. This tool focuses on the ongoing cost of raising a baby in the first year plus one-time gear. Birth and delivery costs depend heavily on your insurance, so add them separately when planning your overall budget.",
  },
];

export default async function BabyCostCalculatorPage() {
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
    "👶"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Baby Cost Calculator",
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
      title="Baby Cost Calculator"
      intro="Estimate what a baby will cost in the first year, from one-time gear to monthly diapers, food and childcare. Enter your numbers and press Calculate."
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
            { name: "Baby Cost Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Baby Cost Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BabyCostCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the baby cost calculator works</H2>
            <P>
              A baby budget has two parts. First there is the one-time gear you buy before or just
              after the birth, such as a crib, car seat, stroller and a changing table. Second there
              are the recurring monthly costs that continue all year, like diapers, food, healthcare
              and childcare. This tool adds twelve months of recurring costs to your one-time spending
              to estimate a realistic first-year total.
            </P>
            <P>
              The yearly breakdown chart makes it easy to see where the money goes. For most families
              childcare towers over everything else, which is why a small change there moves the total
              far more than cutting back on clothes or toys.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you spend $2,500 on gear, then $80 on diapers, $150 on food, $800 on childcare,
              $120 on healthcare, $60 on clothing and $70 on other items each month. That is $1,280 a
              month, or $15,360 over the year, plus the $2,500 of gear, for about $17,860 in the first
              year.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These are estimates, not quotes. Costs differ a lot by city and by the choices you make.
              For broader family budgeting basics, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable starting point. You can also plan ahead with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>.
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
