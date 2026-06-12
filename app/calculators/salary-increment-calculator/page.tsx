import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SalaryIncrementCalculator from "./SalaryIncrementCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/salary-increment-calculator";
const SELF_SLUG = "salary-increment-calculator";

const DESC =
  "Free salary increment calculator. See your salary after a yearly percentage raise compounds over several years, with the dollar increase, total growth and a year-by-year chart.";

const baseMetadata: Metadata = {
  title: "Salary Increment Calculator",
  description: DESC,
  keywords: [
    "salary increment calculator",
    "salary raise calculator",
    "pay rise calculator",
    "annual increment calculator",
    "salary growth calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Salary Increment Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Salary Increment Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is a salary increment calculated?",
    answer:
      "A percentage raise is applied to your current salary, then the new, higher salary becomes the base for next year's raise. So a 5 percent raise on 60,000 dollars adds 3,000 dollars in year one, but the year-two raise is 5 percent of 63,000 dollars, which is 3,150 dollars.",
  },
  {
    question: "Why does a small yearly raise add up to so much?",
    answer:
      "Because raises compound. Each increase is calculated on a larger salary than the year before, so the dollar amount of every raise keeps growing. Over a decade even a modest 4 to 5 percent raise can lift a salary by roughly half.",
  },
  {
    question: "What is a good annual salary increment?",
    answer:
      "It varies by industry and performance, but typical merit raises often land between 3 and 5 percent a year. A promotion or job change can deliver a much larger one-time jump. Compare your raise to inflation to judge whether your buying power is actually rising.",
  },
  {
    question: "Does this calculator account for taxes or inflation?",
    answer:
      "No. It shows the growth of your gross salary only. To see whether your raises are keeping ahead of rising prices, run the same numbers through our salary inflation calculator.",
  },
];

export default async function SalaryIncrementCalculatorPage() {
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
    name: "Salary Increment Calculator",
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
      title="Salary Increment Calculator"
      intro="See where steady raises take your salary. Enter your current pay, an annual increment and a number of years, then press Calculate to watch it compound."
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
            { name: "Salary Increment Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Salary Increment Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalaryIncrementCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the salary increment calculator works</H2>
            <P>
              An increment is a raise expressed as a percentage of your current salary. The key detail
              is that it compounds: once a raise is applied, the new salary becomes the starting point
              for the next year's raise. The tool repeats that step for every year you choose and tracks
              the running salary along the way.
            </P>
            <P>
              The chart plots that climb. Notice how the line steepens slightly each year, because the
              same percentage is taken from a larger base, so the dollar value of every raise grows even
              when the percentage stays flat.
            </P>

            <H2>A quick example</H2>
            <P>
              Start at 60,000 dollars with a 5 percent raise each year for 10 years. The first raise adds
              3,000 dollars, but by year 10 your salary has grown to about 97,734 dollars, a gain near
              63 percent. The final raise alone is worth more than 4,600 dollars, far above that first
              3,000 dollar bump.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Real raises are rarely identical every year, and a promotion or job switch can change the
              path entirely. A raise also only builds wealth if it outpaces rising prices, so check it
              against inflation with our{" "}
              <Link href="/calculators/salary-inflation-calculator" className="text-orange-600 underline">salary inflation calculator</Link>.
              For data on how pay changes across the economy, see the{" "}
              <a href="https://www.bls.gov/ect/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Employment Cost Index</a>.
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
