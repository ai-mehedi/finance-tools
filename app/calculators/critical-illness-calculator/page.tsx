import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CriticalIllnessCalculator from "./CriticalIllnessCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/critical-illness-calculator";
const SELF_SLUG = "critical-illness-calculator";

const DESC =
  "Free critical illness cover calculator. Estimate the lump sum you need to replace income, clear debts and pay for treatment after a serious diagnosis, then subtract any cover you already hold to find your gap.";

const baseMetadata: Metadata = {
  title: "Critical Illness Cover Calculator",
  description: DESC,
  keywords: [
    "critical illness calculator",
    "critical illness cover",
    "how much critical illness cover",
    "critical illness insurance amount",
    "illness cover gap",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Critical Illness Cover Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Critical Illness Cover Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is critical illness cover?",
    answer:
      "Critical illness cover is an insurance policy that pays a tax free lump sum if you are diagnosed with one of the serious conditions listed in the plan, such as cancer, a heart attack or a stroke. The money is yours to spend on anything, from replacing lost income to adapting your home.",
  },
  {
    question: "How much critical illness cover do I need?",
    answer:
      "A common approach is to add up the income you would need to replace while you recover, the debts you would want cleared, any out of pocket treatment costs and a buffer for everyday bills, then subtract cover you already have. This calculator does that sum and shows the remaining gap.",
  },
  {
    question: "Is critical illness cover the same as life insurance?",
    answer:
      "No. Life insurance pays out when you die, while critical illness cover pays out while you are still living but seriously ill. Some policies combine the two, but a combined plan usually pays only once, so read the terms before assuming you are covered for both.",
  },
  {
    question: "Why subtract existing cover from the total?",
    answer:
      "Many people already hold some protection through an employer scheme or an older policy. Counting that existing cover means you only buy the shortfall, which keeps your premiums lower while still closing the gap between what you have and what you would need.",
  },
];

export default async function CriticalIllnessCalculatorPage() {
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
    "🩺"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Critical Illness Cover Calculator",
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
      title="Critical Illness Cover Calculator"
      intro="Work out how big a critical illness lump sum you actually need. Enter your income, debts, expected treatment costs and any cover you already have, then press Calculate to see your gap."
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
            { name: "Critical Illness Cover Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Critical Illness Cover Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CriticalIllnessCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the critical illness calculator works</H2>
            <P>
              A serious diagnosis hits your finances from several directions at once. You may stop
              earning while you recover, yet the mortgage, loans and weekly bills keep arriving, and
              treatment can add costs your health plan does not fully cover. This tool adds those
              pressures into one target lump sum so a single payout can carry you through.
            </P>
            <P>
              The donut splits that target into four parts: the income you want to replace, a twelve
              month buffer for everyday expenses, the debts you would clear, and your treatment
              costs. The headline figure is what is left after subtracting cover you already hold,
              so it is the amount you would actually shop for.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you earn $60,000 and want three years of income while you recover, spend
              $3,000 a month on household bills, owe $180,000 on a mortgage and expect $25,000 of
              treatment costs. The total need comes to about $421,000. If you already hold $50,000
              of cover, the calculator shows a remaining gap of roughly $371,000 to insure.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Policies differ on which conditions they pay out for, so always read the list of
              covered illnesses and the severity definitions before you buy. For an overview of how
              this protection works, see the{" "}
              <a href="https://www.investopedia.com/terms/c/critical-illness-insurance.asp" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investopedia guide to critical illness insurance</a>.
              If you also want to size up a death benefit for your family, pair this with our{" "}
              <Link href="/calculators/life-insurance-calculator" className="text-orange-600 underline">life insurance calculator</Link>.
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
