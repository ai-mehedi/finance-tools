import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import HealthInsuranceCalculator from "./HealthInsuranceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/health-insurance-calculator";
const SELF_SLUG = "health-insurance-calculator";

const DESC =
  "Free health insurance premium calculator. Estimate your monthly and annual premium from age, plan tier, area cost, tobacco use and dependents, with a chart showing how the premium climbs as you get older.";

const baseMetadata: Metadata = {
  title: "Health Insurance Premium Calculator",
  description: DESC,
  keywords: [
    "health insurance calculator",
    "health insurance premium estimator",
    "monthly premium calculator",
    "age rating premium",
    "family health plan cost",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Health Insurance Premium Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Health Insurance Premium Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is a health insurance premium calculated?",
    answer:
      "Insurers start from a benchmark rate for a young adult and multiply it by an age factor, the richness of the plan tier, and the cost of medical care in your area. Tobacco use and adding family members raise the figure further. This tool applies the same chain of multipliers to estimate your monthly cost.",
  },
  {
    question: "Why does the premium go up so much with age?",
    answer:
      "Older people use more medical care on average, so most markets allow premiums to rise with age up to a cap of roughly three times the rate charged to a 21-year-old. The bar chart shows that climb across five-year age bands so you can see what to expect later.",
  },
  {
    question: "What does the plan tier change?",
    answer:
      "A higher tier such as gold or platinum pays a larger share of your medical bills, so its premium is higher while your out-of-pocket costs at the doctor are lower. A bronze plan has the cheapest premium but the largest deductible. Pick the tier that matches how often you expect to need care.",
  },
  {
    question: "Is the estimate the price I will actually pay?",
    answer:
      "Treat it as a planning estimate, not a quote. Real premiums depend on the specific insurer, the exact plan, and any subsidies or employer contributions you qualify for. Always confirm the final price on an official marketplace or directly with the insurer before enrolling.",
  },
];

export default async function HealthInsuranceCalculatorPage() {
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
    "🏥"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Health Insurance Premium Calculator",
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
      title="Health Insurance Premium Calculator"
      intro="Estimate what a health plan might cost you each month. Enter your age, plan tier, area, tobacco use and dependents, then press Calculate to see the premium and how it changes as you age."
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
            { name: "Health Insurance Premium Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Health Insurance Premium Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HealthInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the premium estimate works</H2>
            <P>
              Health insurers rarely quote a single flat price. Instead they take a benchmark rate
              for a young adult and scale it up with a series of multipliers: how old you are, how
              generous the plan tier is, and how expensive medical care is in your region. This
              calculator chains those same factors together, then adds a surcharge for tobacco use
              and a share of the premium for each dependent on the policy.
            </P>
            <P>
              The bar chart is the part worth studying. It plots the primary member premium across
              five-year age bands so you can see the trend rather than a single number. Most people
              are surprised by how steep the curve becomes in their fifties and sixties.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose a 35-year-old non-smoker picks a silver plan in an average-cost area with a
              benchmark rate of 300 dollars and no dependents. The age factor at 35 is a little above
              one, silver leaves the rate unchanged, and the area is neutral, so the monthly premium
              lands near 400 dollars, or roughly 4,800 dollars a year. Switching to gold or adding a
              spouse would push both numbers noticeably higher.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Subsidies, employer contributions and provider networks all move the real price, so use
              this as a starting point rather than a binding quote. For plain-language guidance on
              choosing coverage, see{" "}
              <a href="https://www.healthcare.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">HealthCare.gov</a>.
              If you want to plan the savings that cover deductibles and copays, try our{" "}
              <Link href="/calculators/high-yield-savings-calculator" className="text-orange-600 underline">high yield savings calculator</Link>.
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
