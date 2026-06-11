import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import EpfCalculator from "./EpfCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/epf-calculator";
const SELF_SLUG = "epf-calculator";

const DESC =
  "Free EPF calculator. Estimate your Employees Provident Fund corpus at retirement from your basic pay, employee and employer contributions, the EPS diversion and yearly interest, with a corpus growth chart.";

const baseMetadata: Metadata = {
  title: "EPF Calculator",
  description: DESC,
  keywords: [
    "EPF calculator",
    "provident fund calculator",
    "EPF maturity calculator",
    "employee provident fund",
    "EPF interest calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "EPF Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "EPF Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much goes into EPF from my salary?",
    answer:
      "You contribute 12 percent of your basic pay plus dearness allowance, and your employer adds a matching 12 percent. Out of the employer share, 8.33 percent of wages, capped at a wage of 15,000 rupees a month, is routed to the pension fund (EPS), and the rest joins your EPF balance.",
  },
  {
    question: "Why is the employer EPF contribution lower than mine?",
    answer:
      "Both sides put in 12 percent, but a slice of the employer portion is diverted to the Employees Pension Scheme. That EPS amount funds your pension rather than your provident fund, so the part of the employer contribution that lands in EPF and earns interest is smaller than your own share.",
  },
  {
    question: "How is EPF interest calculated?",
    answer:
      "The government declares an EPF interest rate each year, currently around 8.25 percent. Interest is computed on the running balance and credited at the end of the financial year. Because the balance keeps growing with fresh contributions, the interest compounds year after year.",
  },
  {
    question: "Is the EPF maturity amount tax free?",
    answer:
      "EPF withdrawals are generally tax free once you have completed five years of continuous service. Withdrawing earlier can make part of the amount taxable. This tool estimates the corpus before any tax, so treat the figure as your gross retirement balance.",
  },
];

export default async function EpfCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "EPF Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    dateModified: "2026-06-01",
    author: personSchema(EDITORIAL.author),
    ...(EDITORIAL.reviewer.name ? { reviewer: personSchema(EDITORIAL.reviewer) } : {}),
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="EPF Calculator"
      intro="Project the Employees Provident Fund corpus waiting for you at retirement. Enter your basic pay, contribution rates and assumptions, then press Calculate to see how your balance compounds."
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
            { name: "EPF Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="EPF Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EpfCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the EPF calculator works</H2>
            <P>
              Each month you set aside a percentage of your basic pay plus dearness allowance, and
              your employer matches it. The calculator first removes the statutory pension (EPS) slice
              from the employer share, then adds what is left to your provident fund. At the end of
              every year it credits interest on the running balance, so the corpus compounds the way
              the real scheme does.
            </P>
            <P>
              Because pay tends to rise over a career, the tool also grows your basic plus DA by the
              annual increment you enter, which lifts every future contribution. The chart plots the
              total corpus against the money actually contributed, and the widening gap between them
              is the interest your fund has earned.
            </P>

            <H2>A worked example</H2>
            <P>
              Take a basic plus DA of 30,000 rupees a month at age 28, retiring at 58, with 8.25
              percent interest and a 6 percent yearly increment. Your own contributions add up to a
              few lakh over the years, yet decades of compounding can push the maturity corpus well
              into the tens of lakhs, with interest making up a large part of the final figure.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The declared interest rate changes each year and is set by the government, so treat your
              result as a projection. You can confirm current rules and rates on the official{" "}
              <a href="https://www.epfindia.gov.in" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">EPFO website</a>.
              To compare EPF with a fixed-deposit alternative, try our{" "}
              <Link href="/calculators/fd-calculator" className="text-orange-600 underline">FD calculator</Link>.
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
