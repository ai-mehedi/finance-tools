import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PaycheckCalculator from "./PaycheckCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/paycheck-calculator";
const SELF_SLUG = "paycheck-calculator";

const DESC =
  "Free paycheck calculator. Estimate your take-home pay per paycheck after federal tax, state tax, Social Security, Medicare and 401k contributions, with a donut chart of where each dollar goes.";

const baseMetadata: Metadata = {
  title: "Paycheck Calculator",
  description: DESC,
  keywords: [
    "paycheck calculator",
    "take home pay calculator",
    "net pay calculator",
    "salary after tax",
    "paycheck after deductions",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Paycheck Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Paycheck Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What does a paycheck calculator estimate?",
    answer:
      "It estimates your net pay, the amount that actually lands in your bank account each pay period, after subtracting federal income tax, state income tax, Social Security, Medicare and any pre-tax retirement contributions from your gross salary.",
  },
  {
    question: "Why is my take-home pay so much less than my salary?",
    answer:
      "Several layers come out of gross pay before you see it. Social Security takes 6.2 percent and Medicare 1.45 percent of wages, federal and state income tax are withheld on top, and pre-tax 401k contributions are set aside for retirement. Together these can easily reduce a paycheck by a quarter or more.",
  },
  {
    question: "Are 401k contributions taxed?",
    answer:
      "A traditional 401k contribution is taken out before income tax, so it lowers the wages your federal and state tax are calculated on. It does not lower Social Security or Medicare, though, because those payroll taxes apply to your full gross wages.",
  },
  {
    question: "How accurate is this estimate?",
    answer:
      "It uses a flat effective rate you supply for federal and state tax rather than full bracket tables, so treat it as a close planning estimate. Your real withholding depends on your W-4 entries, filing status, credits and local taxes, which your employer's payroll system applies exactly.",
  },
];

export default async function PaycheckCalculatorPage() {
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
    "💵"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Paycheck Calculator",
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
      title="Paycheck Calculator"
      intro="Find out what actually hits your bank account. Enter your salary, pay frequency and tax rates, then press Calculate to see take-home pay per paycheck and a breakdown of every deduction."
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
            { name: "Paycheck Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Paycheck Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PaycheckCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the paycheck calculator works</H2>
            <P>
              The tool starts from your annual salary and walks through the same order a payroll system
              does. It first sets aside your pre-tax 401k contribution, then applies your federal and
              state income tax rates to the wages that remain. Social Security and Medicare are charged
              on your full gross wages, since payroll tax does not get the 401k break.
            </P>
            <P>
              Whatever survives all of that is your net pay. Dividing the yearly net by the number of pay
              periods gives the figure on each paycheck. The donut chart turns the same numbers into
              shares, so you can see at a glance how much of every dollar you keep versus hand over.
            </P>

            <H2>A worked example</H2>
            <P>
              Take a $65,000 salary paid every two weeks, with a 5% 401k contribution, a 12% effective
              federal rate and a 4% state rate. Around $3,250 goes to retirement, roughly $4,970 to
              FICA, and the income taxes take their cut of the remaining wages. The take-home lands near
              $1,840 per bi-weekly paycheck, a little under 74% of gross.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Effective tax rates are simplifications, so check your real withholding against an official
              source such as the{" "}
              <a href="https://www.irs.gov/individuals/tax-withholding-estimator" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS Tax Withholding Estimator</a>.
              To see how raising your 401k rate compounds over decades, jump to our{" "}
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
