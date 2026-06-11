import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MinimumPaymentCalculator from "./MinimumPaymentCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/minimum-payment-calculator";
const SELF_SLUG = "minimum-payment-calculator";

const DESC =
  "Free minimum payment calculator. See how many years and how much interest it takes to clear a credit card balance when you only pay the monthly minimum, with a chart of the slowly falling balance.";

const baseMetadata: Metadata = {
  title: "Minimum Payment Calculator",
  description: DESC,
  keywords: [
    "minimum payment calculator",
    "credit card minimum payment",
    "minimum payment payoff time",
    "credit card interest calculator",
    "how long to pay off credit card",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Minimum Payment Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Minimum Payment Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is a credit card minimum payment calculated?",
    answer:
      "Most issuers set the minimum as the greater of a small percentage of your balance, often 1 to 3 percent, or a fixed floor such as 25 dollars. This tool uses that same greater-of rule each month, so the required payment shrinks as the balance falls until it hits the floor.",
  },
  {
    question: "Why does paying the minimum take so long?",
    answer:
      "Because the minimum is tied to the balance, it falls as you pay down, so less goes toward principal every month. Combined with interest charged on the remaining balance, this stretches a few thousand dollars into one or even two decades of payments and a large interest bill.",
  },
  {
    question: "Can a balance never get paid off?",
    answer:
      "It can stall if the minimum payment is smaller than the monthly interest, which happens at very high rates with a low percentage minimum. When that occurs the balance holds steady or grows, and this calculator flags it so you know the minimum alone will not work.",
  },
  {
    question: "How much faster is it to pay more than the minimum?",
    answer:
      "Dramatically faster. Even a modest fixed extra amount each month goes straight to principal, which cuts both the payoff time and the total interest sharply. Paying a steady flat figure instead of a shrinking percentage is one of the most effective ways to escape card debt.",
  },
];

export default async function MinimumPaymentCalculatorPage() {
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
    name: "Minimum Payment Calculator",
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
      title="Minimum Payment Calculator"
      intro="See the true cost of paying only the minimum on a credit card. Enter your balance, APR, and minimum terms, then press Calculate to reveal the payoff time and interest."
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
            { name: "Minimum Payment Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Minimum Payment Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MinimumPaymentCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the minimum payment calculator works</H2>
            <P>
              Each month the tool charges interest on your current balance, then sets the required
              payment to the greater of a percentage of the balance or a fixed dollar floor, just as
              card issuers do. Whatever is left after interest reduces the principal. Because the
              percentage minimum keeps shrinking as the balance drops, the early months barely make a
              dent, and the payoff drags on for years.
            </P>
            <P>
              The chart traces the balance falling month by month. You will notice the curve is steep
              at first and then flattens once the payment hits the fixed floor, which is the stage
              where most of the long tail of interest piles up.
            </P>

            <H2>A quick example</H2>
            <P>
              Take a 5,000 dollar balance at a 22 percent APR with a 2 percent minimum and a 25 dollar
              floor. The first payment is about 100 dollars, but roughly 92 of that is interest. Paying
              only the minimum stretches the payoff well past a decade and adds thousands of dollars in
              interest on top of the original balance.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The single most powerful change is to pay a steady fixed amount rather than the shrinking
              minimum, since every extra dollar attacks principal directly. For consumer guidance on
              card debt and your rights, see the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              To compare a fixed payoff plan, use our{" "}
              <Link href="/calculators/credit-card-payoff-calculator" className="text-orange-600 underline">credit card payoff calculator</Link>.
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
