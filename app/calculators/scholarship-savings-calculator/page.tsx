import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import ScholarshipSavingsCalculator from "./ScholarshipSavingsCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/scholarship-savings-calculator";
const SELF_SLUG = "scholarship-savings-calculator";

const DESC =
  "Free scholarship savings calculator. See how much of a future college bill your savings plus scholarships will cover, with an inflation-adjusted cost target and a funding chart.";

const baseMetadata: Metadata = {
  title: "Scholarship Savings Calculator",
  description: DESC,
  keywords: [
    "scholarship savings calculator",
    "college savings calculator",
    "education funding gap",
    "tuition savings goal",
    "scholarship coverage estimate",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Scholarship Savings Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Scholarship Savings Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does this calculator decide if I am on track?",
    answer:
      "It grows your current balance and monthly deposits to the year college begins, then inflates today's annual cost across every year of study to get the full bill. After subtracting the share you expect from scholarships and grants, whatever your savings cannot cover is shown as the shortfall.",
  },
  {
    question: "Should I really count on scholarship money in advance?",
    answer:
      "Treat the scholarship percentage as a planning estimate, not a guarantee. Most awards are decided in the senior year and many renew only if grades hold. A safer approach is to model a lower scholarship share, fund the larger shortfall, and treat any extra award as a bonus that frees up cash later.",
  },
  {
    question: "Why does the cost keep rising even while my child is enrolled?",
    answer:
      "College prices have historically climbed faster than general inflation, and they do not freeze on the first day of class. The tool inflates each year of attendance separately, so the senior-year bill is larger than the freshman-year bill, which is why the total cost looks higher than four times today's price.",
  },
  {
    question: "What return rate should I assume on the savings?",
    answer:
      "It depends on how far away college is and how much risk you can take. A horizon of ten years or more can support a higher assumed return because there is time to ride out market swings, while money needed within a couple of years usually belongs somewhere safer with a low single-digit return.",
  },
];

export default async function ScholarshipSavingsCalculatorPage() {
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
    "🎓"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Scholarship Savings Calculator",
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
      title="Scholarship Savings Calculator"
      intro="See whether your college fund is on track. Enter your savings, monthly deposits, a return, the future cost of attendance and how much you expect from scholarships, then press Calculate to find the funding gap."
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
            { name: "Scholarship Savings Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Scholarship Savings Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScholarshipSavingsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the scholarship savings calculator works</H2>
            <P>
              The tool runs two timelines at once. On one side it compounds your current balance and
              monthly deposits up to the year your child starts college. On the other it takes today's
              cost of attendance and inflates it forward, year by year, across the whole degree. The
              difference between what you will have saved and what the inflated bill demands, after the
              slice you expect scholarships and grants to cover, is the shortfall you need a plan for.
            </P>
            <P>
              The chart makes the race visible. The shaded area is your savings climbing over time, the
              dashed grey line is the cash you actually deposited, and the red line marks the net cost
              your savings are trying to reach. When the savings line clears the red line, the plan is
              fully funded.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you have 5,000 dollars saved, add 300 dollars a month at a 6 percent return, and
              college is 10 years away. Today's cost is 28,000 dollars a year, rising 5 percent
              annually, for a four-year degree, and you expect scholarships to cover 30 percent. The
              full inflated bill lands near 200,000 dollars, scholarships trim it to roughly 140,000
              dollars net, and your fund grows to about 60,000 dollars, leaving a clear gap to close
              with extra deposits, work-study or loans.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Funded does not mean finished. Aid packages can shift, returns are never guaranteed, and a
              gap year or graduate school changes everything. Before you lean on any one number, compare
              real prices using the U.S. Department of Education{" "}
              <a href="https://collegescorecard.ed.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">College Scorecard</a>.
              To stress-test the return side on its own, try our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
