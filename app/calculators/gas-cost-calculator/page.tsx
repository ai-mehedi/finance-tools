import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import GasCostCalculator from "./GasCostCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/gas-cost-calculator";
const SELF_SLUG = "gas-cost-calculator";

const DESC =
  "Free gas cost calculator. Estimate the fuel cost of any trip from the distance, your vehicle's MPG and the price of gas per gallon, with a round-trip option, gallons used and cost per mile.";

const baseMetadata: Metadata = {
  title: "Gas Cost Calculator",
  description: DESC,
  keywords: [
    "gas cost calculator",
    "fuel cost calculator",
    "trip fuel cost",
    "gas money calculator",
    "cost of gas for a trip",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Gas Cost Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gas Cost Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How do you calculate the cost of gas for a trip?",
    answer:
      "Divide the distance you will drive by your vehicle's miles per gallon to get the gallons of fuel you need, then multiply that by the price per gallon. For example, a 300-mile drive in a car that gets 28 MPG uses about 10.7 gallons, so at $3.50 a gallon the trip costs roughly $37.50.",
  },
  {
    question: "Does the calculator handle round trips?",
    answer:
      "Yes. Switch the trip type to Round trip and the distance is doubled before the fuel cost is worked out, since you are covering the same miles on the way back. Leave it on One way if you only need the cost in a single direction.",
  },
  {
    question: "What gas price should I use?",
    answer:
      "Use the price you actually expect to pay. For a single fill-up, the current pump price near you is fine. For a long trip across regions, an average of the prices you will see along the route gives a more realistic total, because fuel costs vary widely by state and station.",
  },
  {
    question: "Why is my real fuel cost different from the estimate?",
    answer:
      "Real-world fuel economy rarely matches the sticker number. Highway driving, traffic, terrain, cargo weight, air conditioning, tire pressure and how hard you accelerate all change your actual MPG. Treat the result as a close estimate and adjust the MPG figure to match what your car really delivers.",
  },
];

export default async function GasCostCalculatorPage() {
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
    "⛽"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gas Cost Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Gas Cost Calculator"
      intro="Work out the fuel cost of any trip. Enter the distance, your vehicle's MPG and the price of gas per gallon, choose one way or round trip, then press Calculate to see the total cost along with gallons used and cost per mile."
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
            { name: "Gas Cost Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Gas Cost Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GasCostCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the gas cost calculator works</H2>
            <P>
              The fuel cost of a trip comes down to three numbers: how far you are driving, how many
              miles your vehicle squeezes out of each gallon, and how much that gallon costs. The
              calculator divides the distance by your miles-per-gallon to find how many gallons the
              journey burns, then multiplies those gallons by the pump price to give the total. If you
              pick Round trip, the distance is doubled first so the figure covers the drive out and back.
            </P>
            <P>
              Alongside the headline cost you also get the gallons used and the cost per mile. Cost per
              mile is the handy one for comparisons — it tells you what each mile of driving costs in fuel
              alone, independent of how long any single trip happens to be. Because it is usually only a
              few cents, the calculator shows it to three decimal places so small differences between
              vehicles or gas prices stay visible.
            </P>

            <H2>A worked example</H2>
            <P>
              Say you are planning a 300-mile drive in a car that averages 28 MPG, and gas is running at
              $3.50 a gallon. The trip needs about 10.7 gallons, which works out to roughly $37.50 one way.
              Flip the toggle to Round trip and the distance becomes 600 miles, the fuel jumps to around
              21.4 gallons, and the cost climbs to about $75 — the per-mile figure stays the same because
              the rate of consumption has not changed, only the miles.
            </P>
            <P>
              Small changes move the total more than people expect. Dropping from 28 to 22 MPG on the same
              one-way trip pushes the cost from about $37.50 to roughly $47.70, and a 50-cent rise in the
              pump price adds several dollars on top. Try a few combinations to see how sensitive your fuel
              budget is to both efficiency and price before you commit to a route.
            </P>

            <H2>Getting an accurate estimate</H2>
            <P>
              The single biggest source of error is the MPG you enter. Window-sticker ratings assume gentle,
              steady driving; real trips involve traffic, hills, headwinds, roof boxes, a full load of
              passengers and the air conditioning running. For the truest number, fill your tank, reset the
              trip meter, and divide the miles driven by the gallons it takes to fill back up — then use
              that figure here. To see the full picture beyond fuel, our{" "}
              <Link href="/calculators/cost-per-mile-calculator" className="text-orange-600 underline">cost-per-mile calculator</Link>{" "}
              and{" "}
              <Link href="/calculators/car-ownership-cost-calculator" className="text-orange-600 underline">car ownership cost calculator</Link>{" "}
              fold in maintenance, insurance and depreciation as well.
            </P>
            <P>
              Gas prices also shift by region and over time, so for a long cross-country drive it pays to
              average the prices you will realistically encounter rather than using a single local figure.
              With a sensible MPG and a fair price in hand, this calculator gives you a fuel total you can
              actually plan a trip budget around.
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
