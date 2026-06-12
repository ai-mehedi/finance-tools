import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SwpCalculator from "./SwpCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/swp-calculator";
const SELF_SLUG = "swp-calculator";

const DESC =
  "Free SWP calculator. See how long an invested corpus lasts when you withdraw a fixed amount every month, while the remaining balance keeps earning a return, with a drawdown chart.";

const baseMetadata: Metadata = {
  title: "SWP Calculator",
  description: DESC,
  keywords: [
    "swp calculator",
    "systematic withdrawal plan calculator",
    "monthly withdrawal calculator",
    "retirement income calculator",
    "corpus drawdown calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "SWP Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "SWP Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a systematic withdrawal plan?",
    answer:
      "A systematic withdrawal plan, or SWP, lets you take a fixed amount out of an invested corpus at regular intervals, usually every month. The money you have not yet withdrawn stays invested and keeps earning a return, so the plan can pay you an income while the balance continues to work.",
  },
  {
    question: "Will my corpus ever run out with an SWP?",
    answer:
      "It depends on the balance between your withdrawal and your return. If each month's withdrawal is smaller than the growth the corpus earns, the balance can even rise over time. If you withdraw more than it earns, the corpus shrinks and eventually empties. This tool shows the exact month it would run dry.",
  },
  {
    question: "How is an SWP different from a fixed deposit payout?",
    answer:
      "A fixed deposit pays a guaranteed interest amount and returns your principal untouched. An SWP draws from a market linked corpus, so the income is not guaranteed and each withdrawal slowly consumes the principal unless growth keeps pace. In exchange an SWP can offer higher long term returns and more flexible amounts.",
  },
  {
    question: "Is the return in an SWP guaranteed?",
    answer:
      "No. The annual return you enter is an assumption used to model the plan. Real market returns vary year to year, so a year of poor returns early on can drain the corpus faster than a steady average suggests. Treat the result as a planning guide and review your withdrawal amount regularly.",
  },
];

export default async function SwpCalculatorPage() {
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
    "💸"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SWP Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="SWP Calculator"
      intro="Plan a steady income from your investments. Enter a corpus, a monthly withdrawal and an expected return, then press Calculate to see how the balance holds up and whether it lasts."
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
            { name: "SWP Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="SWP Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SwpCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the SWP calculator works</H2>
            <P>
              Each month the tool first applies your return to whatever balance remains, then removes
              your fixed withdrawal. The order matters: the corpus earns on its full balance before
              you take money out, which is how an SWP keeps the leftover capital productive. This
              repeats month after month for the horizon you set.
            </P>
            <P>
              The chart contrasts two lines. The shaded area is the corpus balance, which falls when
              withdrawals outpace growth, and the dashed line is the cumulative cash you have taken
              out. Where the balance line touches zero, your plan has been fully drawn down.
            </P>

            <H2>A quick example</H2>
            <P>
              Invest 10,00,000 at a 9 percent return and withdraw 8,000 a month for 15 years. Because
              the corpus earns roughly 7,500 in the first month against an 8,000 withdrawal, the
              balance dips only slightly at first, and compounding on the remainder keeps it
              comfortably positive for the whole stretch in this case.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              A constant return hides sequence risk: a bad stretch in the early years can empty a
              corpus that a steady average would have preserved. Build in a margin and revisit the
              plan often. For guidance on planning retirement income, see the{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/retirement/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB retirement resources</a>.
              To model building the corpus in the first place, try our{" "}
              <Link href="/calculators/stp-calculator" className="text-orange-600 underline">STP calculator</Link>.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40">
                    <span className="text-sm font-bold text-zinc-900 group-hover:text-orange-600">{a.title}</span>
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
