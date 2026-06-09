import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SimpleInterestCalculator from "./SimpleInterestCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/simple-interest-calculator";
const SELF_SLUG = "simple-interest-calculator";

const DESC =
  "Free simple interest calculator. Work out the interest and total amount on a loan or deposit using the simple interest formula I = P × r × t.";

export const metadata: Metadata = {
  title: "Simple Interest Calculator",
  description: DESC,
  keywords: [
    "simple interest calculator",
    "simple interest formula",
    "interest calculator",
    "principal interest calculator",
    "loan interest calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Simple Interest Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Simple Interest Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is simple interest?",
    answer:
      "Simple interest is interest calculated only on the original principal, not on any interest already earned. It stays the same each period, which makes it easy to predict. Many short-term loans and some deposits use simple interest.",
  },
  {
    question: "What is the simple interest formula?",
    answer:
      "The formula is I = P × r × t, where I is the interest, P is the principal, r is the annual rate as a decimal, and t is the time in years. The total amount you repay or receive is the principal plus the interest, or A = P(1 + r·t).",
  },
  {
    question: "How is simple interest different from compound interest?",
    answer:
      "Simple interest is paid only on the principal, so it grows in a straight line. Compound interest is paid on the principal plus past interest, so it grows faster over time. For long horizons, compound interest produces a much larger balance.",
  },
  {
    question: "When is simple interest used?",
    answer:
      "It is common for car loans, short-term personal loans, some bonds and certain savings products. It is also used in classrooms because the math is straightforward and easy to verify by hand.",
  },
];

export default async function SimpleInterestCalculatorPage() {
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
    "🧮"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Simple Interest Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Simple Interest Calculator"
      intro="Work out the interest and total amount on a loan or deposit using the simple interest formula. Enter the principal, rate and time, then press Calculate."
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
            { name: "Simple Interest Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Simple Interest Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SimpleInterestCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How simple interest works</H2>
            <P>
              Simple interest is the most basic way to charge or earn interest. You multiply the
              principal by the annual rate and the number of years. Because it ignores any interest
              already earned, the amount is the same every year, which makes it easy to plan around.
            </P>
            <P>
              The formula is I = P × r × t. For example, $10,000 at 5% for 3 years earns
              10,000 × 0.05 × 3 = $1,500 in interest, for a total of $11,500. Double the time and the
              interest simply doubles to $3,000.
            </P>

            <H2>Simple vs compound interest</H2>
            <P>
              The key difference is what the rate applies to. Simple interest always applies to the
              original principal, so it grows in a straight line. Compound interest applies to the
              principal plus accumulated interest, so it accelerates. If you are investing for the
              long term, try our{" "}
              <Link href="/calculators/compound-interest-calculator" className="text-orange-600 underline">compound interest calculator</Link>{" "}
              to see the difference.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Always confirm whether a product uses simple or compound interest before comparing
              offers. For consumer borrowing basics, the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              is a reliable source. Browse all of our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>{" "}
              for more.
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>}
                    </div>
                  </Link>
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
                    <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-orange-50">
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
