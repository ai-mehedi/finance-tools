import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RentIncreaseCalculator from "./RentIncreaseCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/rent-increase-calculator";
const SELF_SLUG = "rent-increase-calculator";

const DESC =
  "Free rent increase calculator. See your new monthly rent after a percentage or fixed increase, the extra you'll pay each month and the total cost over the year.";

const baseMetadata: Metadata = {
  title: "Rent Increase Calculator",
  description: DESC,
  keywords: [
    "rent increase calculator",
    "rent increase percentage",
    "new rent calculator",
    "rent hike calculator",
    "annual rent increase",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Rent Increase Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent Increase Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How do I calculate a rent increase percentage?",
    answer:
      "Multiply your current rent by the percentage and add it on. For a 5 percent rise on $1,500, the increase is $1,500 × 0.05 = $75, making the new rent $1,575. To find the percentage from two amounts, divide the increase by the old rent: ($1,575 − $1,500) ÷ $1,500 = 5 percent.",
  },
  {
    question: "Is there a limit on how much rent can increase?",
    answer:
      "It depends entirely on where you live. Some cities and states have rent control or caps tied to inflation, while many areas have no limit on increases between fixed-term leases. Always check your local tenancy laws and your lease terms.",
  },
  {
    question: "How much notice must a landlord give for a rent increase?",
    answer:
      "Notice periods are set by local law and your lease — commonly 30 to 90 days for a month-to-month tenancy. A landlord usually cannot raise rent mid-way through a fixed-term lease unless the lease specifically allows it.",
  },
  {
    question: "Is a rent increase in line with inflation reasonable?",
    answer:
      "Many landlords tie increases to inflation or a local rent index. Comparing your proposed rise to the current inflation rate is a useful sanity check — a rise well above inflation, with no improvement to the property, is worth questioning or negotiating.",
  },
];

export default async function RentIncreaseCalculatorPage() {
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
    "🔑"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rent Increase Calculator",
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
      title="Rent Increase Calculator"
      intro="Work out your new rent after an increase. Enter your current rent and either a percentage or a fixed dollar rise, then press Calculate to see the new rent and the extra cost per month and per year."
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
            { name: "Rent Increase Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Rent Increase Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RentIncreaseCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the rent increase calculator works</H2>
            <P>
              When a landlord proposes a higher rent, the headline percentage can hide what it really
              costs you. This calculator takes your current rent and the proposed rise — as a percentage
              or a flat amount — and shows the new monthly rent, the extra you pay each month, and the
              total additional cost spread across a full year.
            </P>
            <P>
              Seeing the annual figure matters because a "small" monthly bump adds up. A $60 rise sounds
              minor, but it is $720 more over the year, money worth weighing against the option of moving
              or negotiating.
            </P>

            <H2>A quick example</H2>
            <P>
              Your rent is $1,500 and your landlord proposes a 5 percent increase. That is $75 more a
              month, lifting the rent to $1,575, and $900 extra across the year. Switch to a fixed
              increase and you can check the percentage a flat rise really represents — useful when
              comparing an offer against local inflation or a rent index.
            </P>

            <H2>Before you accept an increase</H2>
            <P>
              Check the rise against your local tenancy rules and your lease, confirm the notice period
              was met, and compare it to inflation. If the new rent stretches your budget, test it against
              your income with our{" "}
              <Link href="/calculators/rent-affordability-calculator" className="text-orange-600 underline">rent affordability calculator</Link>,
              and see how it sits in your wider plan with the{" "}
              <Link href="/calculators/budget-calculator" className="text-orange-600 underline">budget calculator</Link>.
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
