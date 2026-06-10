import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PercentageCalculator from "./PercentageCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/percentage-calculator";
const SELF_SLUG = "percentage-calculator";

const DESC =
  "Free percentage calculator. Find what a percent of a number is, work out what percent one value is of another, or increase and decrease an amount by a percent, with a clear breakdown and a donut chart.";

export const metadata: Metadata = {
  title: "Percentage Calculator",
  description: DESC,
  keywords: [
    "percentage calculator",
    "percent of a number",
    "what percent is calculator",
    "increase by percentage",
    "percent off calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Percentage Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Percentage Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How do I find a percent of a number?",
    answer:
      "Divide the percent by 100 and multiply by the number. For example 20 percent of 150 is 0.20 times 150, which equals 30. This calculator does that for you when you pick the first option.",
  },
  {
    question: "How do I work out what percent one number is of another?",
    answer:
      "Divide the part by the whole and multiply by 100. If you scored 45 out of 180, that is 45 divided by 180 times 100, which equals 25 percent. Choose the second option to calculate this directly.",
  },
  {
    question: "How do I increase or decrease a value by a percent?",
    answer:
      "Multiply the value by 1 plus the percent divided by 100 to increase it, or by 1 minus the percent over 100 to decrease it. To add 15 percent to 200, multiply by 1.15 to get 230. Enter a negative percent to apply a decrease.",
  },
  {
    question: "What is the difference between percent and percentage points?",
    answer:
      "A percent describes a proportion of a base value, while a percentage point is the plain difference between two percentages. Going from 10 percent to 12 percent is a rise of 2 percentage points but a 20 percent relative increase in the rate.",
  },
];

export default async function PercentageCalculatorPage() {
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
    "％"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Percentage Calculator",
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
      title="Percentage Calculator"
      intro="Answer the three everyday percentage questions in one place: a percent of a number, what percent one value is of another, and an increase or decrease by a percent. Fill in the values and press Calculate."
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
            { name: "Percentage Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Percentage Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PercentageCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the percentage calculator works</H2>
            <P>
              Percentages all come back to the same idea: a part compared to a whole, scaled to 100.
              This tool packages the three questions people ask most. Pick a mode, type your numbers,
              and it applies the matching formula and shows the working so the answer is easy to check.
            </P>
            <P>
              The donut chart turns the result into a picture. It shades the share you calculated
              against the rest of the base, which makes it quick to see whether an amount is a small
              slice or most of the total.
            </P>

            <H2>A quick example</H2>
            <P>
              Say a $150 jacket is marked down by 20 percent. Using the first mode, 20 percent of 150 is
              30, so the discount is $30 and you pay $120. Switch to the third mode, enter a start of 150
              and a change of negative 20 percent, and you get the same $120 final price directly.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Order matters with stacked percentages: a 20 percent rise followed by a 20 percent fall does
              not return you to the start, because each step works on a different base. For more on the
              underlying idea, see{" "}
              <a href="https://en.wikipedia.org/wiki/Percentage" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">this overview of percentages</a>.
              To compare two figures over time, use our{" "}
              <Link href="/calculators/percentage-change-calculator" className="text-orange-600 underline">percentage change calculator</Link>.
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
