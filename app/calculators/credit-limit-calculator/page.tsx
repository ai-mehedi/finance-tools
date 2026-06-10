import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CreditLimitCalculator from "./CreditLimitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/credit-limit-calculator";
const SELF_SLUG = "credit-limit-calculator";

const DESC =
  "Free credit limit increase calculator. See how a higher credit limit lowers your utilization ratio and whether it brings you under the recommended 30% line.";

const baseMetadata: Metadata = {
  title: "Credit Limit Increase Calculator",
  description: DESC,
  keywords: [
    "credit limit increase calculator",
    "credit limit calculator",
    "credit utilization calculator",
    "credit limit increase utilization",
    "higher credit limit calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Credit Limit Increase Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Credit Limit Increase Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does a higher credit limit affect my credit score?",
    answer:
      "A higher limit lowers your credit utilization ratio, which is your balance divided by your limit. Since utilization is one of the largest factors in a credit score, dropping it, for example from 44% to 27%, can help your score, as long as you do not run the balance back up.",
  },
  {
    question: "What is a good credit utilization ratio?",
    answer:
      "Most guidance suggests keeping utilization under 30%, and under 10% is even better. The calculator marks the 30% line so you can see whether the new limit gets you into that healthy zone.",
  },
  {
    question: "Will requesting a higher limit hurt my score?",
    answer:
      "It depends on the issuer. Some grant increases with a soft pull that does not affect your score, while others use a hard inquiry that can ding it a few points temporarily. The lower utilization usually outweighs a small inquiry over time.",
  },
  {
    question: "Should I increase my limit or pay down the balance?",
    answer:
      "Both lower utilization. Paying down the balance reduces what you owe and cuts interest, while a higher limit improves the ratio without reducing debt. Paying down is the stronger long-term move, but a higher limit can help quickly if you keep spending in check.",
  },
];

export default async function CreditLimitCalculatorPage() {
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
    "💳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Credit Limit Increase Calculator",
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
      title="Credit Limit Increase Calculator"
      intro="See how a higher credit limit changes your utilization ratio and whether it brings you under the recommended 30% line. Enter your numbers and press Calculate."
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
            { name: "Credit Limit Increase Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Credit Limit Increase Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreditLimitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How a limit increase changes utilization</H2>
            <P>
              Credit utilization is the share of your available credit you are using, calculated as
              balance divided by limit. If you owe $2,200 on a $5,000 card, you are at 44%. Raise the
              limit to $8,000 and the same balance is only about 27%, because the denominator grew.
              Your debt did not change, but the ratio lenders watch did.
            </P>
            <P>
              This matters because utilization is one of the heaviest factors in a credit score.
              Crossing below the widely cited 30% line, and ideally below 10%, tends to help. The
              before and after bars above show exactly where a proposed increase lands you.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you carry $2,200 on a $5,000 limit and ask for a $3,000 increase. Your
              utilization falls from 44% to roughly 27%, slipping under the 30% guideline. If you had
              only been granted a $1,000 increase, you would still sit near 37%, above the line.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A higher limit only helps if you do not spend up to it. The safest play is to treat the
              extra room as a buffer, not a budget. For more on how scores are built, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              You can also check your full picture with our{" "}
              <Link href="/calculators/credit-utilization-calculator" className="text-orange-600 underline">credit utilization calculator</Link>.
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
