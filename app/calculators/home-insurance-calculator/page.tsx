import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import HomeInsuranceCalculator from "./HomeInsuranceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/home-insurance-calculator";
const SELF_SLUG = "home-insurance-calculator";

const DESC =
  "Free home insurance calculator. Estimate your annual and monthly homeowners premium from your dwelling rebuild cost, coverage limits, deductible and risk level, with a donut chart of where the premium goes.";

const baseMetadata: Metadata = {
  title: "Home Insurance Calculator",
  description: DESC,
  keywords: [
    "home insurance calculator",
    "homeowners insurance estimate",
    "dwelling coverage calculator",
    "home insurance premium calculator",
    "how much is home insurance",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Home Insurance Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Home Insurance Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is a homeowners insurance premium calculated?",
    answer:
      "The biggest driver is the cost to rebuild your home, known as dwelling coverage. Insurers apply a rate per 1,000 dollars of that rebuild cost, then adjust for location risk, your deductible and the extra coverages you add for personal property and liability. This tool follows the same building blocks to estimate a yearly figure.",
  },
  {
    question: "Should I insure my home for its market value?",
    answer:
      "No. Home insurance is based on rebuild cost, which is what it would take to reconstruct the house, not its sale price. Market value includes the land, which does not burn down. Many homes can be rebuilt for less than they would sell for, so using market value would overinsure and overcharge you.",
  },
  {
    question: "Does a higher deductible lower my premium?",
    answer:
      "Yes. The deductible is what you pay out of pocket before coverage kicks in, so raising it shifts more small-claim risk to you and the insurer charges less. In this calculator every 500 dollars of deductible above a 1,000 dollar baseline trims the premium by about 3 percent, up to a sensible cap.",
  },
  {
    question: "What do the standard coverage parts mean?",
    answer:
      "A typical HO-3 policy bundles several pieces. Dwelling covers the structure, other structures covers detached items like a garage at about 10 percent of the dwelling, personal property covers your belongings, loss of use pays living costs if you are displaced at about 20 percent, and liability protects you if someone is hurt on your property.",
  },
];

export default async function HomeInsuranceCalculatorPage() {
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
    "🛡️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Insurance Calculator",
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
      title="Home Insurance Calculator"
      intro="Estimate what homeowners insurance might cost you. Enter your rebuild cost, coverage limits, deductible and area risk, then press Calculate to see an annual and monthly premium with a breakdown."
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
            { name: "Home Insurance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Home Insurance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HomeInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the home insurance calculator works</H2>
            <P>
              Homeowners policies are priced around one number: the cost to rebuild your home from
              the ground up. The calculator takes that dwelling rebuild cost and multiplies it by a
              base rate per 1,000 dollars, then nudges the result up or down for the risk of your area
              and the deductible you choose. A higher deductible means you absorb more small claims,
              so the premium falls.
            </P>
            <P>
              On top of the dwelling, a standard policy adds coverage for detached structures, your
              personal belongings and personal liability. Each of those carries a slice of the
              premium, and the donut chart shows how the total splits across them so you can see what
              you are actually paying for.
            </P>

            <H2>A worked example</H2>
            <P>
              Say it would cost 350,000 dollars to rebuild your home, you set personal property at 50
              percent, carry 300,000 dollars of liability, and live in an average-risk area with a
              1,000 dollar deductible. At a base rate of 3.50 dollars per 1,000, the estimate lands
              near 1,500 dollars a year, or roughly 125 dollars a month. Bump the deductible to 2,500
              dollars and the yearly cost drops noticeably.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is a planning estimate, not a quote. Real carriers weigh roof age, claims history,
              credit in many states, and catastrophe exposure such as wildfire or flood, which a
              standard policy does not even cover. For unbiased guidance on choosing coverage, see the{" "}
              <a href="https://content.naic.org/consumer/home-insurance.htm" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">NAIC home insurance guide</a>.
              If you also want to size up the mortgage that sits behind the home, try our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>.
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
