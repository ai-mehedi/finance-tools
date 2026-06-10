import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import IrrCalculator from "./IrrCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/irr-calculator";
const SELF_SLUG = "irr-calculator";

const DESC =
  "Free IRR calculator. Find the internal rate of return on an investment from its initial cost and a series of yearly cash flows, with a cumulative cash flow chart.";

const baseMetadata: Metadata = {
  title: "IRR Calculator",
  description: DESC,
  keywords: [
    "irr calculator",
    "internal rate of return calculator",
    "irr formula",
    "investment return calculator",
    "cash flow irr",
    "rate of return calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "IRR Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "IRR Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the internal rate of return?",
    answer:
      "The internal rate of return, or IRR, is the annual discount rate that makes the net present value of all cash flows from an investment equal to zero. In plain terms, it is the effective annual growth rate your money earns across the whole project.",
  },
  {
    question: "How is IRR calculated?",
    answer:
      "IRR is the rate r that solves the equation where the sum of each cash flow divided by (1 + r) raised to its period equals zero, including the negative initial outlay. There is no simple closed-form solution, so it is found by trial and error. This tool uses a numerical search to land on the exact rate.",
  },
  {
    question: "What is a good IRR?",
    answer:
      "It depends on your cost of capital and the risk involved. A common rule is that an investment is worth pursuing if its IRR is higher than the return you could earn elsewhere at similar risk, sometimes called the hurdle rate. Many investors look for double-digit IRRs on equity projects.",
  },
  {
    question: "Why does my calculation show no IRR?",
    answer:
      "IRR only exists when the cash flows change sign at least once, normally a negative initial cost followed by positive returns. If every flow is positive or every flow is negative, there is no rate that zeroes out the net present value, so no IRR can be reported.",
  },
];

export default async function IrrCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "IRR Calculator",
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
      title="IRR Calculator"
      intro="Find the internal rate of return on an investment from its upfront cost and the cash it returns each year. Enter your numbers and press Calculate."
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
            { name: "IRR Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="IRR Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IrrCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the IRR calculator works</H2>
            <P>
              You start with an upfront cost, then receive cash back over several years. The internal
              rate of return is the single annual rate that, if used to discount every future cash
              flow, brings their present value down to exactly the size of your initial outlay. When
              that happens the net present value is zero, and the rate that did it is your IRR.
            </P>
            <P>
              The chart above plots the cumulative cash flow. It begins below zero with your
              investment and climbs as returns arrive. The point where it crosses back above zero is
              your payback moment, while the IRR captures how quickly and how strongly the money came
              back relative to the time you waited.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you invest $10,000 and receive $3,000, $4,000, $5,000 and $4,000 over the next
              four years. You get $16,000 back on a $10,000 outlay, but the timing matters. The IRR
              works out to roughly 24%, which reflects both the $6,000 profit and the fact that most
              of it arrived within a few years.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              IRR ignores the scale of a project and can behave oddly when cash flows switch sign more
              than once. For those cases, pair it with net present value. For background on evaluating
              returns, the{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Securities and Exchange Commission investor site</a>{" "}
              is a solid reference. You can also explore our{" "}
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
