import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SeverancePayCalculator from "./SeverancePayCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/severance-pay-calculator";
const SELF_SLUG = "severance-pay-calculator";

const DESC =
  "Free severance pay calculator. Estimate a lump-sum severance package from your salary, years of service and weeks of pay per year, plus unused PTO and any extra bonus.";

const baseMetadata: Metadata = {
  title: "Severance Pay Calculator",
  description: DESC,
  keywords: [
    "severance pay calculator",
    "severance package estimate",
    "weeks of pay per year",
    "layoff pay calculator",
    "severance and unused PTO",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Severance Pay Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Severance Pay Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is severance pay usually calculated?",
    answer:
      "A common formula is weekly pay times a set number of weeks per year of service. This tool divides your annual salary by 52 to get weekly pay, multiplies that by the weeks granted for each year you worked, and then adds any unused paid-time-off payout and extra bonus.",
  },
  {
    question: "What does the cap on weeks do?",
    answer:
      "Many employers limit total severance to a maximum number of weeks no matter how long you stayed. Enter that ceiling in the cap field and the calculator will stop adding weeks once you reach it. Set the cap to zero to remove the limit entirely.",
  },
  {
    question: "Is severance pay taxed?",
    answer:
      "Yes. In the United States severance is treated as supplemental wages, so income tax plus Social Security and Medicare are withheld. This estimate is a gross figure before taxes, so your take-home amount will be lower than the headline number shown.",
  },
  {
    question: "Are employers required to pay severance?",
    answer:
      "In most cases no federal law forces an employer to offer severance. It usually comes from a company policy, an employment contract, or a negotiated separation agreement. Always read the agreement carefully before signing, since accepting often waives your right to sue.",
  },
];

export default async function SeverancePayCalculatorPage() {
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
    "📄"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Severance Pay Calculator",
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
      title="Severance Pay Calculator"
      intro="Estimate the lump sum you could receive in a layoff or separation. Enter your salary, years of service and the weeks of pay granted per year, then press Calculate."
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
            { name: "Severance Pay Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Severance Pay Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SeverancePayCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the severance pay calculator works</H2>
            <P>
              Severance packages are almost always built on a simple unit: one week of your pay.
              The tool converts your annual salary into a weekly figure by dividing by 52, then
              multiplies that by the number of weeks your employer grants for every year you served.
              On top of that base it adds the value of any unused paid time off and a flat bonus.
            </P>
            <P>
              The chart shows how the base payout would have grown with each additional year of
              tenure, which makes it easy to see the effect of a cap. Once your service crosses the
              cap, the bars stop rising because the package has hit its ceiling.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn $78,000 a year, stayed eight years, and your employer offers two weeks
              of pay per year of service with a 26-week cap. Eight years times two is 16 weeks, which
              is under the cap, so your base is 16 times $1,500, or $24,000. Add ten unused PTO days
              worth about $3,000 and the package comes to roughly $27,000 before tax.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a planning estimate, not legal advice, and the final number depends entirely on
              your separation agreement. For your rights around mass layoffs and notice periods, see
              the U.S. Department of Labor guidance on the{" "}
              <a href="https://www.dol.gov/general/topic/termination/plantclosings" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">WARN Act</a>.
              To plan how long the payout might last while you job hunt, try our{" "}
              <Link href="/calculators/savings-goal-calculator" className="text-orange-600 underline">savings goal calculator</Link>.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-orange-600">{a.title}</p>
                    {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{a.excerpt}</p>}
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
