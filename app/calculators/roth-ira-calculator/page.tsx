import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RothIraCalculator from "./RothIraCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/roth-ira-calculator";
const SELF_SLUG = "roth-ira-calculator";

const DESC =
  "Free Roth IRA calculator. Project your tax-free retirement balance from yearly contributions and an expected return, compare it against a taxable account, and see the Roth advantage on a growth chart.";

const baseMetadata: Metadata = {
  title: "Roth IRA Calculator",
  description: DESC,
  keywords: [
    "roth ira calculator",
    "roth ira growth",
    "tax free retirement",
    "ira contribution limit",
    "roth vs taxable account",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Roth IRA Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Roth IRA Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is a Roth IRA taxed?",
    answer:
      "You fund a Roth IRA with money you have already paid income tax on, so contributions are not deductible. In return, qualified withdrawals in retirement, including all of the investment growth, come out completely tax free. That is why the projected balance is also the spendable amount.",
  },
  {
    question: "How much can I contribute to a Roth IRA?",
    answer:
      "For 2024 the annual limit is 7,000 dollars, rising to 8,000 dollars once you reach age 50 thanks to the catch-up amount. This calculator automatically caps your entry to the limit for each year and flags when it has done so, so your projection stays realistic.",
  },
  {
    question: "Why does a Roth beat a taxable account?",
    answer:
      "In a regular taxable account, dividends and gains are taxed along the way, which drags down compounding. A Roth shelters all of that growth, so the same contributions and return produce a larger balance. The calculator estimates the after-tax value of a taxable account so you can see the gap.",
  },
  {
    question: "What return should I assume?",
    answer:
      "There is no guaranteed number, but a long-run diversified stock and bond portfolio has historically returned somewhere in the range of 6 to 8 percent before inflation. Try a few rates to see how sensitive your ending balance is, and remember that real returns vary year to year.",
  },
];

export default async function RothIraCalculatorPage() {
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
    "🪙"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Roth IRA Calculator",
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
      title="Roth IRA Calculator"
      intro="See what tax-free retirement savings could look like. Enter your age, contributions and expected return, then press Calculate to project your Roth balance and compare it with a taxable account."
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
            { name: "Roth IRA Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Roth IRA Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RothIraCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the Roth IRA calculator works</H2>
            <P>
              The tool starts from your current balance and adds your contribution at the beginning of
              each year, capped at the IRS annual limit for your age, then grows the whole pot at the
              return you choose. Because a Roth is funded with after-tax dollars, no tax is taken out
              along the way or at withdrawal, so the ending number is what you actually get to spend in
              retirement.
            </P>
            <P>
              Alongside the Roth, it models a taxable brokerage account that receives the same
              contributions but pays tax on its gains as they accrue. That account compounds at a lower
              after-tax rate, and the shaded area against the dashed line on the chart shows how much
              extra the Roth keeps by sheltering growth from tax.
            </P>

            <H2>A worked example</H2>
            <P>
              A 30 year old with 5,000 dollars saved who contributes 7,000 dollars a year at a 7 percent
              return until age 65 ends up with well over 1 million dollars, all of it tax free. An
              equivalent taxable account at a 24 percent tax rate lands meaningfully lower because each
              year of dividends and gains is trimmed by tax. The difference is the Roth advantage.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Roth IRAs have income limits that can reduce or block direct contributions, and the
              figures here ignore inflation, so a future dollar buys less than today. Confirm the
              current rules at{" "}
              <a href="https://www.irs.gov/retirement-plans/roth-iras" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the IRS</a>{" "}
              before relying on a projection. To explore a pre-tax alternative, compare with our{" "}
              <Link href="/calculators/401k-calculator" className="text-orange-600 underline">401(k) calculator</Link>.
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
