import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PayrollTaxCalculator from "./PayrollTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/payroll-tax-calculator";
const SELF_SLUG = "payroll-tax-calculator";

const DESC =
  "Free payroll tax calculator. Break down FICA Social Security and Medicare taxes into the employee share, the matching employer share and the combined total, including the additional Medicare surtax.";

export const metadata: Metadata = {
  title: "Payroll Tax Calculator",
  description: DESC,
  keywords: [
    "payroll tax calculator",
    "FICA tax calculator",
    "Social Security tax",
    "Medicare tax",
    "employer payroll tax",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Payroll Tax Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Payroll Tax Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is payroll tax?",
    answer:
      "Payroll tax in the United States usually means FICA, the combination of Social Security and Medicare taxes funded from wages. It is split evenly between the worker and the employer, with each side paying a matching amount that is sent to the government every pay period.",
  },
  {
    question: "What are the FICA tax rates?",
    answer:
      "Social Security is 6.2 percent from the employee and 6.2 percent from the employer, charged on wages up to an annual wage base of 168,600 dollars. Medicare is 1.45 percent from each side on all wages, with no cap. The standard combined rate is therefore 15.3 percent of wages within the Social Security base.",
  },
  {
    question: "What is the additional Medicare tax?",
    answer:
      "High earners pay an extra 0.9 percent Medicare surtax on wages above 200,000 dollars for a single filer. Only the employee pays this surtax, the employer does not match it, which is why the employee Medicare figure can exceed the employer figure at higher incomes.",
  },
  {
    question: "Do employers really pay the same payroll tax as workers?",
    answer:
      "Yes, for Social Security and the base Medicare rate the employer matches the employee dollar for dollar. Economists often argue that workers ultimately bear part of the employer share through lower wages, but on paper the company writes its own matching check on top of what it withholds from you.",
  },
];

export default async function PayrollTaxCalculatorPage() {
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
    "🏛️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Payroll Tax Calculator",
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
      title="Payroll Tax Calculator"
      intro="See exactly how FICA payroll tax is split. Enter your annual wages and press Calculate to break Social Security and Medicare into the employee share, the matching employer share and the combined cost."
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
            { name: "Payroll Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Payroll Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PayrollTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the payroll tax calculator works</H2>
            <P>
              The tool takes your gross annual wages and runs them through the two FICA components.
              Social Security charges 6.2% on each side, but only on wages up to the annual wage base,
              so once you cross that ceiling the Social Security portion stops growing. Medicare charges
              1.45% on each side with no ceiling at all.
            </P>
            <P>
              Above the high-earner threshold the tool adds the 0.9% additional Medicare surtax to the
              employee column only, because the employer never matches that piece. The bar chart places
              the employee and employer amounts side by side for each component so the matching, and the
              gap created by the surtax, are easy to see.
            </P>

            <H2>A worked example</H2>
            <P>
              On $90,000 of wages, Social Security is 6.2% on the full amount, giving $5,580 from you and
              another $5,580 from your employer. Medicare adds 1.45%, or $1,305, from each side. Your
              share comes to $6,885, your employer matches it, and the combined FICA bill is $13,770,
              about 15.3% of wages.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Wage bases and thresholds are updated each year, so confirm the current figures with the{" "}
              <a href="https://www.ssa.gov/oact/cola/cbb.html" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Social Security Administration wage base page</a>{" "}
              before relying on a number. To see what lands in your account after income tax as well, use
              our{" "}
              <Link href="/calculators/paycheck-calculator" className="text-orange-600 underline">paycheck calculator</Link>.
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
