import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import FireCalculator from "./FireCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/fire-calculator";
const SELF_SLUG = "fire-calculator";

const DESC =
  "Free FIRE calculator. Find your financial independence number from your spending and a safe withdrawal rate, then see how many years of saving and investing it takes to retire early.";

const baseMetadata: Metadata = {
  title: "FIRE Calculator",
  description: DESC,
  keywords: [
    "FIRE calculator",
    "financial independence calculator",
    "retire early calculator",
    "safe withdrawal rate",
    "FIRE number",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "FIRE Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "FIRE Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is a FIRE number?",
    answer:
      "Your FIRE number is the portfolio size that lets you live off withdrawals without running out of money. It is your annual spending divided by your safe withdrawal rate. At a 4 percent rate, that works out to 25 times your yearly expenses.",
  },
  {
    question: "What is a safe withdrawal rate?",
    answer:
      "It is the share of your portfolio you can take out each year and still expect it to last for decades. The widely cited figure is 4 percent, based on historical market studies. A lower rate such as 3.5 percent is more conservative and raises the FIRE number you need.",
  },
  {
    question: "Why does the calculator use a real return?",
    answer:
      "A real return is your expected investment growth after subtracting inflation. Using it keeps every figure in today's dollars, so your FIRE number and your projected portfolio are measured on the same scale and the years to independence stay meaningful.",
  },
  {
    question: "Does the projection guarantee I can retire early?",
    answer:
      "No. It assumes a steady real return and constant saving, while real markets swing up and down and life costs change. Treat the years to FIRE as a planning estimate, build in a margin of safety, and revisit the numbers as your income and spending evolve.",
  },
];

export default async function FireCalculatorPage() {
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
    "🔥"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FIRE Calculator",
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
      title="FIRE Calculator"
      intro="Plan your path to Financial Independence, Retire Early. Enter your savings, spending and expected return to find your FIRE number and how many years it takes to get there."
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
            { name: "FIRE Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="FIRE Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FireCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the FIRE calculator works</H2>
            <P>
              FIRE stands for Financial Independence, Retire Early. The calculator answers two
              questions. First, how big a portfolio do you need? That is your annual spending divided
              by your safe withdrawal rate, the level of withdrawals your investments can sustain.
              Second, when will you reach it? The tool grows your current savings each year at your
              real return and adds your yearly contributions until the balance crosses your FIRE
              number.
            </P>
            <P>
              The chart traces that climb. The shaded area is your portfolio year by year, and the
              dashed line marks your FIRE number. The point where the two meet is the moment work
              becomes optional, in today's dollars.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you spend 40,000 dollars a year and use a 4 percent withdrawal rate. Your FIRE
              number is 40,000 divided by 0.04, or 1,000,000 dollars. Starting with 50,000 dollars,
              saving 30,000 a year and earning a 5 percent real return, you reach that million in
              roughly 18 years, supporting about 3,333 dollars of passive income each month.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The model assumes a smooth return and steady saving, so early bad market years, called
              sequence of returns risk, can change the outcome. Many planners favor a withdrawal rate
              below 4 percent for very long retirements. For the research behind safe withdrawal
              rates, see the{" "}
              <a href="https://www.bogleheads.org/wiki/Trinity_study_update" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Trinity study overview</a>.
              To stress-test the savings half of the plan, run your contributions through our{" "}
              <Link href="/calculators/compound-interest-calculator" className="text-orange-600 underline">compound interest calculator</Link>.
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
