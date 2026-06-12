import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PercentageChangeCalculator from "./PercentageChangeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/percentage-change-calculator";
const SELF_SLUG = "percentage-change-calculator";

const DESC =
  "Free percentage change calculator. Compare an old value with a new value to find the percent increase or decrease, the absolute difference and the direction of the move, with a side-by-side bar chart.";

const baseMetadata: Metadata = {
  title: "Percentage Change Calculator",
  description: DESC,
  keywords: [
    "percentage change calculator",
    "percent increase calculator",
    "percent decrease calculator",
    "percentage difference",
    "rate of change percent",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Percentage Change Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Percentage Change Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is the percentage change formula?",
    answer:
      "Percentage change is the new value minus the old value, divided by the absolute value of the old value, then multiplied by 100. A positive answer is an increase and a negative answer is a decrease.",
  },
  {
    question: "Why must the old value not be zero?",
    answer:
      "The formula divides by the old value, and dividing by zero is undefined. There is also no meaningful percent change from nothing to something, so the calculator asks for a non-zero starting value.",
  },
  {
    question: "What is the difference between percent change and percent difference?",
    answer:
      "Percent change measures movement from a known starting point to an ending point, so the order matters. Percent difference compares two values without a clear before and after, dividing by their average instead of by the first value.",
  },
  {
    question: "How do I reverse a percentage change?",
    answer:
      "A decrease and the matching increase are not equal because they use different bases. If a price falls 20 percent it must rise 25 percent to return to the original, since the rise is measured against the lower amount.",
  },
];

export default async function PercentageChangeCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Percentage Change Calculator",
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
      title="Percentage Change Calculator"
      intro="See how much a value has moved in percent terms. Enter the original and the new figure, then press Calculate to get the percent increase or decrease, the raw difference and the direction."
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
            { name: "Percentage Change Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Percentage Change Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PercentageChangeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the percentage change calculator works</H2>
            <P>
              Percentage change tells you how big a move is relative to where it started, not just in
              raw units. The tool subtracts the old value from the new one to get the difference, then
              expresses that difference as a share of the original value and scales it to 100.
            </P>
            <P>
              The two bars put the old and new figures next to each other so the size of the shift is
              easy to read at a glance. The headline turns green for an increase and red for a decrease,
              with a plus or minus sign on the percent.
            </P>

            <H2>A quick example</H2>
            <P>
              A subscription rises from $120 to $150. The difference is $30, and $30 divided by 120 is
              0.25, so the price went up 25 percent. If it later fell back from $150 to $120, that same
              $30 over the new base of 150 would be a 20 percent decrease, not 25.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Always be clear which figure is the starting point, because swapping old and new flips the
              result. Percentage change can also exaggerate moves from a tiny base, so check the absolute
              difference too. For context on common pitfalls, see{" "}
              <a href="https://en.wikipedia.org/wiki/Relative_change" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">this note on relative change</a>.
              For one-off percent math, try our{" "}
              <Link href="/calculators/percentage-calculator" className="text-orange-600 underline">percentage calculator</Link>.
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
