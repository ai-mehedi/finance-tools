import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TravelInsuranceCalculator from "./TravelInsuranceCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/travel-insurance-calculator";
const SELF_SLUG = "travel-insurance-calculator";

const DESC =
  "Free travel insurance calculator. Estimate the premium for a single trip from your trip cost, length, traveler age and destination, plus optional add-ons, with a breakdown of what each part of the policy costs.";

const baseMetadata: Metadata = {
  title: "Travel Insurance Calculator",
  description: DESC,
  keywords: [
    "travel insurance calculator",
    "trip insurance cost",
    "travel insurance premium",
    "trip cancellation cost",
    "travel medical insurance estimate",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Travel Insurance Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Travel Insurance Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much does travel insurance usually cost?",
    answer:
      "A single-trip policy commonly runs somewhere between 4 percent and 10 percent of the prepaid trip cost. The exact figure depends most on the age of the oldest traveler, how long you are away and where you are going, since medical care in some regions is far more expensive than in others.",
  },
  {
    question: "What drives the premium up the most?",
    answer:
      "Age and destination have the biggest effect. An older traveler carries more medical risk, so the rate rises steeply past about age 60. Destinations with costly health care, the United States in particular, also push the medical portion of the premium higher.",
  },
  {
    question: "Do I need trip cancellation coverage?",
    answer:
      "Cancellation coverage is priced from the non-refundable money you have already paid, so it matters most when you have large prepaid deposits like flights, cruises or tours. If almost everything is refundable, you may only want the medical and evacuation portion instead.",
  },
  {
    question: "Is this an exact quote?",
    answer:
      "No. This tool gives a planning estimate built from typical pricing factors so you know roughly what to budget. Real quotes vary by insurer, exact dates, pre-existing conditions and the coverage limits you choose, so always confirm with an actual provider before you buy.",
  },
];

export default async function TravelInsuranceCalculatorPage() {
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
    "✈️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Travel Insurance Calculator",
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
      title="Travel Insurance Calculator"
      intro="Estimate what a single-trip travel insurance policy might cost. Enter your trip cost, length, traveler age and destination, pick any add-ons, then press Calculate to see the premium and how it splits."
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
            { name: "Travel Insurance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Travel Insurance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TravelInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the travel insurance calculator works</H2>
            <P>
              The estimate starts with a base medical and evacuation rate that grows with the number
              of days you are away and the medical cost of your destination, then loads it for the age
              of the oldest traveler. On top of that it layers any add-ons you select, including trip
              cancellation, which is priced from the prepaid money you would lose if the trip fell
              through.
            </P>
            <P>
              The donut chart breaks the premium into those parts so you can see what you are actually
              paying for. Often the base medical cover is modest and the cancellation slice is the
              largest, because it protects the biggest dollar amount at stake.
            </P>

            <H2>A quick example</H2>
            <P>
              Two travelers, oldest age 42, take a 10 day trip to Europe with $4,000 of prepaid,
              non-refundable cost and add trip cancellation. The medical and evacuation cover for both
              people is fairly small, but the cancellation slice based on that $4,000 dominates the
              total, landing the premium in the typical mid-single-digit percentage of the trip cost.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Coverage limits, deductibles and pre-existing-condition waivers all move the real price,
              so treat this as a budgeting guide rather than a quote. For impartial guidance on what
              travel insurance should cover, see{" "}
              <a href="https://www.usa.gov/travel-insurance" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">USA.gov</a>.
              If you are weighing the trip against other big purchases, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              can show what that money would grow into instead.
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
              <ul className="space-y-2">
                {articles.map((a) => (
                  <li key={a._id}>
                    <Link href={`/blog/${a.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
                      <span className="text-sm font-medium text-zinc-700 hover:text-orange-600">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
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

export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(SELF_SLUG, baseMetadata);
}
