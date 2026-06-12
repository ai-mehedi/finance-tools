import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StudentLoanPayoffCalculator from "./StudentLoanPayoffCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/student-loan-payoff-calculator";
const SELF_SLUG = "student-loan-payoff-calculator";

const DESC =
  "Free student loan payoff calculator. See how fast you can clear your student debt, how much interest you will pay, and how a small extra payment each month shortens the term and saves interest.";

const baseMetadata: Metadata = {
  title: "Student Loan Payoff Calculator",
  description: DESC,
  keywords: [
    "student loan payoff calculator",
    "student loan early payoff",
    "extra payment calculator",
    "student debt calculator",
    "loan interest saved",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Student Loan Payoff Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Student Loan Payoff Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does paying extra each month help?",
    answer:
      "Every dollar above the scheduled payment goes straight to principal, so less balance is left to accrue interest the next month. That speeds up payoff and lowers total interest. Even a small recurring extra payment can shave months or years off the loan.",
  },
  {
    question: "Why does my early payment go mostly to interest?",
    answer:
      "Interest is charged on the outstanding balance, which is largest at the start. So early payments cover a big slice of interest and only chip away at principal. As the balance falls, more of each payment attacks principal, which is why extra payments early on are so powerful.",
  },
  {
    question: "Should I pay extra or invest the money?",
    answer:
      "Compare your loan rate with the after-tax return you expect from investing. If the loan rate is higher than that return, paying extra is the guaranteed win. If your rate is low and you have no emergency fund, building savings first is often the safer call.",
  },
  {
    question: "What if my payment does not cover the interest?",
    answer:
      "If a payment is smaller than one month of interest, the balance grows instead of shrinking and the loan never amortizes. The calculator flags this so you can raise the payment to a level that actually reduces what you owe.",
  },
];

export default async function StudentLoanPayoffCalculatorPage() {
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
    name: "Student Loan Payoff Calculator",
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
      title="Student Loan Payoff Calculator"
      intro="See how quickly you can become debt free. Enter your balance, rate and monthly payment, add an optional extra payment, then press Calculate to see your payoff date and interest saved."
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
            { name: "Student Loan Payoff Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Student Loan Payoff Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentLoanPayoffCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the student loan payoff calculator works</H2>
            <P>
              The tool walks through your loan one month at a time. Each month it charges interest on
              the balance, then applies your payment plus any extra to the principal. It repeats until
              the balance hits zero, counting the months and adding up every dollar of interest along
              the way.
            </P>
            <P>
              To show the payoff in context, it also runs a quiet second simulation using only your
              minimum payment. The difference between the two is the months and interest you save by
              committing to that extra amount each month.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you owe $30,000 at 6.5 percent and pay $350 a month. On the minimum alone the loan
              runs well over ten years. Add just $100 a month and you clear it years sooner while
              cutting thousands in interest, because that extra cash never gets the chance to compound
              against you.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Tell your servicer to apply extra payments to principal, not to push your due date
              forward, or the savings disappear. For your federal repayment options and forgiveness
              rules, check{" "}
              <a href="https://studentaid.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">StudentAid.gov</a>.
              If a lower rate is on the table, compare it with our{" "}
              <Link href="/calculators/student-loan-refinance-calculator" className="text-orange-600 underline">student loan refinance calculator</Link>.
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
