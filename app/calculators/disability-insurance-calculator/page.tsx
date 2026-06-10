import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import DisabilityInsuranceCalculator from "./DisabilityInsuranceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/disability-insurance-calculator";
const SELF_SLUG = "disability-insurance-calculator";

const DESC =
  "Free disability insurance calculator. Estimate the monthly benefit and total coverage you need to protect your income if you cannot work due to illness or injury.";

const baseMetadata: Metadata = {
  title: "Disability Insurance Calculator",
  description: DESC,
  keywords: [
    "disability insurance calculator",
    "income protection calculator",
    "long term disability calculator",
    "disability coverage needs",
    "monthly disability benefit",
    "income replacement calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Disability Insurance Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Disability Insurance Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How much disability insurance do I need?",
    answer:
      "A common rule is to replace about 60% of your gross income, since disability benefits are often tax free when you pay the premiums yourself. Subtract any coverage you already have, such as an employer or government benefit, to find the gap you still need to fill.",
  },
  {
    question: "What does long term disability insurance cover?",
    answer:
      "Long term disability pays a monthly benefit if an illness or injury keeps you from working for an extended period. It replaces part of your income so you can keep paying rent, food, debts and other essentials while you recover or adjust.",
  },
  {
    question: "Why not just replace 100% of my income?",
    answer:
      "Insurers usually cap benefits below your full pay to keep an incentive to return to work, and because benefits are often tax free when premiums are paid with after-tax dollars. Replacing 60% of gross income frequently lands close to your normal take-home pay.",
  },
  {
    question: "How long should the benefit period be?",
    answer:
      "The benefit period is how long the policy keeps paying. Many people choose a period that runs to retirement age for full protection, while others pick a shorter term to lower the premium. This tool multiplies your monthly gap by the period you choose to show total coverage.",
  },
];

export default async function DisabilityInsuranceCalculatorPage() {
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
    "🛡️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Disability Insurance Calculator",
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
      title="Disability Insurance Calculator"
      intro="Estimate the monthly benefit and total coverage you need to protect your income if you cannot work. Enter your numbers and press Calculate."
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
            { name: "Disability Insurance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Disability Insurance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DisabilityInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the disability coverage estimate works</H2>
            <P>
              Your ability to earn is one of your largest financial assets, and disability insurance
              protects it. This tool starts from a target benefit, usually about 60% of your gross
              monthly income, which often lands near your normal take-home pay once you account for
              taxes.
            </P>
            <P>
              It then subtracts any coverage you already have, such as a group policy through work or
              a government benefit, to reveal the monthly gap you still need to fill. The larger of
              that income gap and your essential expenses becomes the recommended benefit, so your
              core bills stay covered even if your target is conservative.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn $5,000 a month and want to replace 60%, a $3,000 target. If you already
              have $1,200 of coverage, the gap is $1,800 a month. Over a 5 year benefit period that is
              $1,800 × 60 months, or $108,000 of protection to plan for.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Premiums depend on your age, health, occupation and the policy's definition of
              disability and waiting period, so quotes vary. Treat this as a planning starting point,
              not a quote. For consumer guidance on protecting your income, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a solid resource. Compare other protection needs with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>.
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
