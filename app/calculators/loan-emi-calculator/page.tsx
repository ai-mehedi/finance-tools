import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanEmiCalculator from "./LoanEmiCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/loan-emi-calculator";
const SELF_SLUG = "loan-emi-calculator";

const DESC =
  "Free loan EMI calculator. Work out your monthly EMI, total interest and total payment for any loan, with a chart of how the balance falls over time.";

const baseMetadata: Metadata = {
  title: "Loan EMI Calculator",
  description: DESC,
  keywords: [
    "loan emi calculator",
    "emi calculator",
    "monthly emi calculator",
    "loan repayment calculator",
    "personal loan emi calculator",
    "loan interest calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Loan EMI Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Loan EMI Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is a loan EMI calculated?",
    answer:
      "EMI uses the formula EMI = P·r(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate divided by 12 and by 100) and n is the number of monthly payments. The result is a fixed amount you pay every month until the loan is cleared.",
  },
  {
    question: "What does EMI stand for?",
    answer:
      "EMI stands for Equated Monthly Installment. It is the fixed payment you make to the lender each month, covering both interest and a part of the principal. Early payments are mostly interest, while later payments are mostly principal.",
  },
  {
    question: "Does a longer tenure reduce my EMI?",
    answer:
      "Yes. Stretching the loan over more years lowers each monthly EMI because the principal is spread across more payments. The trade off is that you pay more total interest over the life of the loan, since the balance is outstanding for longer.",
  },
  {
    question: "How can I lower the total interest I pay?",
    answer:
      "You can lower total interest by choosing a shorter tenure, negotiating a lower rate, or making extra payments toward the principal when possible. Even small prepayments early in the loan reduce the balance that interest is charged on.",
  },
];

export default async function LoanEmiCalculatorPage() {
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
    name: "Loan EMI Calculator",
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
      title="Loan EMI Calculator"
      intro="Work out your monthly EMI, total interest and total payment for any loan, and see how the balance falls over time. Enter your numbers and press Calculate."
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
            { name: "Loan EMI Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Loan EMI Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanEmiCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan EMI calculator works</H2>
            <P>
              Your EMI is a single fixed amount that you pay every month until the loan is cleared.
              Part of each payment covers the interest charged on the outstanding balance, and the
              rest reduces the principal. Early on, most of the EMI goes to interest. As the balance
              falls, more of each payment goes to principal, which is why the balance chart above
              curves down slowly at first and faster later.
            </P>
            <P>
              The math behind it is the standard amortization formula. We multiply the principal by
              the monthly rate, scale it by how the interest compounds over the full term, and divide
              so the loan reaches zero on the final payment. The calculator amortizes the loan month
              by month to total the interest accurately.
            </P>

            <H2>A quick example</H2>
            <P>
              Borrow $200,000 at 9% over 15 years. The monthly EMI works out to roughly $2,029. Over
              the full term you repay about $365,000, which means around $165,000 of that is interest.
              Shorten the tenure to 10 years and the EMI rises, but the total interest you pay drops
              sharply.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate. Your actual rate depends on credit, lender and loan type, and some
              loans add fees that change the real cost. For consumer borrowing basics, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. You can also compare scenarios with our{" "}
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
