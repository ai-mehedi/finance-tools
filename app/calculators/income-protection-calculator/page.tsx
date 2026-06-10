import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import IncomeProtectionCalculator from "./IncomeProtectionCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/income-protection-calculator";
const SELF_SLUG = "income-protection-calculator";

const DESC =
  "Free income protection calculator. Work out the monthly benefit you need if illness or injury stops you working, allow for existing cover and a waiting period, and see total payouts to retirement.";

export const metadata: Metadata = {
  title: "Income Protection Calculator",
  description: DESC,
  keywords: [
    "income protection calculator",
    "income protection insurance",
    "disability income cover",
    "monthly benefit calculator",
    "how much income protection do I need",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Income Protection Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Income Protection Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is income protection insurance?",
    answer:
      "Income protection insurance pays you a regular monthly benefit if illness or injury stops you from working. Unlike a one-off lump sum, it replaces part of your salary on an ongoing basis, usually until you recover, return to work, or reach the end of the policy term, helping you keep up with everyday bills while you cannot earn.",
  },
  {
    question: "How much income protection do I need?",
    answer:
      "A common approach is to insure enough to cover your essential monthly costs, while staying within the limit insurers allow. Most providers cap cover at around 65% of your gross income, because paying close to your full salary would remove the incentive to return to work. This calculator targets your chosen replacement percentage and trims it to that cap.",
  },
  {
    question: "What is a waiting period?",
    answer:
      "The waiting period, also called the deferred period, is the time you must be unable to work before the benefit starts paying. Common choices range from a few weeks to several months. A longer waiting period lowers the premium because the insurer pays out less often, so it suits people with savings or sick pay that can bridge the early weeks.",
  },
  {
    question: "Does the benefit get taxed?",
    answer:
      "It depends on who paid the premiums and the rules where you live. Personal policies paid from after-tax income often pay a tax-free benefit, while employer-paid or salary-deducted cover may be taxable. Because the treatment varies, confirm the position for your own situation with a qualified adviser before relying on the headline figure.",
  },
];

export default async function IncomeProtectionCalculatorPage() {
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
    "🩺"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Income Protection Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Income Protection Calculator"
      intro="Find the monthly benefit that would keep your bills paid if you could not work. Enter your income, costs and any existing cover, then press Calculate to size the gap."
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
            { name: "Income Protection Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Income Protection Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeProtectionCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the income protection calculator works</H2>
            <P>
              The tool starts from the share of your salary you want to replace and converts it to a
              monthly benefit. It then applies the cap most insurers use, around 65% of gross income,
              so the suggested figure is one you could realistically buy. Finally it compares that
              benefit with your essential monthly costs to show whether it would actually keep you
              afloat.
            </P>
            <P>
              The chart adds up the benefit you could receive year by year if a claim ran all the way
              to retirement. It is a reminder that income protection is about replacing many years of
              earnings, not just covering a short gap.
            </P>

            <H2>A quick example</H2>
            <P>
              Imagine you earn $75,000, want to replace 60% of it, and have $3,200 of essential costs
              each month. Sixty percent of your salary is $3,750 a month, which sits under the insurer
              cap, so the suggested benefit is $3,750 and comfortably covers your bills. If you held no
              existing cover, that is the full amount you would need to arrange.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Premiums depend on your age, job, health and the waiting period you choose, so a lower
              benefit or a longer wait can make cover far cheaper. Check whether your employer already
              provides any sick pay or group cover before buying more. For an overview of how
              disability and income cover fit into a wider plan, see{" "}
              <a href="https://www.investor.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Investor.gov</a>.
              To weigh up the lump-sum protection your family might need too, try our{" "}
              <Link href="/calculators/human-life-value-calculator" className="text-orange-600 underline">human life value calculator</Link>.
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>}
                    </div>
                  </Link>
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
                    <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
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
