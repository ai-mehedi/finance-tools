import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MortgageProtectionCalculator from "./MortgageProtectionCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mortgage-protection-calculator";
const SELF_SLUG = "mortgage-protection-calculator";

const DESC =
  "Free mortgage protection calculator. Estimate the life-insurance cover needed to clear your mortgage if you die, see an illustrative monthly premium, and chart how the coverage gap shrinks as the loan amortizes.";

const baseMetadata: Metadata = {
  title: "Mortgage Protection Calculator",
  description: DESC,
  keywords: [
    "mortgage protection calculator",
    "mortgage life insurance",
    "decreasing term insurance",
    "mortgage protection insurance cost",
    "MPI calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Mortgage Protection Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Mortgage Protection Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is mortgage protection insurance?",
    answer:
      "Mortgage protection insurance is a life policy whose payout is sized to clear your home loan if you die during the term. With decreasing term cover the payout falls in step with the amortizing balance, so the policy is cheaper than buying a fixed amount of level cover for the same loan.",
  },
  {
    question: "How much cover do I actually need?",
    answer:
      "A common rule is to cover the outstanding mortgage balance so the home is paid off for your family. Some people add a cushion for funeral costs, legal fees or a few months of bills. This tool sets the recommended payout to your current balance, which is the figure most decreasing-term policies start from.",
  },
  {
    question: "Is the premium shown here a real quote?",
    answer:
      "No. The premium is an illustrative estimate based on a simple model that scales with age, term, smoker status and cover type. Real underwriting looks at your health, occupation and medical history, so an actual quote from an insurer can be higher or lower.",
  },
  {
    question: "Should I choose level or decreasing term cover?",
    answer:
      "Decreasing term tracks a repayment mortgage that shrinks over time and usually costs less. Level term keeps the payout fixed, which suits an interest-only mortgage where the balance never falls, or if you want the extra leftover lump sum to go to your family.",
  },
];

export default async function MortgageProtectionCalculatorPage() {
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
    name: "Mortgage Protection Calculator",
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
      title="Mortgage Protection Calculator"
      intro="Work out how much life cover would clear your mortgage if the worst happened. Enter your balance, rate and term, then press Calculate to see the recommended payout and an illustrative premium."
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
            { name: "Mortgage Protection Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mortgage Protection Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MortgageProtectionCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the mortgage protection calculator works</H2>
            <P>
              The tool first amortizes your mortgage to find what you still owe today and how that
              balance falls month by month. The recommended cover is set to the current balance, so a
              claim would leave the home mortgage-free for whoever you leave behind.
            </P>
            <P>
              It then applies a simple cost model to estimate a premium. The rate per thousand dollars
              of cover rises with your age and the length of the term, climbs for smokers, and drops
              for decreasing term because the insurer&rsquo;s exposure shrinks every year alongside the
              loan.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you owe $280,000 at 6% with 25 years left, you are 38, a non-smoker, and you
              choose decreasing term. The recommended payout starts at $280,000 and the chart shows it
              gliding down toward zero as the mortgage is repaid. The estimated premium is a small
              fraction of your monthly mortgage payment, which is why this cover is popular with new
              homeowners on a budget.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Treat the premium as a planning figure, not a binding quote. The policy term should match
              the years left on your mortgage, and if you switch to an interest-only deal you may need
              level cover instead. For impartial guidance on life cover, see{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the Consumer Financial Protection Bureau</a>.
              To plan the loan itself, try our{" "}
              <Link href="/calculators/mortgage-refinance-calculator" className="text-orange-600 underline">mortgage refinance calculator</Link>.
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
