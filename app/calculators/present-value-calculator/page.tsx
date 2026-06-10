import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PresentValueCalculator from "./PresentValueCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/present-value-calculator";
const SELF_SLUG = "present-value-calculator";

const DESC =
  "Free present value calculator. Discount a future lump sum and a stream of payments back to today's dollars at a chosen rate, and see how each future dollar shrinks the further out it sits.";

const baseMetadata: Metadata = {
  title: "Present Value Calculator",
  description: DESC,
  keywords: [
    "present value calculator",
    "PV calculator",
    "discounted cash flow",
    "present value of annuity",
    "time value of money",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Present Value Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Present Value Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is present value?",
    answer:
      "Present value is what a future sum of money is worth in today's dollars. Because money you hold now can be invested to earn a return, a dollar arriving years from now is worth less than a dollar in hand today. Present value converts the future amount back to that lower figure.",
  },
  {
    question: "What is the present value formula?",
    answer:
      "For a single future amount, PV equals FV divided by one plus the rate, raised to the number of periods. For a stream of equal payments it is the payment times one minus one plus the rate raised to the negative number of periods, divided by the rate. This tool adds both and discounts period by period.",
  },
  {
    question: "What discount rate should I use?",
    answer:
      "Use the return you could reasonably earn on a similar-risk alternative, often called the opportunity cost of capital. A higher discount rate makes future money worth less today, while a lower rate makes it worth more. Small changes in the rate can move the result a lot over long horizons.",
  },
  {
    question: "How is present value the opposite of future value?",
    answer:
      "Future value grows today's money forward in time at a rate, while present value discounts a future amount back to today at the same rate. If you know one figure, the rate and the time, you can always solve for the other.",
  },
];

export default async function PresentValueCalculatorPage() {
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
    "⏳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Present Value Calculator",
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
      title="Present Value Calculator"
      intro="Find out what future money is worth today. Enter a future lump sum, optional repeating payments and a discount rate to see the present value, plus a chart of how each future dollar shrinks over time."
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
            { name: "Present Value Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Present Value Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PresentValueCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the present value calculator works</H2>
            <P>
              Present value rests on a simple truth: money has a time cost. A dollar you receive in ten
              years is worth less than a dollar today, because today's dollar can be put to work and
              grow. The tool discounts your future lump sum and any repeating payments back to the
              present at the rate you choose, then adds the two pieces together.
            </P>
            <P>
              The chart plots the discount factor, which is what a single future dollar is worth in
              today's terms. It starts at one and curves downward, so you can see how value drains away
              the further a payment sits in the future.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you are promised $100,000 in 15 years and you could otherwise earn 6% a year. The
              present value is about $41,700. In other words, setting aside roughly $41,700 today at 6%
              would grow into that $100,000 promise, so paying more than that for the promise would
              leave you worse off.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The discount rate is the single most important input, and it should reflect the risk and
              opportunity cost of the money. Higher risk usually calls for a higher rate, which lowers
              the present value. For background on the time value of money, the{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC's Investor.gov</a>{" "}
              is a neutral reference. To run the same idea in reverse and grow money forward, use our{" "}
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
