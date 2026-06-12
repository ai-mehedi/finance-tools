import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LineOfCreditCalculator from "./LineOfCreditCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/line-of-credit-calculator";
const SELF_SLUG = "line-of-credit-calculator";

const DESC =
  "Free line of credit calculator. Enter your drawn balance, interest rate and fixed monthly payment to see how long payoff takes, the total interest you will pay, and a balance chart over time.";

const baseMetadata: Metadata = {
  title: "Line of Credit Calculator",
  description: DESC,
  keywords: [
    "line of credit calculator",
    "HELOC payoff calculator",
    "revolving credit calculator",
    "credit line interest",
    "line of credit payment",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Line of Credit Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Line of Credit Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does a line of credit differ from a regular loan?",
    answer:
      "A line of credit is revolving, so you draw what you need up to a limit and interest accrues only on the balance you owe. A term loan hands you a fixed lump sum and a set payment. This tool models the payoff of whatever balance you currently have drawn against the line.",
  },
  {
    question: "How is the interest on a line of credit calculated?",
    answer:
      "Interest is charged on the outstanding balance, usually monthly. Each month the balance is multiplied by the annual rate divided by twelve. Your payment first covers that interest, and whatever is left over reduces the principal, so the interest portion shrinks as the balance falls.",
  },
  {
    question: "Why does the calculator say my payment is too low?",
    answer:
      "If your fixed monthly payment is not larger than the first month of interest, none of it reaches the principal and the balance never falls. The tool flags this and shows the first month interest so you know the floor your payment must clear to make real progress.",
  },
  {
    question: "Will paying more each month save me money?",
    answer:
      "Yes, and often a lot. Because interest is charged on the remaining balance, a higher payment clears the principal faster, which means fewer months of interest. Even a modest increase above the minimum can cut both the payoff time and the total interest noticeably.",
  },
];

export default async function LineOfCreditCalculatorPage() {
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
    "💳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Line of Credit Calculator",
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
      title="Line of Credit Calculator"
      intro="See how long it takes to clear a line of credit. Enter your drawn balance, the interest rate and the fixed payment you plan to make, then press Calculate to get your payoff time and total interest."
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
            { name: "Line of Credit Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Line of Credit Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineOfCreditCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the line of credit calculator works</H2>
            <P>
              The tool simulates your line month by month. It starts with the balance you have drawn,
              charges one month of interest at the annual rate divided by twelve, and subtracts your
              fixed payment. Whatever the payment covers beyond the interest reduces the principal,
              and the cycle repeats until the balance reaches zero.
            </P>
            <P>
              Because the interest is recalculated on a shrinking balance, your early payments are
              mostly interest while later ones are mostly principal. The balance chart makes that
              curve visible, dropping slowly at first and then faster as the principal melts away.
            </P>

            <H2>A worked example</H2>
            <P>
              Imagine you owe 25,000 dollars on a line at 9.5 percent and pay 600 dollars a month. The
              first month of interest is about 198 dollars, so roughly 402 dollars goes to principal.
              Holding that 600 dollar payment steady, the balance clears in a little under four and a
              half years, with several thousand dollars of total interest along the way.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Many lines of credit carry variable rates, so a rate change will move your real payoff
              date away from this estimate. Treat the result as a snapshot at today's rate and rerun
              it whenever the rate shifts. For background on how these accounts work, the{" "}
              <a href="https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-line-of-credit-heloc-en-247/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB guide to lines of credit</a>{" "}
              is a neutral starting point. If you instead have a fixed installment loan, our{" "}
              <Link href="/calculators/loan-calculator" className="text-orange-600 underline">loan calculator</Link> is a better fit.
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
