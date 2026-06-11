import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CostPerMileCalculator from "./CostPerMileCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/cost-per-mile-calculator";
const SELF_SLUG = "cost-per-mile-calculator";

const DESC =
  "Free cost per mile calculator. Add up fuel, maintenance, insurance and depreciation to see the true cost of driving each mile, per month and per year.";

const baseMetadata: Metadata = {
  title: "Cost Per Mile Calculator",
  description: DESC,
  keywords: [
    "cost per mile calculator",
    "driving cost calculator",
    "cost to drive a mile",
    "mileage cost calculator",
    "true cost of driving",
    "vehicle operating cost",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Cost Per Mile Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Cost Per Mile Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What goes into the cost per mile?",
    answer:
      "Two kinds of cost. Variable costs scale with distance, mainly fuel and maintenance, and are easy to express per mile. Fixed costs like insurance, depreciation and any loan payment happen no matter how far you drive, so they are spread across the miles you actually cover.",
  },
  {
    question: "How do I turn fuel price into a per-mile cost?",
    answer:
      "Divide the price of a gallon by your miles per gallon. At $3.50 a gallon and 28 miles per gallon, fuel costs about $0.125 per mile. The fewer miles per gallon your vehicle gets, the higher this number climbs.",
  },
  {
    question: "Why does driving fewer miles raise the cost per mile?",
    answer:
      "Fixed costs do not change with distance, so when you spread them over fewer miles each one carries a larger share. A car that sits in the driveway still costs you insurance and depreciation, which is why low-mileage drivers often see a high cost per mile.",
  },
  {
    question: "What is a typical cost per mile?",
    answer:
      "For an average car owned and financed, all-in costs often land somewhere around 50 to 70 cents per mile once depreciation and insurance are included. Your number depends on the vehicle, fuel economy, how much you drive and local prices.",
  },
];

export default async function CostPerMileCalculatorPage() {
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
    "🚗"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cost Per Mile Calculator",
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
      title="Cost Per Mile Calculator"
      intro="Find the true cost of every mile you drive. Add fuel, maintenance, insurance and depreciation, then press Calculate to see the cost per mile, per month and per year."
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
            { name: "Cost Per Mile Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Cost Per Mile Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CostPerMileCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the cost per mile is built up</H2>
            <P>
              The calculator separates the two types of cost that drive your real expense. Variable
              costs rise with every mile you cover. Fuel is the obvious one, found by dividing the
              price of a gallon by your miles per gallon, and maintenance such as oil, tires and
              brakes adds a few more cents per mile. Fixed costs, like insurance, depreciation and a
              loan payment, stay the same whether you drive a little or a lot.
            </P>
            <P>
              To turn the fixed costs into a per-mile figure, the calculator spreads them across the
              miles you actually drive each month. That is why two drivers with identical cars can
              have very different costs per mile. The one who drives more dilutes the fixed costs over
              more miles, lowering the per-mile number.
            </P>

            <H2>A quick example</H2>
            <P>
              Drive 1,000 miles a month at 28 miles per gallon with fuel at $3.50, and fuel runs
              about $0.125 a mile. Add 9 cents of maintenance and you are at $0.215 in variable cost.
              Now spread $400 of monthly insurance, depreciation and other fixed costs over those
              1,000 miles and you add another 40 cents, landing near $0.62 per mile.
            </P>

            <H2>Why it matters</H2>
            <P>
              Knowing your cost per mile helps with mileage reimbursement, ride-share pricing and
              deciding whether a trip is worth driving. For the official business mileage rate the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Internal Revenue Service</a>{" "}
              publishes a yearly figure. To weigh a vehicle purchase, pair this with our{" "}
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
