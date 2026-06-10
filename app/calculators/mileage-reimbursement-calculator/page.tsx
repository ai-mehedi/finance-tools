import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import MileageReimbursementCalculator from "./MileageReimbursementCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/mileage-reimbursement-calculator";
const SELF_SLUG = "mileage-reimbursement-calculator";

const DESC =
  "Free mileage reimbursement calculator. Multiply miles driven by the IRS standard rate or a custom cents-per-mile figure, add parking and tolls, and see the exact dollar amount you are owed.";

export const metadata: Metadata = {
  title: "Mileage Reimbursement Calculator",
  description: DESC,
  keywords: [
    "mileage reimbursement calculator",
    "IRS mileage rate calculator",
    "cents per mile calculator",
    "business mileage calculator",
    "gas mileage reimbursement",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Mileage Reimbursement Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Mileage Reimbursement Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is mileage reimbursement calculated?",
    answer:
      "Multiply the miles you drove by the rate per mile, then add any reimbursable parking and tolls. For example, 120 miles times 67 cents a mile equals 80 dollars and 40 cents. This tool does the arithmetic and shows an effective rate per mile once extras are included.",
  },
  {
    question: "What is the IRS standard mileage rate?",
    answer:
      "The standard rate is a per-mile figure the IRS sets each year to cover the average cost of operating a vehicle, including fuel, maintenance, and depreciation. For 2024 it is 67 cents a mile for business, 21 cents for medical or moving, and 14 cents for charity driving.",
  },
  {
    question: "Can I claim parking and tolls on top of mileage?",
    answer:
      "Yes. Parking fees and tolls are separate out-of-pocket costs and can be reimbursed in addition to the per-mile amount. They are not baked into the standard rate, which only covers the cost of operating the vehicle itself.",
  },
  {
    question: "Should I use the standard rate or actual expenses?",
    answer:
      "The standard rate is simpler because you only track miles. The actual expense method totals real fuel, insurance, and repair costs multiplied by your business-use percentage, which can be larger for expensive vehicles but requires far more record keeping.",
  },
];

export default async function MileageReimbursementCalculatorPage() {
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
    "🚗"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mileage Reimbursement Calculator",
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
      title="Mileage Reimbursement Calculator"
      intro="Work out exactly what you are owed for driving. Enter your miles, pick the IRS rate or set a custom one, add parking and tolls, then press Calculate."
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
            { name: "Mileage Reimbursement Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Mileage Reimbursement Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MileageReimbursementCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the mileage reimbursement calculator works</H2>
            <P>
              Reimbursement is built from two pieces. The first is mileage: the distance you drove
              multiplied by a rate in cents per mile. The second is direct costs like parking and
              tolls, which sit on top of the per-mile amount. The tool multiplies miles by trips so
              you can total a recurring commute or several identical client visits in one go.
            </P>
            <P>
              The chart breaks the payout into its parts so you can see how much comes from distance
              and how much from extras. Picking a preset fills in the current IRS figure, while
              typing your own number switches the tool to a custom rate, handy when an employer pays
              a flat amount that differs from the federal standard.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you make ten 24-mile round trips to a job site in a month and pay 4 dollars in
              tolls each time. At the 2024 business rate of 67 cents, the 240 miles earn 160 dollars
              and 80 cents, and the 40 dollars of tolls bring the total to 200 dollars and 80 cents.
              The blended payout works out to about 84 cents per mile once tolls are folded in.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Keep a contemporaneous log of dates, destinations, and odometer readings, because the
              IRS expects records to back up a deduction. The official rates and rules live at{" "}
              <a href="https://www.irs.gov/tax-professionals/standard-mileage-rates" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS.gov</a>.
              If you are weighing the cost of the drive itself, our{" "}
              <Link href="/calculators/gas-cost-calculator" className="text-orange-600 underline">gas cost calculator</Link>{" "}
              estimates the fuel side of the trip.
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
