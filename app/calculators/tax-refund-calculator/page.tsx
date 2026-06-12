import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TaxRefundCalculator from "./TaxRefundCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/tax-refund-calculator";
const SELF_SLUG = "tax-refund-calculator";

const DESC =
  "Free tax refund calculator. Estimate your US federal income tax refund or balance due from your income, withholding, filing status and dependents, with a chart of tax owed in each bracket.";

const baseMetadata: Metadata = {
  title: "Tax Refund Calculator",
  description: DESC,
  keywords: [
    "tax refund calculator",
    "federal tax refund estimator",
    "income tax refund calculator",
    "tax return estimator",
    "how much tax refund",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Tax Refund Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Tax Refund Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is my tax refund calculated?",
    answer:
      "A refund is simply the gap between what was taken out of your paychecks and what you actually owe. The tool subtracts your deduction from your income to find taxable income, runs that through the federal brackets, subtracts credits such as the child tax credit, and then compares the result to the tax you had withheld. If withholding is higher, the difference is your refund.",
  },
  {
    question: "Why do I get a refund instead of owing money?",
    answer:
      "Employers estimate your tax across the year using the W-4 form and send it to the IRS each payday. When that running total ends up larger than your real bill, the overpayment comes back as a refund. A big refund means you lent the government money interest free, so some people adjust their W-4 to keep more in each paycheck instead.",
  },
  {
    question: "Does this calculator include state income tax?",
    answer:
      "No. This estimate covers only US federal income tax and the child tax credit. Most states run their own brackets, deductions and credits on top, so your real refund can differ. Treat the number as a starting point and check your state rules separately.",
  },
  {
    question: "Should I take the standard or itemized deduction?",
    answer:
      "Take whichever is larger. The standard deduction is a flat amount set by filing status, while itemizing adds up specific costs such as mortgage interest, state taxes and charitable gifts. Switch this calculator to itemized and enter your total to see which one lowers your taxable income more.",
  },
];

export default async function TaxRefundCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Tax Refund Calculator",
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
      title="Tax Refund Calculator"
      intro="See whether you are heading for a refund or a bill. Enter your income, withholding, filing status and dependents, then press Calculate to estimate your federal tax outcome."
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
            { name: "Tax Refund Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Tax Refund Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaxRefundCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the tax refund calculator works</H2>
            <P>
              Your refund is not random. It is the difference between the tax you truly owe and the tax
              your employer already sent in on your behalf. This tool rebuilds that math: it takes your
              deduction off your income, applies the federal brackets for your filing status, removes
              credits for qualifying children, and then subtracts everything you had withheld during
              the year.
            </P>
            <P>
              The bar chart breaks the bill into the slices of income taxed at each rate. Because the
              system is progressive, only the dollars inside a band are taxed at that band rate, which
              is why your effective rate sits well below the top bracket you reach.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose a single filer earns 75,000 dollars and has 9,500 dollars withheld. The 14,600
              dollar standard deduction leaves 60,400 dollars of taxable income. After running it
              through the 10, 12 and 22 percent bands the tax comes to roughly 8,400 dollars, so the
              roughly 1,100 dollar overpayment returns as a refund. Add one child and the 2,000 dollar
              credit pushes the refund higher still.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate built on the 2024 federal brackets, the standard deduction and the
              child tax credit only. It leaves out many real-world items such as retirement
              contributions, education credits, self-employment tax and state tax. For the official
              figures and forms, see the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS</a>.
              To check whether your paycheck withholding is on track, pair this with our{" "}
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
export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(SELF_SLUG, baseMetadata);
}
