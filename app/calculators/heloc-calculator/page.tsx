import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import HelocCalculator from "./HelocCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/heloc-calculator";
const SELF_SLUG = "heloc-calculator";

const DESC =
  "Free HELOC calculator. See how much you can borrow against your home equity at your lender's CLTV cap, then estimate interest-only draw payments and amortizing repayment payments with a balance chart.";

const baseMetadata: Metadata = {
  title: "Home Equity HELOC Calculator",
  description: DESC,
  keywords: [
    "heloc calculator",
    "home equity line of credit calculator",
    "how much can I borrow against my home",
    "heloc payment calculator",
    "cltv calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Home Equity HELOC Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Home Equity HELOC Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much can I borrow with a HELOC?",
    answer:
      "Lenders cap your total home debt at a combined loan-to-value limit, often 80 to 90 percent. Multiply your home value by that limit, then subtract your current mortgage balance. Whatever is left is the credit line you can be approved for, assuming your income and credit also qualify.",
  },
  {
    question: "Why does my payment jump after the draw period?",
    answer:
      "During the draw period most HELOCs only require interest, so the payment is small and the balance never falls. When the repayment period begins you must pay back the principal too, spread over the remaining years. That shift from interest only to fully amortizing is what makes the payment rise sharply.",
  },
  {
    question: "Is a HELOC rate fixed or variable?",
    answer:
      "Most HELOCs carry a variable rate tied to the prime rate, so your payment can move up or down over time. This calculator uses a single rate you enter to show one scenario. To stress test, run it again with a higher rate to see how much the repayment payment could grow.",
  },
  {
    question: "What is combined loan-to-value, or CLTV?",
    answer:
      "Combined loan-to-value is all the debt secured by your home divided by the home value, then multiplied by 100. If your mortgage plus the new draw equals 320,000 dollars on a 400,000 dollar home, your CLTV is 80 percent. A lower CLTV usually means a better rate and a larger approved line.",
  },
];

export default async function HelocCalculatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Equity HELOC Calculator",
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
      title="Home Equity HELOC Calculator"
      intro="See how large a home equity line of credit you could open, then estimate both the interest-only payment during the draw period and the bigger amortizing payment once repayment begins."
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
            { name: "Home Equity HELOC Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Home Equity HELOC Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HelocCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the HELOC calculator works</H2>
            <P>
              A HELOC lets you borrow against the equity in your home using a revolving credit line.
              The tool starts by finding your maximum line size: it takes your home value times the
              lender&apos;s combined loan-to-value cap, then subtracts the mortgage you still owe.
              Whatever remains is the equity you can tap.
            </P>
            <P>
              From there it splits the loan into two phases. During the draw period you usually pay
              interest only, so the balance stays flat. When repayment begins, the calculator
              amortizes the amount you borrowed over the remaining years, which is why the second
              payment is much larger. The chart traces your outstanding balance and marks where the
              draw period ends.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose your home is worth 450,000 dollars, you owe 260,000 dollars, and your lender
              allows an 85 percent combined loan-to-value. Your maximum line is 382,500 dollars minus
              260,000 dollars, or about 122,500 dollars. Borrow 60,000 dollars at 8.5 percent with a
              10-year draw and a 20-year payback, and you would pay roughly 425 dollars a month while
              drawing, then around 520 dollars a month once principal repayment kicks in.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              HELOC rates are usually variable, so a rising prime rate can lift your payment with
              little warning. Your home is the collateral, which means missed payments put it at risk.
              For a plain-language overview of how these lines work, see the{" "}
              <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-line-of-credit-heloc-en-106/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB guide to HELOCs</a>.
              If you are weighing a single lump-sum loan instead of a revolving line, compare the cost
              with our{" "}
              <Link href="/calculators/loan-calculator" className="text-orange-600 underline">loan calculator</Link>.
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
