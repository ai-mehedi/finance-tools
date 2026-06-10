import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DiscretionaryIncomeCalculator from "./DiscretionaryIncomeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/discretionary-income-calculator";
const SELF_SLUG = "discretionary-income-calculator";

const DESC =
  "Free discretionary income calculator. Estimate the discretionary income used for income-driven student loan repayment and your likely monthly payment.";

const baseMetadata: Metadata = {
  title: "Discretionary Income Calculator",
  description: DESC,
  keywords: [
    "discretionary income calculator",
    "income driven repayment calculator",
    "student loan payment calculator",
    "SAVE plan calculator",
    "poverty guideline calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Discretionary Income Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Discretionary Income Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is discretionary income?",
    answer:
      "For federal student loan repayment, discretionary income is your adjusted gross income minus a multiple of the federal poverty guideline for your household size and state. It is the income left over after a baseline allowance for living costs, and it sets your monthly payment on income-driven plans.",
  },
  {
    question: "How is discretionary income calculated?",
    answer:
      "Take your adjusted gross income and subtract the poverty guideline for your household size multiplied by the plan factor. Most plans use 150% of the poverty line, while the SAVE plan uses 225%. If the result is below zero, your discretionary income is treated as zero.",
  },
  {
    question: "How much will my monthly payment be?",
    answer:
      "Income-driven plans charge a fixed share of discretionary income, often 10%, divided by 12 for a monthly figure. This calculator applies the percentage you choose so you can compare plans, but your servicer sets the official amount.",
  },
  {
    question: "Which poverty guidelines are used?",
    answer:
      "This tool uses the 2024 federal poverty guidelines for the 48 contiguous states and the District of Columbia. Alaska and Hawaii use higher figures, so residents there should treat the result as a rough estimate.",
  },
];

export default async function DiscretionaryIncomeCalculatorPage() {
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
    "🎓"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Discretionary Income Calculator",
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
      title="Discretionary Income Calculator"
      intro="Estimate the discretionary income behind income-driven student loan repayment and your likely monthly payment. Enter your numbers and press Calculate."
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
            { name: "Discretionary Income Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Discretionary Income Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DiscretionaryIncomeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How discretionary income works</H2>
            <P>
              Income-driven repayment plans do not look at your full income. They subtract a living
              allowance, set as a multiple of the federal poverty guideline for your household size,
              and only the income above that line counts. That remaining figure is your discretionary
              income, and your monthly payment is a fixed share of it.
            </P>
            <P>
              Most older plans use 150% of the poverty line, while the newer SAVE plan uses 225%,
              which protects more income and produces lower payments. Choose the multiple that matches
              your plan to see the difference.
            </P>

            <H2>A quick example</H2>
            <P>
              A single borrower earns $60,000 with a household of one. The 2024 poverty guideline is
              $15,060, and 150% of that is $22,590. Discretionary income is $60,000 minus $22,590, or
              $37,410. At 10%, the annual payment is $3,741, about $312 a month. Under SAVE at 225%,
              the protected amount rises and the payment falls.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate. Your servicer uses your verified adjusted gross income, family size
              and the official guidelines to set the real payment. For current plan rules and the
              loan simulator, see the{" "}
              <a href="https://studentaid.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Federal Student Aid</a>{" "}
              site. You can also explore our{" "}
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
