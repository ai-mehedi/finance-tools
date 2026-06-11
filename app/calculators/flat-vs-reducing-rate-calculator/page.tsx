import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import FlatVsReducingRateCalculator from "./FlatVsReducingRateCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/flat-vs-reducing-rate-calculator";
const SELF_SLUG = "flat-vs-reducing-rate-calculator";

const DESC =
  "Free flat vs reducing rate calculator. Compare a flat-rate loan against a reducing-balance loan at the same quoted rate, see the true interest cost gap, monthly payments and the effective APR a flat rate really hides.";

const baseMetadata: Metadata = {
  title: "Flat vs Reducing Rate Calculator",
  description: DESC,
  keywords: [
    "flat vs reducing rate calculator",
    "flat rate vs reducing balance",
    "effective interest rate loan",
    "diminishing balance interest",
    "loan interest comparison",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Flat vs Reducing Rate Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Flat vs Reducing Rate Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is the difference between flat and reducing interest?",
    answer:
      "A flat rate charges interest on the full original loan amount for the whole term, no matter how much you have already repaid. A reducing-balance rate charges interest only on what you still owe, so as the balance falls each month the interest portion falls too. For the same quoted rate the flat method always costs more.",
  },
  {
    question: "Why does a flat rate cost more than the same reducing rate?",
    answer:
      "Because under a flat loan you keep paying interest on money you have already returned to the lender. Even though half your principal might be repaid by the midpoint, the flat scheme still charges interest as if the whole amount were outstanding. The calculator shows how a flat rate of one number behaves like a much higher reducing APR.",
  },
  {
    question: "How do I convert a flat rate to an effective APR?",
    answer:
      "Take the flat monthly payment and find the reducing-balance rate that produces that same payment on the same principal and term. As a rough rule the effective reducing rate is close to the flat rate times two for typical terms, but it depends on the length of the loan. This tool solves for the exact equivalent and shows it.",
  },
  {
    question: "Which loans usually quote a flat rate?",
    answer:
      "Flat rates are common on car loans, consumer durable financing, some personal loans and many informal lenders, because the headline number looks smaller and more attractive. Mortgages and most bank term loans use reducing balance. Always ask which method applies before comparing two offers.",
  },
];

export default async function FlatVsReducingRateCalculatorPage() {
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
    "⚖️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Flat vs Reducing Rate Calculator",
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
      title="Flat vs Reducing Rate Calculator"
      intro="Two loans can quote the same interest rate yet cost very different amounts. Enter a loan amount, rate and term to see what a flat rate really costs against a reducing-balance loan."
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
            { name: "Flat vs Reducing Rate Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Flat vs Reducing Rate Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FlatVsReducingRateCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How this comparison works</H2>
            <P>
              The calculator takes one quoted rate and applies it two ways. Under the flat method it
              multiplies your original loan amount by the rate and the number of years, then spreads
              that fixed interest evenly across every month. Under the reducing method it amortises
              the loan like a normal bank repayment, charging interest only on the balance that is
              still outstanding each month.
            </P>
            <P>
              The chart traces the outstanding principal for both schemes. The flat line falls in a
              straight diagonal because principal is returned evenly, while the reducing area curves
              as early payments are mostly interest and later payments are mostly principal. The
              headline figure is the extra interest the flat structure quietly adds.
            </P>

            <H2>A worked example</H2>
            <P>
              Borrow 20,000 dollars at a 9 percent flat rate over 5 years. The flat scheme charges
              9 percent of 20,000 every year for 5 years, which is 9,000 dollars of interest. The same
              9 percent applied on a reducing balance costs roughly 4,900 dollars, because by year
              three you owe far less. That 9 percent flat rate behaves like an effective reducing APR
              near 16 percent, almost double the headline number.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              When you compare two loan offers, always confirm which method each uses before judging
              the rate. A consumer protection primer on loan costs from{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">the CFPB</a>{" "}
              is a useful neutral reference. Once you know the equivalent reducing rate, plug it into
              our{" "}
              <Link href="/calculators/loan-calculator" className="text-orange-600 underline">loan calculator</Link>{" "}
              to see the full repayment schedule.
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
