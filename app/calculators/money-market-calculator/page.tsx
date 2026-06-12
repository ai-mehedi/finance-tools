import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MoneyMarketCalculator from "./MoneyMarketCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/money-market-calculator";
const SELF_SLUG = "money-market-calculator";

const DESC =
  "Free money market account calculator. See how an opening deposit plus monthly deposits grow at a given APY, with a chart that separates your balance from the cash you put in.";

const baseMetadata: Metadata = {
  title: "Money Market Calculator",
  description: DESC,
  keywords: [
    "money market calculator",
    "money market account interest",
    "APY savings calculator",
    "money market savings growth",
    "high yield savings calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Money Market Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Money Market Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a money market account?",
    answer:
      "A money market account is a deposit account at a bank or credit union that usually pays a higher rate than a basic savings account. It is insured up to the legal limit and lets you grow cash you want to keep liquid rather than lock away.",
  },
  {
    question: "What does APY mean on a money market account?",
    answer:
      "APY stands for annual percentage yield. It is the real rate you earn over a year once compounding is included, so it is the figure to compare across accounts. This tool treats the APY you enter as the true yearly growth rate of your balance.",
  },
  {
    question: "How is a money market account different from a money market fund?",
    answer:
      "A money market account is a bank deposit that is federally insured and pays a set rate. A money market fund is an investment product that holds short term securities, is not insured, and has a yield that floats. This calculator models the insured deposit account, not the fund.",
  },
  {
    question: "Can the APY on my account change?",
    answer:
      "Yes. Most money market accounts pay a variable rate that the bank can raise or lower as market rates move, so your real earnings may differ from a single fixed projection. Re-run the calculator whenever your posted APY changes to keep the estimate current.",
  },
];

export default async function MoneyMarketCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Money Market Calculator",
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
      title="Money Market Calculator"
      intro="See what a money market account could grow into. Enter an opening deposit, optional monthly deposits, an APY and a term, then press Calculate to project your ending balance and interest."
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
            { name: "Money Market Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Money Market Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoneyMarketCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the money market calculator works</H2>
            <P>
              The tool starts with your opening deposit and grows it at the APY you enter, adding each
              monthly deposit as it lands. Because APY already bakes in compounding, the balance climbs
              a little every month rather than only once a year, which is how a real money market
              account credits interest.
            </P>
            <P>
              The chart pulls the two pieces apart. The shaded area is your total balance, and the
              dashed line is the cash you have deposited so far. The space between them is interest the
              bank has paid you, and it grows wider the longer your money stays in the account.
            </P>

            <H2>A quick example</H2>
            <P>
              Open with $5,000, add $200 a month, and earn a 4.5% APY for 5 years. You deposit $17,000
              of your own money, and the account finishes near $19,300. The roughly $2,300 difference is
              interest, earned without you lifting a finger after the first deposit.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Money market rates are variable, so the bank can change your APY at any time and the real
              result will drift from a single projection. Always compare the posted APY rather than the
              nominal rate, since APY is the apples-to-apples number. For the official rules on deposit
              insurance, see{" "}
              <a href="https://www.fdic.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">FDIC.gov</a>.
              If you are weighing a fixed term instead, compare results with our{" "}
              <Link href="/calculators/cd-calculator" className="text-orange-600 underline">CD calculator</Link>.
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
