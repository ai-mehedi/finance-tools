import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SalaryInflationCalculator from "./SalaryInflationCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/salary-inflation-calculator";
const SELF_SLUG = "salary-inflation-calculator";

const DESC =
  "Free salary inflation calculator. Compare your future salary on paper against its real value in today's dollars after inflation, and see whether your raises are keeping up.";

const baseMetadata: Metadata = {
  title: "Salary Inflation Calculator",
  description: DESC,
  keywords: [
    "salary inflation calculator",
    "real salary calculator",
    "inflation adjusted salary",
    "purchasing power calculator",
    "real wage calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Salary Inflation Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Salary Inflation Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What does the salary inflation calculator show?",
    answer:
      "It shows two numbers for your future salary: the nominal figure on your payslip after raises, and the real figure once inflation is stripped out and the value is expressed in today's dollars. The gap between them is the purchasing power lost to rising prices.",
  },
  {
    question: "How is the real, inflation-adjusted salary calculated?",
    answer:
      "Each year the salary grows by your raise, then it is divided by one plus the inflation rate raised to the number of years. That discounting converts tomorrow's dollars back into what they would buy today, giving the real salary.",
  },
  {
    question: "What is the difference between nominal and real pay?",
    answer:
      "Nominal pay is the dollar amount you are paid. Real pay is what that amount can actually buy after accounting for inflation. A bigger paycheck can still mean a pay cut in real terms if prices rise faster than your salary.",
  },
  {
    question: "Do my raises keep up with inflation?",
    answer:
      "Only if your raise percentage is at least as high as inflation. The calculator compares the two and reports the real annual rate, which is roughly your raise minus inflation. A positive number means your buying power grows, a negative one means it shrinks.",
  },
];

export default async function SalaryInflationCalculatorPage() {
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
    "📉"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salary Inflation Calculator",
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
      title="Salary Inflation Calculator"
      intro="Find out what your future salary is really worth. Enter your pay, expected raises and inflation, then press Calculate to compare the paper figure with its value in today's dollars."
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
            { name: "Salary Inflation Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Salary Inflation Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalaryInflationCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the salary inflation calculator works</H2>
            <P>
              The tool grows your salary each year by the raise you expect, which gives the nominal
              figure that will appear on your future payslip. It then discounts that figure by inflation,
              dividing by one plus the inflation rate for every year that passes. The result is your real
              salary, expressed in the buying power of today's dollars.
            </P>
            <P>
              The chart draws both paths. The solid line is the nominal salary climbing with raises, and
              the dashed line is the real salary. When inflation runs hot, the dashed line can flatten or
              even fall while the solid line keeps rising, which is the classic feeling of working harder
              for the same lifestyle.
            </P>

            <H2>A quick example</H2>
            <P>
              Take 60,000 dollars with 3 percent raises but 3.5 percent inflation over 10 years. On paper
              the salary reaches about 80,635 dollars, which looks like a healthy jump. Adjusted for
              inflation it is worth roughly 57,140 dollars in today's money, meaning your real buying power
              has slipped by close to 5 percent despite annual raises.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Inflation is uneven and your personal cost of living may differ from the headline rate, so
              treat the result as a guide. The official measure to watch is the{" "}
              <a href="https://www.bls.gov/cpi/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Price Index</a>.
              To project how raises alone grow your pay before inflation, pair this with our{" "}
              <Link href="/calculators/salary-increment-calculator" className="text-orange-600 underline">salary increment calculator</Link>.
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
