import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CarDepreciationCalculator from "./CarDepreciationCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/car-depreciation-calculator";
const SELF_SLUG = "car-depreciation-calculator";

const DESC =
  "Free car depreciation calculator. See how much value your vehicle loses each year and what it will be worth after several years, with a value curve chart.";

export const metadata: Metadata = {
  title: "Car Depreciation Calculator",
  description: DESC,
  keywords: [
    "car depreciation calculator",
    "vehicle depreciation",
    "car value calculator",
    "car resale value",
    "how much will my car be worth",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Car Depreciation Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Car Depreciation Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How fast does a car depreciate?",
    answer:
      "Most new cars lose 15% to 25% of their value in the first year and around 15% of the remaining value each year after that. Many cars are worth roughly half their original price after five years, though it varies by brand and model.",
  },
  {
    question: "How is car depreciation calculated?",
    answer:
      "This calculator uses the declining balance method. Each year the car loses a fixed percentage of its current value, not its original price. That matches reality, where the dollar loss is largest early on and shrinks as the car ages.",
  },
  {
    question: "Which cars hold their value best?",
    answer:
      "Trucks, certain SUVs and reliable brands with strong demand tend to depreciate more slowly. Luxury sedans and cars with high maintenance costs often lose value faster. Mileage, condition and accident history also matter a lot.",
  },
  {
    question: "Why does depreciation matter?",
    answer:
      "Depreciation is usually the single largest cost of owning a car, often more than fuel or repairs. Knowing the curve helps you decide when to buy, how long to keep a car, and whether leasing or buying makes more sense for you.",
  },
];

export default async function CarDepreciationCalculatorPage() {
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
    "📉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Car Depreciation Calculator",
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
      title="Car Depreciation Calculator"
      intro="See how much value your vehicle loses each year and what it will be worth down the road. Enter the price, a depreciation rate and the years, then press Calculate."
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
            { name: "Car Depreciation Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Car Depreciation Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CarDepreciationCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the car depreciation calculator works</H2>
            <P>
              This calculator uses the declining balance method, the most realistic way to model a
              vehicle. Each year the car loses a set percentage of its current value, not its original
              price. That is why the value curve drops steeply at first and then flattens, exactly the
              shape you see in used car listings.
            </P>
            <P>
              The first year is usually the harshest because a new car becomes a used car the moment
              you drive off the lot. After that, the dollar loss shrinks each year even though the
              percentage stays the same, since it applies to a smaller and smaller value.
            </P>

            <H2>A quick example</H2>
            <P>
              Buy a $35,000 car that depreciates 15% a year. After one year it is worth about $29,750,
              a $5,250 loss. After five years it is worth roughly $15,500, so total depreciation is
              about $19,500, or close to $3,900 a year on average.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Real depreciation depends on the make, mileage, condition and market demand, so treat
              this as an estimate. To research model-specific values, check resources like{" "}
              <a href="https://www.kbb.com" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Kelley Blue Book</a>.
              You can also weigh ownership against leasing with our{" "}
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>}
                    </div>
                  </Link>
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
                    <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
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
