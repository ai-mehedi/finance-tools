import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BurnRateCalculator from "./BurnRateCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/burn-rate-calculator";
const SELF_SLUG = "burn-rate-calculator";

const DESC =
  "Free cash burn rate calculator. Work out your gross and net monthly burn, and see how many months of runway your current cash balance gives you.";

const baseMetadata: Metadata = {
  title: "Cash Burn Rate Calculator",
  description: DESC,
  keywords: [
    "burn rate calculator",
    "cash burn rate",
    "startup runway calculator",
    "net burn calculator",
    "cash runway",
    "monthly burn rate",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Cash Burn Rate Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Cash Burn Rate Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is burn rate?",
    answer:
      "Burn rate is how much cash a company spends each month to operate. Gross burn is your total monthly expenses. Net burn subtracts any revenue you bring in, so it reflects how fast your cash balance is actually shrinking.",
  },
  {
    question: "How is runway calculated?",
    answer:
      "Runway is your current cash on hand divided by your net monthly burn. If you have $500,000 in the bank and burn $40,000 net per month, you have about 12.5 months of runway before the cash runs out, assuming nothing changes.",
  },
  {
    question: "What is a healthy burn rate?",
    answer:
      "There is no single number. A healthy burn rate keeps enough runway to reach your next milestone or funding round, usually 12 to 18 months. The right level depends on your stage, growth plans and how predictable your revenue is.",
  },
  {
    question: "How can I extend my runway?",
    answer:
      "You can extend runway by growing revenue, cutting non-essential costs, or raising more capital. Even small recurring savings add months because runway scales directly with net burn. Revenue growth helps most because it reduces net burn on every future month.",
  },
];

export default async function BurnRateCalculatorPage() {
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
    "🔥"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cash Burn Rate Calculator",
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
      title="Cash Burn Rate Calculator"
      intro="Work out your gross and net monthly burn, then see how many months of runway your cash balance gives you. Enter your numbers and press Calculate."
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
            { name: "Cash Burn Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Cash Burn Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BurnRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the burn rate calculator works</H2>
            <P>
              The calculator starts with your gross burn, which is simply your total monthly
              expenses. It then subtracts your monthly revenue to find net burn, the amount your
              cash balance falls by each month. Dividing your cash on hand by net burn gives your
              runway in months.
            </P>
            <P>
              The chart traces your cash balance month by month until it reaches zero, so you can see
              the exact point at which you would need new revenue or funding. If your revenue already
              covers expenses, you are cash flow positive and the runway is effectively unlimited.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you hold $500,000, spend $60,000 a month and earn $20,000 a month. Your gross
              burn is $60,000 and your net burn is $40,000. That gives roughly 12.5 months of runway,
              or about 1 year and 0 months before the cash is gone.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a steady-state estimate. Real burn changes as you hire, grow revenue or face
              one-off costs, so revisit it often. For broader small-business financial guidance, the{" "}
              <a href="https://www.sba.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Small Business Administration</a>{" "}
              is a useful resource. You can also compare scenarios with our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
