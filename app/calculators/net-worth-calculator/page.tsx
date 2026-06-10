import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import NetWorthCalculator from "./NetWorthCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/net-worth-calculator";
const SELF_SLUG = "net-worth-calculator";

const DESC =
  "Free net worth calculator. Add up your assets and subtract your debts to see your true net worth, with a donut chart breaking down where your money sits.";

const baseMetadata: Metadata = {
  title: "Net Worth Calculator",
  description: DESC,
  keywords: [
    "net worth calculator",
    "personal net worth",
    "assets minus liabilities",
    "net worth tracker",
    "financial net worth",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Net Worth Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Net Worth Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is net worth?",
    answer:
      "Net worth is the value of everything you own minus everything you owe. Add up your assets such as cash, investments, property and vehicles, then subtract your liabilities such as a mortgage, loans and credit card balances. The difference is your net worth.",
  },
  {
    question: "Is it normal to have a negative net worth?",
    answer:
      "Yes, especially early in life. Student loans, a new mortgage or a car loan can outweigh what you have saved. A negative figure is not a failure, it is a starting point. As you pay down debt and build savings the number climbs and eventually crosses into positive territory.",
  },
  {
    question: "Should I use market value or purchase price for my assets?",
    answer:
      "Use current market value, not what you originally paid. A home is worth what it would sell for today, and a car is worth its resale value, which is usually well below the sticker price. Using realistic values keeps your net worth honest rather than flattering.",
  },
  {
    question: "What is a healthy debt-to-asset ratio?",
    answer:
      "The debt-to-asset ratio is your total liabilities divided by your total assets. A lower number means more of what you own is truly yours. Many people aim to bring this ratio down over time, particularly as a mortgage is paid off, so a growing share of their assets is unencumbered.",
  },
];

export default async function NetWorthCalculatorPage() {
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
    name: "Net Worth Calculator",
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
      title="Net Worth Calculator"
      intro="See exactly where you stand. List what you own and what you owe, then press Calculate to find your net worth and see how your assets and debts stack up."
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
            { name: "Net Worth Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Net Worth Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NetWorthCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the net worth calculator works</H2>
            <P>
              The math behind net worth is refreshingly simple. The tool totals your assets, totals
              your liabilities, and shows the difference. What makes it useful is the breakdown: two
              donut charts reveal how your assets are spread across cash, investments, property and
              vehicles, and how your debts split between a mortgage, loans and credit cards.
            </P>
            <P>
              Tracking the same figure every few months turns a single snapshot into a trend. Even if
              your income stays flat, paying down a loan or letting investments compound nudges the
              number upward, which is the clearest single sign that your finances are moving the right
              way.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you own a home worth 350,000 dollars, hold 85,000 dollars in investments, keep
              15,000 dollars in cash and drive a car worth 25,000 dollars. Against that you owe a
              220,000 dollar mortgage, an 18,000 dollar car loan and 5,000 dollars on cards. Your
              assets total 485,000 dollars and your debts total 243,000 dollars, leaving a net worth
              of 242,000 dollars and a debt-to-asset ratio of about 50 percent.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Be conservative with hard-to-value items and update market values when they shift. For a
              broader picture of household balance sheets, the Federal Reserve publishes data through
              the{" "}
              <a href="https://www.federalreserve.gov/econres/scfindex.htm" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Survey of Consumer Finances</a>.
              To project how your investments might grow and lift your net worth over time, try our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>.
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
