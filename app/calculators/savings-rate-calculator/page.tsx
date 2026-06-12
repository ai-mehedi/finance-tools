import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SavingsRateCalculator from "./SavingsRateCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/savings-rate-calculator";
const SELF_SLUG = "savings-rate-calculator";

const DESC =
  "Free savings rate calculator. Enter your monthly income, expenses and any extra saved to find your personal savings rate, plus how many years of expenses you bank for every year you work.";

const baseMetadata: Metadata = {
  title: "Savings Rate Calculator",
  description: DESC,
  keywords: [
    "savings rate calculator",
    "personal savings rate",
    "how much should I save",
    "savings rate formula",
    "income saved percentage",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Savings Rate Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Savings Rate Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a savings rate?",
    answer:
      "Your savings rate is the share of your income that you keep rather than spend. The tool takes the money you set aside each month, including any extra savings, and divides it by your income, then multiplies by one hundred to give a percentage.",
  },
  {
    question: "Should I use gross or take-home income?",
    answer:
      "Either works as long as you are consistent. Take-home pay gives a clearer picture of the cash you actually control, while gross income produces a lower rate but lines up with figures often quoted in studies. Pick one and compare yourself against it over time.",
  },
  {
    question: "What counts as a good savings rate?",
    answer:
      "Many planners suggest aiming for fifteen to twenty percent of income, though the right number depends on your goals and timeline. The key insight is that a higher rate both builds savings faster and trims the spending you need to cover, so it helps from both directions.",
  },
  {
    question: "What does years of expenses saved per year mean?",
    answer:
      "It is your annual savings divided by your annual spending. If you save as much as you spend in a year, you bank one year of expenses for every year you work, a simple way to gauge how quickly your savings could one day replace your paycheck.",
  },
];

export default async function SavingsRateCalculatorPage() {
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
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Savings Rate Calculator",
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
      title="Savings Rate Calculator"
      intro="Find out what share of your pay you actually keep. Enter your monthly income, expenses and any extra you save, then press Calculate to see your personal savings rate."
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
            { name: "Savings Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Savings Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SavingsRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the savings rate calculator works</H2>
            <P>
              The math is refreshingly simple: take everything you save in a month, divide it by what
              you earn, and express it as a percentage. The tool adds the gap between income and
              expenses to any extra savings you list, such as an employer match, so the rate captures
              every dollar that does not get spent, not just what sits in your checking account.
            </P>
            <P>
              The donut splits your income into the slice you keep and the slice you spend. Below it
              the tool also reports how many years of expenses you save for each year you work, a
              quiet but powerful measure of momentum.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you take home $5,000 a month, spend $3,500, and stash an extra $400 through a
              workplace plan. You save $1,900 a month, which is 38% of your income. At that pace you
              bank a little over half a year of expenses for every year you work.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A single month can be lumpy, so average over a few months for a number you can trust.
              Lowering expenses lifts the rate twice over, since it raises what you save and lowers
              what you must replace later. For context on how saving builds long-term security, see{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB consumer tools</a>.
              To turn your monthly savings into a long-run balance, use our{" "}
              <Link href="/calculators/savings-calculator" className="text-orange-600 underline">savings calculator</Link>.
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
