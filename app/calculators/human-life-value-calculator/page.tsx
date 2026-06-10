import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import HumanLifeValueCalculator from "./HumanLifeValueCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/human-life-value-calculator";
const SELF_SLUG = "human-life-value-calculator";

const DESC =
  "Free human life value calculator. Estimate the economic value of your future income to your family and the life insurance cover needed to replace it, with an income-replacement chart.";

const baseMetadata: Metadata = {
  title: "Human Life Value Calculator",
  description: DESC,
  keywords: [
    "human life value calculator",
    "HLV calculator",
    "life insurance need calculator",
    "income replacement value",
    "how much life insurance do I need",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Human Life Value Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Human Life Value Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is human life value?",
    answer:
      "Human life value is the present value of the income you would earn over the rest of your working life that supports your family. It is a way to put a dollar figure on the financial protection your loved ones would lose if your income suddenly stopped, and it is one of the main methods used to size life insurance cover.",
  },
  {
    question: "How is human life value calculated?",
    answer:
      "Take the share of your income that supports your family, which is your income minus what you spend only on yourself. Grow that amount each year by an expected income growth rate up to retirement, then discount every future year back to today using an assumed return. Adding up those discounted amounts gives your human life value.",
  },
  {
    question: "Why subtract personal expenses?",
    answer:
      "If something happened to you, the money you spend purely on yourself would no longer be needed by the household. Insurers and planners replace only the part of your income that actually flows to dependants, so excluding your own spending gives a more realistic cover figure rather than overstating the need.",
  },
  {
    question: "Does this replace a full insurance review?",
    answer:
      "No. The human life value method is a useful starting point, but it does not account for one-off needs like clearing a mortgage, funding education, or final expenses, nor for changing family circumstances. Treat the result as a guide and confirm the right cover with a licensed adviser before buying a policy.",
  },
];

export default async function HumanLifeValueCalculatorPage() {
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
    name: "Human Life Value Calculator",
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
      title="Human Life Value Calculator"
      intro="Put a number on the income your family relies on. Enter your age, earnings and a few assumptions to see your human life value and the life cover that would replace it."
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
            { name: "Human Life Value Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Human Life Value Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HumanLifeValueCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the human life value calculator works</H2>
            <P>
              Your earning power is one of your largest financial assets, yet it rarely shows up on a
              balance sheet. This tool measures it by projecting the part of your income that supports
              your household each year until you retire, then discounting those future amounts back to
              what they are worth in today's money.
            </P>
            <P>
              The chart traces how that value builds up over your remaining working years. Early years
              add the most because they are discounted the least, which is why protecting a younger
              earner usually means a larger number than many people expect.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you are 35, plan to work to 60, and earn $80,000 a year. You spend about a
              quarter of that on yourself, expect roughly 3% annual raises, and use a 6% discount rate.
              The income that flows to your family, discounted to today, works out near $900,000. After
              subtracting $50,000 of savings and a $100,000 policy you already hold, the gap that new
              cover should fill is around $750,000.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The result is sensitive to your growth and discount assumptions, so try a few scenarios
              rather than trusting a single figure. The human life value method ignores lump-sum needs
              such as paying off debt or funding college. For a broad overview of life insurance basics
              from a neutral source, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To project what your savings could grow into alongside any cover, try our{" "}
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
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
