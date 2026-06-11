import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import NpsCalculator from "./NpsCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/nps-calculator";
const SELF_SLUG = "nps-calculator";

const DESC =
  "Free NPS calculator. Estimate your National Pension System corpus at retirement from monthly contributions, then see your tax-free lump sum and indicative monthly pension after buying an annuity.";

const baseMetadata: Metadata = {
  title: "NPS Calculator",
  description: DESC,
  keywords: [
    "nps calculator",
    "national pension system calculator",
    "nps pension calculator",
    "nps maturity calculator",
    "retirement corpus calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "NPS Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "NPS Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is the NPS corpus calculated?",
    answer:
      "Each monthly contribution is added to your account and the whole balance grows at the expected annual return, compounded month by month until you retire. The corpus at retirement is the sum of every contribution plus all the returns those contributions earned along the way.",
  },
  {
    question: "How much of the NPS corpus can I withdraw as a lump sum?",
    answer:
      "Under current rules you must use at least 40 percent of the corpus to buy an annuity, so up to 60 percent can be taken as a lump sum at age 60. This tool lets you set the annuity share, and the remainder becomes your withdrawable lump sum.",
  },
  {
    question: "How is the monthly pension worked out?",
    answer:
      "The portion of the corpus set aside for the annuity is multiplied by the annuity rate to give a yearly payout, which is then divided by twelve for the monthly pension. The actual amount depends on the annuity plan and provider you choose at retirement.",
  },
  {
    question: "Are the NPS returns guaranteed?",
    answer:
      "No. NPS invests in a mix of equity, corporate bonds and government securities, so the return shown here is only an assumption. Equity-heavy allocations may earn more over long horizons but swing more year to year, so treat the projected corpus as a planning estimate.",
  },
];

export default async function NpsCalculatorPage() {
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
    "🪙"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NPS Calculator",
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
      title="NPS Calculator"
      intro="See what the National Pension System could build for your retirement. Enter your monthly contribution, ages and an expected return, then press Calculate to see your corpus, lump sum and monthly pension."
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
            { name: "NPS Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="NPS Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NpsCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the NPS calculator works</H2>
            <P>
              The National Pension System is a long-horizon retirement scheme where you contribute a
              fixed amount each month and the fund managers invest it across equity and debt. This tool
              compounds every contribution at the return you expect, so you can watch a modest monthly
              outflow grow into a sizeable corpus by the time you reach 60.
            </P>
            <P>
              The chart plots two lines. The shaded area is your growing corpus, and the dashed line is
              the money you actually paid in. The widening gap between them is the compounding effect of
              your returns, which does most of the heavy lifting in the final decade before retirement.
            </P>

            <H2>A quick example</H2>
            <P>
              Put aside 5,000 rupees a month from age 30 to 60 at an assumed 10 percent return, and the
              corpus lands near 1.1 crore. Keep 40 percent in an annuity earning 6 percent and you draw
              roughly 22,000 rupees a month as pension, while still taking about 67 lakh as a tax-free
              lump sum. Raising the contribution or starting a few years earlier changes the picture
              dramatically.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The numbers here are projections, not promises, because NPS returns track the markets and
              annuity rates move over time. For scheme rules and tax details, check the official{" "}
              <a href="https://www.npscra.nsdl.co.in" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">NPS Trust portal</a>.
              To compare a simple monthly investing plan instead, try our{" "}
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
