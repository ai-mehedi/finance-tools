import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BillingRateCalculator from "./BillingRateCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/billing-rate-calculator";
const SELF_SLUG = "billing-rate-calculator";

const DESC =
  "Free hourly billing rate calculator. Work out the rate to charge clients to hit your target income after business costs, time off and non-billable hours.";

export const metadata: Metadata = {
  title: "Hourly Billing Rate Calculator",
  description: DESC,
  keywords: [
    "billing rate calculator",
    "hourly rate calculator",
    "freelance rate calculator",
    "consulting rate calculator",
    "contractor hourly rate",
    "how much to charge per hour",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Hourly Billing Rate Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Hourly Billing Rate Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How do I work out my hourly billing rate?",
    answer:
      "Add the income you want to take home to your annual business costs, then divide by the number of billable hours you can actually sell in a year. Because not every working hour is billable, you charge more per billable hour to cover the gaps.",
  },
  {
    question: "Why is billable percentage so important?",
    answer:
      "Admin, marketing, invoicing and downtime are not billable, yet they fill real hours. If only 70 percent of your time is billable, you have far fewer paid hours to spread your costs across, so your rate has to rise to compensate.",
  },
  {
    question: "Should my rate include taxes?",
    answer:
      "Yes. Include self-employment and income taxes, plus retirement savings and health coverage, inside your business costs or target income. Freelancers who forget taxes often set rates that leave them short at the end of the year.",
  },
  {
    question: "Is the calculated rate a floor or a target?",
    answer:
      "Treat it as a floor. It is the minimum that keeps you solvent at your chosen workload. If demand is strong or your work is specialized, you can and should charge above it.",
  },
];

export default async function BillingRateCalculatorPage() {
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
    "💼"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hourly Billing Rate Calculator",
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
      title="Hourly Billing Rate Calculator"
      intro="Find the hourly rate you need to charge to hit your income goal after costs, time off and non-billable hours. Enter your numbers and press Calculate."
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
            { name: "Hourly Billing Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Hourly Billing Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BillingRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the billing rate is worked out</H2>
            <P>
              The rate starts from what you actually want to keep. Add the take-home income you are
              aiming for to your yearly business costs, such as software, equipment, insurance and the
              taxes you set aside. That total is the revenue your business has to bring in.
            </P>
            <P>
              Next, count the hours you can really sell. Take 52 weeks, subtract unpaid time off, then
              multiply the remaining weeks by your weekly hours and the share of those hours that are
              billable. Dividing revenue by those billable hours gives the rate you need per hour.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you want $80,000 take-home, have $15,000 of business costs, take 6 weeks off and
              work 40 hours a week with 70 percent billable. That leaves about 1,288 billable hours, so
              you need roughly $74 an hour, or about $590 for an eight hour day, just to hit the plan.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Your rate is a starting point, not a ceiling. Value, demand and specialism let you charge
              more. For broader pricing and small business guidance, the{" "}
              <a href="https://www.sba.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Small Business Administration</a>{" "}
              is a solid reference. Compare scenarios with our{" "}
              <Link href="/calculators" className="text-orange-600 underline">other free calculators</Link>.
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
