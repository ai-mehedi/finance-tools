import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PaybackPeriodCalculator from "./PaybackPeriodCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/payback-period-calculator";
const SELF_SLUG = "payback-period-calculator";

const DESC =
  "Free payback period calculator. Find how many years it takes for an investment's cash inflows to recover the initial cost, with a discounted payback option and a cumulative cash flow chart.";

const baseMetadata: Metadata = {
  title: "Payback Period Calculator",
  description: DESC,
  keywords: [
    "payback period calculator",
    "discounted payback period",
    "break even years",
    "capital budgeting calculator",
    "investment recovery time",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Payback Period Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Payback Period Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is a payback period?",
    answer:
      "The payback period is the length of time it takes for the cumulative cash flows from an investment to add back up to the amount you originally spent. A shorter payback period means your money is at risk for less time before you break even.",
  },
  {
    question: "How is the payback period calculated?",
    answer:
      "With even yearly cash flows, payback equals the initial investment divided by the annual cash flow. When the recovery happens partway through a year, this tool interpolates within that year so you get a fractional figure like 4 years and 2 months rather than rounding up to a whole year.",
  },
  {
    question: "What is the difference between simple and discounted payback?",
    answer:
      "Simple payback adds up raw cash inflows and ignores the time value of money. Discounted payback first shrinks each future inflow by a discount rate, so later money counts for less. Because discounted cash flows are smaller, the discounted payback period is always equal to or longer than the simple one.",
  },
  {
    question: "What are the limits of the payback period?",
    answer:
      "Payback tells you how quickly you recover your outlay but says nothing about profit earned after that point. An investment that pays back fast can still earn less overall than one that pays back slowly. Pair payback with net present value or return on investment before deciding.",
  },
];

export default async function PaybackPeriodCalculatorPage() {
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
    "⏱️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Payback Period Calculator",
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
      title="Payback Period Calculator"
      intro="See how long an investment takes to pay for itself. Enter the upfront cost and the yearly cash it returns, then press Calculate for both the simple and discounted payback period."
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
            { name: "Payback Period Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Payback Period Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PaybackPeriodCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the payback period calculator works</H2>
            <P>
              The calculator starts your balance at a negative number equal to the money you put in,
              then adds each year of cash flow on top. The moment that running total crosses zero is
              the point where the investment has paid for itself. The headline figure is the simple
              payback period in years and months.
            </P>
            <P>
              The discounted version repeats the same march to break even, but first it shrinks every
              future inflow using your discount rate. Because a dollar arriving in year five is worth
              less than a dollar today, the discounted line climbs more slowly and reaches break even
              later. The chart plots both lines so you can see the gap.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you spend $50,000 on equipment that returns $12,000 of cash a year. Dividing the
              cost by the annual flow gives a simple payback of about 4 years and 2 months. Apply an
              8% discount rate and the same project takes roughly 5 years and 4 months to recover in
              present-value terms, because the later cash counts for less.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Payback rewards speed but ignores everything that happens after break even, so a quick
              payback is not the same as the most profitable choice. Read the{" "}
              <a href="https://www.investopedia.com/terms/p/paybackperiod.asp" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investopedia overview of payback period</a>{" "}
              for the wider context. To weigh total profitability instead, switch to our{" "}
              <Link href="/calculators/roi-calculator" className="text-orange-600 underline">ROI calculator</Link>.
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
