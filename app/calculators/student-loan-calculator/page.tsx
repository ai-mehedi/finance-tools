import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StudentLoanCalculator from "./StudentLoanCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/student-loan-calculator";
const SELF_SLUG = "student-loan-calculator";

const DESC =
  "Free student loan calculator. Estimate your monthly payment, total interest and full cost over the repayment term, including interest that accrues during a grace period and is capitalized.";

const baseMetadata: Metadata = {
  title: "Student Loan Calculator",
  description: DESC,
  keywords: [
    "student loan calculator",
    "student loan payment calculator",
    "student loan interest calculator",
    "education loan repayment",
    "student loan payoff",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Student Loan Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Student Loan Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is the monthly student loan payment calculated?",
    answer:
      "The tool spreads the balance evenly across the repayment term using a fixed payment, where each payment first covers the interest for that month and the rest reduces the principal. As the balance falls, less of every payment goes to interest and more goes to principal.",
  },
  {
    question: "What is a grace period and why does it matter?",
    answer:
      "A grace period is the stretch after you leave school before payments begin, often around six months. On unsubsidized loans interest still builds during this time, so a longer grace period means a larger balance once repayment starts.",
  },
  {
    question: "What does capitalizing interest mean?",
    answer:
      "Capitalizing means the interest that piled up during the grace period gets added to your principal. From then on you pay interest on that interest, which raises both the monthly payment and the total cost, so it is worth paying grace interest early if you can.",
  },
  {
    question: "How can I pay less interest on a student loan?",
    answer:
      "Pay more than the minimum so extra money goes straight to principal, make interest payments during the grace period to avoid capitalization, or choose a shorter term to cut the number of months interest can accrue. Refinancing to a lower rate can also help if you qualify.",
  },
];

export default async function StudentLoanCalculatorPage() {
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
    "🎓"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Student Loan Calculator",
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
      title="Student Loan Calculator"
      intro="Know what a student loan really costs before you sign. Enter the amount, rate, term and any grace period, then press Calculate to see your monthly payment and total interest."
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
            { name: "Student Loan Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Student Loan Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentLoanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the student loan calculator works</H2>
            <P>
              The tool first decides what you owe when repayment begins. If you set a grace period,
              interest accrues on the balance during those months. Choosing to capitalize folds that
              interest into the principal, so repayment starts from a larger figure. From there it
              builds a standard amortized payment that clears the loan exactly at the end of the term.
            </P>
            <P>
              The chart traces your remaining balance as it falls month after month. The curve is
              shallow at first because early payments are mostly interest, then it steepens as more of
              each payment chips away at the principal you still owe.
            </P>

            <H2>A quick example</H2>
            <P>
              Borrow 30,000 dollars at 6.5 percent over 10 years with a six month grace period and
              capitalized interest. Roughly 975 dollars of grace interest is added to the balance, the
              monthly payment lands near 350 dollars, and you repay close to 42,000 dollars in total.
              About 12,000 dollars of that is interest, which is the price of borrowing.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Federal loans offer protections and repayment options that private loans may not, so
              compare carefully before borrowing. The official starting point is{" "}
              <a href="https://studentaid.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">StudentAid.gov</a>.
              If a chunk of your balance might be written off after years of payments, try our{" "}
              <Link href="/calculators/loan-forgiveness-calculator" className="text-orange-600 underline">student loan forgiveness calculator</Link>.
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
