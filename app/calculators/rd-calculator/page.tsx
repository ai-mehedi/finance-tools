import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RdCalculator from "./RdCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/rd-calculator";
const SELF_SLUG = "rd-calculator";

const DESC =
  "Free recurring deposit calculator. Find the maturity value of a monthly RD with quarterly compounding, plus the total deposited and interest earned, shown on a growth chart.";

const baseMetadata: Metadata = {
  title: "Recurring Deposit Calculator",
  description: DESC,
  keywords: [
    "recurring deposit calculator",
    "rd calculator",
    "rd maturity calculator",
    "monthly deposit interest",
    "rd interest calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Recurring Deposit Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Recurring Deposit Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a recurring deposit?",
    answer:
      "A recurring deposit is a savings product where you pay a fixed amount into the account every month for a set tenure. Each instalment earns interest until maturity, and the bank pays back your deposits plus the accumulated interest as a single lump sum at the end.",
  },
  {
    question: "How is RD interest calculated?",
    answer:
      "Banks compound recurring deposit interest every quarter rather than monthly. Each instalment earns interest only for the months that remain until maturity, so the very first deposit earns the most and the final one earns the least. This calculator sums every instalment with its own growth period to give the exact maturity value.",
  },
  {
    question: "Is recurring deposit interest taxable?",
    answer:
      "Yes. Interest earned on a recurring deposit is added to your income and taxed at your slab rate, and banks may deduct tax at source once the interest crosses the threshold for the year. The maturity figure shown here is before any such tax is applied.",
  },
  {
    question: "How is an RD different from a fixed deposit?",
    answer:
      "A fixed deposit takes one lump sum up front, while a recurring deposit builds up through equal monthly instalments. Because the money in an RD goes in gradually, the average balance earning interest is lower, so an RD usually returns less than a fixed deposit of the same total amount and rate.",
  },
];

export default async function RdCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Recurring Deposit Calculator",
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
      title="Recurring Deposit Calculator"
      intro="Plan a recurring deposit with confidence. Enter your monthly instalment, the interest rate and the tenure, then press Calculate to see the maturity value and the interest your savings will earn."
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
            { name: "Recurring Deposit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Recurring Deposit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RdCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the recurring deposit calculator works</H2>
            <P>
              A recurring deposit rewards steady saving. Each month you pay in the same instalment,
              and the bank compounds interest quarterly on the growing balance. Because every
              instalment is invested for a different length of time, the maturity value is not simply
              your deposits times a flat rate. This tool simulates each month so the figure matches
              what your bank will actually pay.
            </P>
            <P>
              The chart separates the two parts of your maturity value. The shaded area is the account
              balance climbing each year, and the dashed line is the plain sum of instalments you have
              paid in. The space between them is the interest the deposit has earned.
            </P>

            <H2>A quick example</H2>
            <P>
              Pay 5,000 a month for five years at seven percent. You deposit 300,000 of your own money
              across sixty instalments, and the recurring deposit matures at roughly 358,800. The extra
              58,800 or so is interest, earned because each instalment kept compounding from the day it
              landed in the account.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Advertised RD rates change with the policy environment, and senior citizens often get a
              small bonus rate. For background on how deposit rates move, see the{" "}
              <a href="https://www.rbi.org.in" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Reserve Bank of India</a>.
              If you instead have a single lump sum to invest, compare the outcome with our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>.
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
