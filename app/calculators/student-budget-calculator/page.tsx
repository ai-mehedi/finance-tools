import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StudentBudgetCalculator from "./StudentBudgetCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/student-budget-calculator";
const SELF_SLUG = "student-budget-calculator";

const DESC =
  "Free student budget calculator. Add up your monthly income from jobs, financial aid and family, subtract rent, food, transport and tuition, and see your surplus or shortfall with a spending breakdown.";

const baseMetadata: Metadata = {
  title: "Student Budget Calculator",
  description: DESC,
  keywords: [
    "student budget calculator",
    "college budget planner",
    "monthly student budget",
    "student spending tracker",
    "budget for students",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Student Budget Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Student Budget Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How do I build a student budget?",
    answer:
      "List every source of money you receive in a month, including pay from a job, the monthly share of any financial aid, and help from family. Then list everything you spend on, from rent to coffee. Subtract spending from income to see whether you finish the month ahead or behind.",
  },
  {
    question: "Should I count financial aid as monthly income?",
    answer:
      "Aid usually arrives once or twice a year, so divide the amount you can spend on living costs by the number of months it needs to cover. Entering that monthly share keeps the budget realistic instead of making one month look rich and the rest look broke.",
  },
  {
    question: "What is a healthy savings rate for a student?",
    answer:
      "Any positive number means you are living within your means, which is the main goal while studying. If you can keep even five to ten percent of your income unspent, you build a small cushion for emergencies like a broken laptop or a surprise lab fee.",
  },
  {
    question: "What if my budget shows a shortfall?",
    answer:
      "A shortfall means you plan to spend more than you bring in. Look first at your largest category, which the tool highlights, then trim flexible costs like eating out or subscriptions, or raise income with more work hours before you lean on credit.",
  },
];

export default async function StudentBudgetCalculatorPage() {
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
    name: "Student Budget Calculator",
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
      title="Student Budget Calculator"
      intro="See exactly where your money goes each month at college. Enter what you earn from work, aid and family, list your living costs, then press Calculate to find your surplus or shortfall."
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
            { name: "Student Budget Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Student Budget Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentBudgetCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the student budget calculator works</H2>
            <P>
              The tool sums two things: the money flowing in each month and the money flowing out.
              Income covers wages, the monthly share of any grants or loans, and help from family.
              Expenses cover the fixed costs you cannot skip, like rent, and the flexible ones you
              can, like eating out. The difference is your monthly surplus or shortfall.
            </P>
            <P>
              The donut chart turns your spending into proportions, so a number that felt small in
              dollars can suddenly look large as a slice. The tool also flags your single biggest
              cost, which is usually the most useful place to start if you need to cut back.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn 700 dollars from a campus job, draw 900 dollars a month from aid, and
              receive 300 dollars from home, for 1,900 dollars of income. Your costs add up to 1,810
              dollars, leaving a 90 dollar surplus and a savings rate of roughly five percent. Housing
              is the largest slice at 650 dollars, so a cheaper room or a roommate would move the
              needle most.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Budgets only work when they reflect real spending, so track a typical month before you
              trust the numbers. For free worksheets and guidance written for students, see the{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB education hub</a>.
              Once you know what you can set aside, our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              shows what small monthly amounts could grow into.
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
