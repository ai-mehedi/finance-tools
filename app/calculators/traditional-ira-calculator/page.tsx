import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TraditionalIraCalculator from "./TraditionalIraCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/traditional-ira-calculator";
const SELF_SLUG = "traditional-ira-calculator";

const DESC =
  "Free Traditional IRA calculator. Project your tax-deferred balance at retirement, estimate the after-tax value once withdrawals are taxed, and see the up-front deduction your contributions earn, with a growth chart by age.";

const baseMetadata: Metadata = {
  title: "Traditional IRA Calculator",
  description: DESC,
  keywords: [
    "traditional ira calculator",
    "ira retirement calculator",
    "tax deferred growth calculator",
    "ira contribution growth",
    "after-tax retirement balance",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Traditional IRA Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Traditional IRA Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How is a Traditional IRA taxed?",
    answer:
      "Contributions to a Traditional IRA may be deductible in the year you make them, which lowers your current taxable income. The money then grows tax-deferred, meaning you pay no tax on dividends, interest or gains along the way. Tax is due only when you withdraw in retirement, and at that point the entire withdrawal, both contributions and earnings, is taxed as ordinary income.",
  },
  {
    question: "Why does the calculator show both a pre-tax and an after-tax balance?",
    answer:
      "The pre-tax balance is the gross value sitting in the account at retirement. Because a Traditional IRA defers tax rather than eliminating it, the after-tax figure applies your expected retirement tax rate to the whole balance to show roughly what you would keep if you withdrew it all. The real spendable value lies between the two, since most people withdraw gradually over many years.",
  },
  {
    question: "What is the up-front tax savings line?",
    answer:
      "If your contributions are deductible, each dollar you put in reduces your taxable income, so you owe less tax this year. The up-front savings estimate multiplies your total contributions by your current marginal tax rate. It is a rough figure that assumes a steady rate and full deductibility, which phases out at higher incomes when you also have a workplace plan.",
  },
  {
    question: "Should I choose a Traditional or a Roth IRA?",
    answer:
      "It largely comes down to whether your tax rate is higher now or expected to be higher in retirement. A Traditional IRA favors people who expect a lower rate later, since you deduct at today's rate and pay tax at a lower future rate. A Roth IRA favors those who expect a higher future rate, because you pay tax now and withdraw tax-free. Many savers hold both to hedge their bets.",
  },
];

export default async function TraditionalIraCalculatorPage() {
  const [{ data: tools }, { data: articles }, self] = await Promise.all([
    getTools({ type: "calculator", limit: 7 }),
    getArticles({ limit: 4 }),
    getToolBySlug(SELF_SLUG),
  ]);
  const relatedTools = tools.filter((t) => t.slug !== SELF_SLUG).slice(0, 6);

  const icon = self?.thumbnail ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={self.thumbnail} alt="" referrerPolicy="no-referrer" decoding="async" className="h-full w-full object-contain p-1" />
  ) : (
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Traditional IRA Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Traditional IRA Calculator"
      intro="Estimate what your Traditional IRA could be worth at retirement. Enter your balance, yearly contribution and return, then see the pre-tax total, the after-tax value and the deduction your contributions earn today."
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
            { name: "Traditional IRA Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Traditional IRA Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TraditionalIraCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the Traditional IRA calculator works</H2>
            <P>
              Each year the calculator adds your contribution to the account and grows the whole balance
              at the return you choose. Because a Traditional IRA is tax-deferred, no tax is removed
              along the way, so the full balance keeps compounding. At your retirement age it reports the
              gross total, then applies your expected retirement tax rate to estimate the after-tax value
              and adds up the deductions your contributions earned at today's rate.
            </P>
            <P>
              The chart plots three lines by age: the pre-tax balance as a shaded area, the after-tax
              value beneath it, and a dashed line showing the cash you actually contributed. The widening
              gap between the contribution line and the balance is the power of decades of tax-deferred
              compounding.
            </P>

            <H2>A worked example</H2>
            <P>
              Start with 20,000 dollars at age 35, contribute 7,000 dollars a year, and earn 7 percent
              annually until age 65. The account grows to roughly 870,000 dollars before tax. Apply a 15
              percent retirement tax rate and about 740,000 dollars would remain if withdrawn all at once,
              while the contributions also saved you tax up front at your current rate each year.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Contribution limits, deduction phase-outs and required minimum distributions all change over
              time, so confirm the current figures with the{" "}
              <a href="https://www.irs.gov/retirement-plans/traditional-and-roth-iras" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS guidance on IRAs</a>{" "}
              before acting. Returns are never guaranteed, so treat the projection as a planning tool. To
              compare a tax-free alternative, try our{" "}
              <Link href="/calculators/roth-ira-calculator" className="text-orange-600 underline">Roth IRA calculator</Link>.
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
