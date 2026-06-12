import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TermVsWholeLifeCalculator from "./TermVsWholeLifeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/term-vs-whole-life-calculator";
const SELF_SLUG = "term-vs-whole-life-calculator";

const DESC =
  "Free term vs whole life calculator. Compare buying cheaper term insurance and investing the difference against a whole life policy, with a year by year chart of side fund versus cash value.";

const baseMetadata: Metadata = {
  title: "Term vs Whole Life Calculator",
  description: DESC,
  keywords: [
    "term vs whole life calculator",
    "buy term invest the difference",
    "whole life vs term insurance",
    "cash value comparison calculator",
    "life insurance comparison",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Term vs Whole Life Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Term vs Whole Life Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What does buy term and invest the difference mean?",
    answer:
      "It is a strategy where you buy cheap term insurance for protection and invest the money you would have spent on a pricier whole life premium. The idea is that a diversified investment may grow faster than a whole life policy's cash value, leaving you with both cover during the term and a larger pot at the end.",
  },
  {
    question: "When can whole life come out ahead?",
    answer:
      "Whole life can win if your investment return is low, if you would not actually invest the difference with discipline, or if you need guaranteed lifelong cover and the tax treatment of cash value matters to your estate. The break even line in this tool shows the year, if any, where the policy's cash value overtakes the side fund.",
  },
  {
    question: "Why does the side fund start small in early years?",
    answer:
      "Because whole life cash value is front loaded with costs, while a side fund only holds the premium difference you invest each year. Early on the fund has had little time to compound, so both balances are modest. The gap usually widens later as the invested difference compounds year after year.",
  },
  {
    question: "Is this calculator a recommendation to drop whole life?",
    answer:
      "No. It is a comparison tool that depends entirely on the assumptions you enter, especially the investment return and cash value growth rate. Insurance decisions also involve health, estate planning and behaviour, so use the result as one input and speak to a fee only adviser before making a change.",
  },
];

export default async function TermVsWholeLifeCalculatorPage() {
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
    "⚖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Term vs Whole Life Calculator",
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
      title="Term vs Whole Life Calculator"
      intro="Compare two ways to insure the same life. Enter the cover, both premiums and your assumed returns, then press Calculate to see whether buying term and investing the difference beats a whole life policy."
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
            { name: "Term vs Whole Life Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Term vs Whole Life Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TermVsWholeLifeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the term vs whole life calculator works</H2>
            <P>
              The two policies cover the same life, so the real question is what happens to the money.
              With whole life you pay one large premium and the insurer builds a cash value inside the
              policy. With term you pay a small premium and invest the difference yourself. This tool
              runs both paths side by side for every year of your chosen horizon.
            </P>
            <P>
              Each year the side fund grows last year's balance at your investment return and adds the
              premium difference. The whole life cash value grows at its credited rate but loses a
              chunk of the early premiums to acquisition costs, which is why it lags at the start. The
              chart plots both lines so you can spot any crossover point.
            </P>

            <H2>A worked example</H2>
            <P>
              Take 500,000 dollars of cover. Term costs 400 dollars a year, whole life costs 5,200
              dollars, so the difference invested is 4,800 dollars a year. At a 7 percent investment
              return over 30 years the side fund grows past 450,000 dollars, while whole life cash
              value at 4 percent reaches a smaller figure. Here term and invest the difference wins,
              but raise the cash rate or lower the market return and the gap narrows quickly.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The outcome is only as good as your assumptions, and real investment returns are far
              from smooth. The model also simplifies cash value growth and ignores dividends, surrender
              charges and tax nuances that vary by policy. For a neutral explainer on the two policy
              types, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To first size how much cover you need at all, start with our{" "}
              <Link href="/calculators/term-insurance-calculator" className="text-orange-600 underline">term insurance calculator</Link>.
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
