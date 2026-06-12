import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TermLifeInsuranceCalculator from "./TermLifeInsuranceCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/term-life-insurance-calculator";
const SELF_SLUG = "term-life-insurance-calculator";

const DESC =
  "Free term life insurance calculator. Estimate how much coverage your household needs with the DIME method — debt, income, mortgage and education — then subtract your existing savings and life cover to find the gap.";

const baseMetadata: Metadata = {
  title: "Term Life Insurance Calculator",
  description: DESC,
  keywords: [
    "term life insurance calculator",
    "life insurance coverage calculator",
    "DIME method calculator",
    "how much life insurance do I need",
    "life insurance needs estimator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Term Life Insurance Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Term Life Insurance Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What is the DIME method?",
    answer:
      "DIME stands for Debt, Income, Mortgage and Education — the four buckets a life insurance payout typically has to cover. You add up non-mortgage debts, the income your family would need to replace for a set number of years, the remaining mortgage balance, and future obligations such as your children's education, then subtract savings and any cover you already hold. The result is a practical estimate of how much term life insurance to buy.",
  },
  {
    question: "How many years of income should I replace?",
    answer:
      "There is no single rule. A common starting point is the number of years until your youngest child becomes financially independent, or until your partner reaches retirement. Ten to fifteen years is a frequent choice for households with young children, while families with grown children may need fewer. Adjust the years input and watch how the recommended coverage changes.",
  },
  {
    question: "What is the difference between term and whole life insurance?",
    answer:
      "Term life covers you for a fixed period — often 10, 20 or 30 years — and pays out only if you die during that term, which keeps premiums low. Whole life lasts for your entire life and builds a cash value, but costs several times more for the same death benefit. For replacing income while children are at home and a mortgage is being paid, term life is usually the cheaper and simpler fit.",
  },
  {
    question: "Why subtract existing savings and life cover?",
    answer:
      "Money your family already has — emergency savings, investments, a workplace group life policy — reduces the gap a new policy needs to fill. Subtracting it avoids over-insuring and paying for coverage you do not need. Remember that employer group cover often ends when you leave the job, so weigh how dependable it is before counting on it.",
  },
];

export default async function TermLifeInsuranceCalculatorPage() {
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
    "🛡️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Term Life Insurance Calculator",
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
      title="Term Life Insurance Calculator"
      intro="Work out how much term life insurance your household needs. Enter your income, debts, mortgage, future obligations and existing savings, then press Calculate to see a recommended coverage figure built with the DIME method."
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
            { name: "Term Life Insurance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Term Life Insurance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TermLifeInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the DIME method works</H2>
            <P>
              The DIME method is a straightforward way to size a life insurance policy around what your
              family would actually have to pay for if you were gone. The letters stand for Debt, Income,
              Mortgage and Education. You total your non-mortgage debts, the income your household would
              need to replace for a chosen number of years, the balance left on your mortgage, and large
              future obligations such as your children's college costs. This calculator also adds a line
              for final expenses — funeral and end-of-life costs — which routinely run into five figures.
            </P>
            <P>
              From that total you subtract the money already standing behind your family: emergency savings,
              investments and any life cover you hold, including a group policy through work. What remains is
              the coverage gap — the amount of new term life insurance that would let your dependents clear
              the debts, stay in the home and keep the same standard of living for the years that matter most.
            </P>

            <H2>A worked example</H2>
            <P>
              Take a household earning $60,000 a year that wants to replace ten years of income. Income
              replacement alone is $600,000. Add $15,000 of credit-card and car debt, a $220,000 mortgage,
              $100,000 set aside for the children's education, and $15,000 for final expenses, and the
              obligations come to $350,000. Together that is $950,000 of need.
            </P>
            <P>
              Now subtract $50,000 already held in savings and existing cover, and the recommended coverage
              lands at roughly $900,000. Change any single input — fewer years of income, a smaller mortgage,
              more savings — and the headline figure updates immediately, so you can see exactly which part
              of your finances is driving the number.
            </P>

            <H2>Term versus whole life insurance</H2>
            <P>
              Term life insurance covers a fixed period, commonly 10, 20 or 30 years, and pays a death benefit
              only if you die within that window. Because it has no investment component, premiums are low,
              which is why term is the usual choice for covering temporary but heavy responsibilities — a
              mortgage and children at home. Whole life, by contrast, lasts your whole life and builds a cash
              value, but the same death benefit can cost five to ten times as much.
            </P>
            <P>
              The DIME figure here points to how much term cover would fill your gap. If you want to protect
              against living risks too, you can pair it with our{" "}
              <Link href="/calculators/disability-insurance-calculator" className="text-orange-600 underline">disability insurance calculator</Link>{" "}
              and our{" "}
              <Link href="/calculators/critical-illness-calculator" className="text-orange-600 underline">critical illness calculator</Link>,
              which size cover for the income you would lose if illness or injury kept you from working rather
              than if you died.
            </P>
            <p className="mb-4 text-sm leading-7 text-zinc-500">
              This calculator is an educational estimate, not financial advice. Your actual needs depend on
              your full circumstances, and a licensed insurance professional can help you confirm the right
              amount and policy type.
            </p>

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
