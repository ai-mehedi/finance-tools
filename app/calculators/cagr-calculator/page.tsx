import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CagrCalculator from "./CagrCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/cagr-calculator";
const SELF_SLUG = "cagr-calculator";

const DESC =
  "Free CAGR calculator. Find the compound annual growth rate of an investment from its starting value, ending value and the number of years.";

const baseMetadata: Metadata = {
  title: "CAGR Calculator",
  description: DESC,
  keywords: [
    "cagr calculator",
    "compound annual growth rate",
    "cagr formula",
    "investment growth rate calculator",
    "annualized return calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "CAGR Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "CAGR Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is CAGR?",
    answer:
      "CAGR, or compound annual growth rate, is the single constant yearly rate that would grow an investment from its starting value to its ending value over a given period. It smooths out the ups and downs into one annualized figure that is easy to compare across investments.",
  },
  {
    question: "What is the CAGR formula?",
    answer:
      "The formula is CAGR = (ending value / beginning value)^(1 / years) - 1, expressed as a percentage. For example, growing $10,000 into $25,000 over 5 years gives (25000 / 10000)^(1/5) - 1, which is about 20.1% per year.",
  },
  {
    question: "How is CAGR different from average return?",
    answer:
      "A simple average just adds up the yearly returns and divides by the number of years, which ignores compounding and can be misleading. CAGR accounts for compounding, so it reflects the actual annualized rate that connects the start and end values.",
  },
  {
    question: "What are the limits of CAGR?",
    answer:
      "CAGR assumes smooth, steady growth and only looks at the first and last values, so it hides the volatility in between. It also ignores any deposits or withdrawals made along the way. Use it as a comparison tool, not a complete picture of risk.",
  },
];

export default async function CagrCalculatorPage() {
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
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CAGR Calculator",
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
      title="CAGR Calculator"
      intro="Find the compound annual growth rate of an investment. Enter the initial value, final value and number of years, then press Calculate."
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
            { name: "CAGR Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="CAGR Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CagrCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How CAGR works</H2>
            <P>
              CAGR answers a simple question: if your investment had grown at one steady rate every
              year, what would that rate be? It takes the beginning value, the ending value and the
              number of years, then finds the constant annual rate that links them. That makes it a
              clean way to compare investments that grew over different lengths of time.
            </P>
            <P>
              The formula is CAGR = (ending value / beginning value)<sup>1/years</sup> - 1. For example,
              if $10,000 grows into $25,000 over 5 years, the calculation is (25,000 / 10,000) raised to
              the power of one fifth, minus one, which works out to roughly 20.1% per year.
            </P>

            <H2>CAGR vs simple average</H2>
            <P>
              Suppose an investment gains 50% one year and loses 30% the next. The simple average looks
              like a 10% return, but the real annualized result is different because the loss applies to
              a larger base. CAGR captures that compounding effect, so it reflects what actually happened
              to your money rather than an arithmetic shortcut.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              CAGR only uses the first and last values, so it hides the volatility in between and assumes
              no money was added or withdrawn along the way. Treat it as a comparison metric, not a risk
              measure. For broad investor education see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>{" "}
              from the SEC, or explore our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other financial calculators</Link>{" "}
              to plan and compare returns.
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
