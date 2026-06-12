import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import LoanForgivenessCalculator from "./LoanForgivenessCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/loan-forgiveness-calculator";
const SELF_SLUG = "loan-forgiveness-calculator";

const DESC =
  "Free student loan forgiveness calculator. Estimate how much of your balance could be forgiven after a set number of qualifying payments under plans like PSLF or income-driven repayment.";

const baseMetadata: Metadata = {
  title: "Student Loan Forgiveness Calculator",
  description: DESC,
  keywords: [
    "loan forgiveness calculator",
    "student loan forgiveness calculator",
    "PSLF calculator",
    "income driven repayment forgiveness",
    "loan forgiveness estimate",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Student Loan Forgiveness Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Student Loan Forgiveness Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How does student loan forgiveness work?",
    answer:
      "Certain plans cancel whatever balance is left after you make a required number of qualifying monthly payments. Public Service Loan Forgiveness needs 120 payments, while income-driven plans typically run 240 or 300. Until you hit that mark you keep paying, and only the remainder is forgiven.",
  },
  {
    question: "How does this calculator estimate the forgiven amount?",
    answer:
      "It applies your monthly payment to the balance month by month, letting interest accrue along the way, until it reaches the number of qualifying payments you chose. Whatever balance remains at that point is the estimated amount forgiven.",
  },
  {
    question: "Why does my result say nothing will be forgiven?",
    answer:
      "If your monthly payment is large enough to clear the loan before you reach the forgiveness mark, the balance hits zero first and there is nothing left to cancel. Lower payments on income-driven plans are what usually leave a balance for forgiveness.",
  },
  {
    question: "Is forgiven student loan debt taxed?",
    answer:
      "It depends on the program and current law. Public Service Loan Forgiveness is generally tax free at the federal level, while forgiveness under some income-driven plans can be treated as income. Always confirm the latest rules with an official source before planning around it.",
  },
];

export default async function LoanForgivenessCalculatorPage() {
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
    "🤝"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Student Loan Forgiveness Calculator",
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
      title="Student Loan Forgiveness Calculator"
      intro="See how much of your student loan could be wiped out after years of qualifying payments. Enter your balance, rate, payment and plan length, then press Calculate."
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
            { name: "Student Loan Forgiveness Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Student Loan Forgiveness Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoanForgivenessCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the loan forgiveness calculator works</H2>
            <P>
              Forgiveness is a finish line measured in payments, not in dollars. The tool runs your
              monthly payment against the balance for the number of qualifying months your plan
              requires, adding interest each month along the way. Whatever is still owed when you
              cross that line is the amount the program would cancel.
            </P>
            <P>
              The chart shows two things at once: the orange area is your shrinking balance, and the
              dashed line is the total you have paid so far. When the balance line stays above zero at
              the end, the gap to zero is your forgiveness. When it touches zero early, the loan is
              simply paid off and nothing is forgiven.
            </P>

            <H2>A quick example</H2>
            <P>
              Picture a 45,000 dollar balance at 6 percent with a 280 dollar monthly payment under a
              120 payment PSLF track. That payment barely dents the principal, so after ten years you
              would have paid about 33,600 dollars yet still owe a large balance, all of which is
              forgiven. A much higher payment, by contrast, would clear the loan before forgiveness
              ever applied.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Eligibility rules, qualifying payment counts and tax treatment change often, so treat
              this as a planning estimate rather than a guarantee. Verify your status and program
              details at{" "}
              <a href="https://studentaid.gov/manage-loans/forgiveness-cancellation" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">StudentAid.gov forgiveness</a>.
              To model the underlying loan and its payments first, use our{" "}
              <Link href="/calculators/student-loan-calculator" className="text-orange-600 underline">student loan calculator</Link>.
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
