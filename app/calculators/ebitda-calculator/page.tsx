import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import EbitdaCalculator from "./EbitdaCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/ebitda-calculator";
const SELF_SLUG = "ebitda-calculator";

const DESC =
  "Free EBITDA calculator. Add back interest, taxes, depreciation and amortization to net income to find your EBITDA and EBITDA margin.";

const baseMetadata: Metadata = {
  title: "EBITDA Calculator",
  description: DESC,
  keywords: [
    "ebitda calculator",
    "ebitda formula",
    "ebitda margin calculator",
    "earnings before interest taxes depreciation amortization",
    "operating profit calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "EBITDA Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "EBITDA Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is EBITDA?",
    answer:
      "EBITDA stands for Earnings Before Interest, Taxes, Depreciation and Amortization. It measures a company's operating performance by stripping out financing decisions, tax environments and non-cash accounting charges, so businesses of different structures can be compared more fairly.",
  },
  {
    question: "How do you calculate EBITDA?",
    answer:
      "The add-back method starts from net income and adds back interest, taxes, depreciation and amortization. So EBITDA = Net income + Interest + Taxes + Depreciation + Amortization. You can also build it down from revenue by starting with operating profit and adding depreciation and amortization.",
  },
  {
    question: "What is a good EBITDA margin?",
    answer:
      "EBITDA margin is EBITDA divided by revenue. What counts as good varies widely by industry, but a higher margin generally signals stronger operating efficiency. Compare a company only against peers in the same sector, since capital intensive industries naturally run different margins.",
  },
  {
    question: "What are the limitations of EBITDA?",
    answer:
      "EBITDA ignores real costs like interest, taxes and the capital spending needed to replace equipment, so it can overstate how much cash a business actually generates. Use it alongside metrics like free cash flow and net income, not on its own.",
  },
];

export default async function EbitdaCalculatorPage() {
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
    "📊"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EBITDA Calculator",
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
      title="EBITDA Calculator"
      intro="Find your EBITDA by adding interest, taxes, depreciation and amortization back to net income, then see the EBITDA margin. Enter your numbers and press Calculate."
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
            { name: "EBITDA Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="EBITDA Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EbitdaCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the EBITDA calculator works</H2>
            <P>
              EBITDA is built using the add-back method. You start from net income, the bottom line
              after every expense, then add back the four items that EBITDA deliberately ignores:
              interest, taxes, depreciation and amortization. The result reflects how the core
              business performed before financing and accounting choices muddy the picture.
            </P>
            <P>
              Interest and taxes are added back because they depend on how a company is funded and
              where it operates, not on how well it runs day to day. Depreciation and amortization are
              added back because they are non-cash charges that spread the cost of past purchases over
              many years.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose a company reports $500,000 in net income, $80,000 of interest, $120,000 of taxes,
              $150,000 of depreciation and $50,000 of amortization. Adding those back gives EBITDA of
              $900,000. On $3,000,000 of revenue, that is a 30% EBITDA margin.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              EBITDA is useful for comparing operating performance, but it is not cash flow. It leaves
              out the real cost of borrowing and the capital needed to keep equipment running. For
              definitions of common financial terms, the{" "}
              <a href="https://www.sec.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Securities and Exchange Commission</a>{" "}
              is a reliable source. Compare scenarios with our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
