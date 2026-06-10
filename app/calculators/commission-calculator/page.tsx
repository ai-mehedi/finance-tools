import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CommissionCalculator from "./CommissionCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/commission-calculator";
const SELF_SLUG = "commission-calculator";

const DESC =
  "Free commission calculator. Work out your sales commission and total pay from a sales amount and rate, with support for a base salary and a higher tiered rate.";

export const metadata: Metadata = {
  title: "Commission Calculator",
  description: DESC,
  keywords: [
    "commission calculator",
    "sales commission calculator",
    "commission rate calculator",
    "tiered commission calculator",
    "commission pay calculator",
    "sales pay calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Commission Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Commission Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is sales commission calculated?",
    answer:
      "Commission is the sales amount multiplied by the commission rate. For example, $50,000 in sales at a 5% rate earns $2,500. If you also receive a base salary, add it on top to get your total pay for the period.",
  },
  {
    question: "What is a tiered commission?",
    answer:
      "A tiered plan pays a higher rate on sales above a threshold. You might earn 5% on the first $30,000 and 8% on everything above it. This rewards top performance, and the calculator splits your sales at the threshold and applies each rate to the right portion.",
  },
  {
    question: "What is the difference between base salary and commission?",
    answer:
      "Base salary is fixed pay you receive regardless of sales. Commission is variable pay tied to what you sell. Many sales roles combine the two, giving you stable income plus upside when you sell more.",
  },
  {
    question: "What is a good commission rate?",
    answer:
      "Rates vary widely by industry, from 1% to 2% on large-ticket items to 20% or more on some services. The right rate depends on margins, deal size and how much of your pay is base versus commission. Always confirm the exact terms in your plan.",
  },
];

export default async function CommissionCalculatorPage() {
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
    "💼"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Commission Calculator",
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
      title="Commission Calculator"
      intro="Work out your sales commission and total pay. Enter your sales and rate, add an optional base salary or tiered rate, then press Calculate."
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
            { name: "Commission Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Commission Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CommissionCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the commission calculator works</H2>
            <P>
              At its simplest, commission is your sales amount times your rate. The calculator does
              that math instantly and then layers on two common real world features: a base salary
              and a tiered rate. The base salary is added to your commission to show total take, and
              the tier splits your sales so the portion above a threshold earns a higher rate.
            </P>
            <P>
              The effective rate shown in the results is your total commission divided by total sales.
              It is handy when you have a tiered plan, because it tells you the single blended rate you
              actually earned across the whole sale.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you sell $50,000 with a plan paying 5% up to $30,000 and 8% above. The first
              $30,000 earns $1,500 and the remaining $20,000 earns $1,600, for $3,100 in commission.
              Add a $3,000 base salary and your total pay for the period is $6,100.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Plans differ on when commission is paid, whether it is on gross or net sales, and how
              returns are handled. Always read your plan document. For general guidance on pay and
              wages, the{" "}
              <a href="https://www.dol.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Department of Labor</a>{" "}
              is a useful reference. Explore more with our{" "}
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
