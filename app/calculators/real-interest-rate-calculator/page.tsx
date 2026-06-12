import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RealInterestRateCalculator from "./RealInterestRateCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/real-interest-rate-calculator";
const SELF_SLUG = "real-interest-rate-calculator";

const DESC =
  "Free real interest rate calculator. Convert a nominal rate into the inflation-adjusted real rate using the Fisher equation, and see how purchasing power erodes over time.";

const baseMetadata: Metadata = {
  title: "Real Interest Rate Calculator",
  description: DESC,
  keywords: [
    "real interest rate calculator",
    "fisher equation calculator",
    "inflation adjusted return",
    "nominal vs real rate",
    "purchasing power calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Real Interest Rate Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Real Interest Rate Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is the real interest rate?",
    answer:
      "The real interest rate is the return you earn after stripping out inflation. It measures the gain in actual buying power rather than the headline number on a statement. If a bond pays five percent while prices rise three percent, your money only buys about two percent more than before.",
  },
  {
    question: "What is the Fisher equation?",
    answer:
      "The Fisher equation links the three rates exactly: one plus the real rate equals one plus the nominal rate divided by one plus the inflation rate. This calculator uses that exact form and also shows the rough shortcut of nominal minus inflation so you can compare the two.",
  },
  {
    question: "Why is nominal minus inflation only an approximation?",
    answer:
      "Simply subtracting inflation from the nominal rate ignores that inflation also erodes the interest you earn, not just the principal. The gap between the shortcut and the exact Fisher figure is tiny at low rates but grows noticeably when both rates are high.",
  },
  {
    question: "Can the real interest rate be negative?",
    answer:
      "Yes. When inflation runs higher than the rate your savings earn, the real rate turns negative and your money loses buying power even though the balance keeps rising. This is common with low-yield savings accounts during periods of elevated inflation.",
  },
];

export default async function RealInterestRateCalculatorPage() {
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
    "📉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Real Interest Rate Calculator",
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
      title="Real Interest Rate Calculator"
      intro="See what your savings truly earn after inflation. Enter a nominal rate, expected inflation, an amount and a horizon, then press Calculate to find the real rate and how much buying power slips away."
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
            { name: "Real Interest Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Real Interest Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RealInterestRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the real interest rate calculator works</H2>
            <P>
              Interest rates are usually quoted in nominal terms, the plain number a bank or bond
              advertises. But what you really care about is buying power. This tool feeds your nominal
              rate and your inflation estimate into the Fisher equation to return the rate that
              matters: what your money earns after rising prices are accounted for.
            </P>
            <P>
              The chart traces two lines. The dashed line is the nominal balance climbing at the
              stated rate, while the shaded area is the same balance restated in today's dollars. The
              widening gap between them is purchasing power quietly draining away.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a deposit pays six percent a year while inflation runs three percent. The exact
              real rate is not three percent but about 2.91 percent, because inflation also nibbles at
              the interest itself. Over twenty years a 10,000 dollar deposit grows to roughly 32,071
              dollars on paper, yet in today's money it is worth only about 17,756 dollars, a real
              gain far smaller than the headline balance suggests.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Inflation is an estimate, so the real rate is a forecast rather than a guarantee. For
              official inflation figures from a neutral source, see the{" "}
              <a href="https://www.bls.gov/cpi/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Bureau of Labor Statistics CPI page</a>.
              To project the nominal growth side on its own, try our{" "}
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
