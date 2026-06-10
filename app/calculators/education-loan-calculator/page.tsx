import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import EducationLoanCalculator from "./EducationLoanCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/education-loan-calculator";
const SELF_SLUG = "education-loan-calculator";

const DESC =
  "Free education loan EMI calculator. Estimate your monthly student loan payment, total interest and payoff with a balance chart over the loan term.";

const baseMetadata: Metadata = {
  title: "Education Loan EMI Calculator",
  description: DESC,
  keywords: [
    "education loan calculator",
    "education loan emi calculator",
    "student loan emi calculator",
    "study loan calculator",
    "education loan interest calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Education Loan EMI Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Education Loan EMI Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is the education loan EMI calculated?",
    answer:
      "The equated monthly installment uses EMI = P·r(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate and n is the number of monthly payments. The same payment is made every month, but the split between interest and principal shifts over time.",
  },
  {
    question: "Does interest build up during my studies?",
    answer:
      "Many education loans have a moratorium or grace period while you study, but interest often still accrues during that time. If it is not paid, it can be added to your balance when repayment starts, which increases your EMI. Check your loan terms carefully.",
  },
  {
    question: "Can I reduce the total interest I pay?",
    answer:
      "Yes. Paying interest during the study period, choosing a shorter term or making extra payments toward principal all lower the total interest. A shorter term raises the monthly EMI but cuts the overall cost of the loan.",
  },
  {
    question: "Is education loan interest tax deductible?",
    answer:
      "In some countries a portion of student loan interest is tax deductible up to a limit. Rules change often and depend on income, so confirm the current details with an official tax authority or a qualified tax adviser before relying on a deduction.",
  },
];

export default async function EducationLoanCalculatorPage() {
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
    name: "Education Loan EMI Calculator",
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
      title="Education Loan EMI Calculator"
      intro="Estimate your monthly education loan payment and total interest, and see how the balance falls over the loan term. Enter your numbers and press Calculate."
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
            { name: "Education Loan EMI Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Education Loan EMI Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EducationLoanCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the education loan calculator works</H2>
            <P>
              Your education loan is repaid in equal monthly installments, or EMIs. Each EMI covers the
              interest charged that month plus a slice of the principal. Early payments are mostly
              interest, so the balance falls slowly at first and faster later, which is why the chart
              above curves downward.
            </P>
            <P>
              Three inputs drive the result: the loan amount, the annual interest rate and the term in
              years. A lower rate or a shorter term reduces the total interest you pay, while a longer
              term lowers the monthly EMI but raises the lifetime cost of the loan.
            </P>

            <H2>A quick example</H2>
            <P>
              Borrow $40,000 at 7% over 10 years. The monthly EMI is about $464, and you repay roughly
              $55,750 in total, of which around $15,750 is interest. Repaying over 8 years instead would
              raise the EMI but cut the total interest noticeably.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate. Your real rate and any grace period depend on the lender and the
              type of loan. For official guidance on student borrowing in the United States, see{" "}
              <a href="https://studentaid.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Federal Student Aid</a>.
              You can also compare repayment plans with our{" "}
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
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
