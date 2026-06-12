import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import WholeLifeInsuranceCalculator from "./WholeLifeInsuranceCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/whole-life-insurance-calculator";
const SELF_SLUG = "whole-life-insurance-calculator";

const DESC =
  "Free whole life insurance calculator. Estimate the level premium for a chosen death benefit and project the guaranteed cash value year by year, with a chart of cash value versus premiums paid.";

const baseMetadata: Metadata = {
  title: "Whole Life Insurance Calculator",
  description: DESC,
  keywords: [
    "whole life insurance calculator",
    "cash value calculator",
    "permanent life insurance",
    "whole life premium estimate",
    "life insurance cash value growth",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Whole Life Insurance Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Whole Life Insurance Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What is whole life insurance?",
    answer:
      "Whole life insurance is permanent coverage that lasts for your entire life as long as premiums are paid. It pairs a fixed death benefit with a cash value account that grows on a tax-deferred basis, so part of every premium builds savings you can borrow against later.",
  },
  {
    question: "How is the premium estimated here?",
    answer:
      "When you leave the premium field blank, the tool sets a level annual premium that scales with the death benefit and rises with your current age, since older lives cost more to insure per dollar of coverage. If you have a real quote, type it in to override the estimate and see the cash value it would build.",
  },
  {
    question: "Why is early cash value so much lower than premiums paid?",
    answer:
      "A large share of each early premium pays for insurance cost and policy expenses rather than savings, modeled here as the cost load. The cash value only starts to catch up after several years of credited growth, which is why the break-even year in the results often lands well into the policy.",
  },
  {
    question: "Is whole life a good investment?",
    answer:
      "Whole life mixes protection with slow, predictable savings, so its credited rate is usually lower than long-run stock returns. It can suit people who want lifelong coverage and a conservative cash reserve, but many buyers get more protection per dollar from term insurance and invest the difference separately.",
  },
];

export default async function WholeLifeInsuranceCalculatorPage() {
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
    "🛡️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Whole Life Insurance Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    dateModified: "2026-06-01",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Whole Life Insurance Calculator"
      intro="See what a whole life policy might cost and build. Enter a death benefit, your age and a credited rate, then press Calculate to project the guaranteed cash value over time."
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
            { name: "Whole Life Insurance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Whole Life Insurance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WholeLifeInsuranceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the whole life insurance calculator works</H2>
            <P>
              Whole life coverage charges a level premium that never rises, and routes part of each
              payment into a cash value account after policy costs are taken out. This tool models
              that split: the cost load is the share of every premium consumed by insurance charges,
              and the rest is credited to cash value, which then grows at the rate you choose.
            </P>
            <P>
              The chart plots two lines so the trade-off is easy to read. The shaded area is the
              guaranteed cash value, and the dashed line is the running total of premiums you have
              paid. Early on the dashed line sits well above the cash value, then the gap closes as
              compounding takes over.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose a 35-year-old buys a 250,000 dollar policy, the cost load is 35 percent and the
              cash account is credited 4 percent a year. In the early years most of the premium pays
              for protection, so cash value lags. By the time the projection reaches the break-even
              year, the cash value finally overtakes the premiums paid and keeps climbing from there.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an illustration using a steady credited rate, not a binding quote — real
              policies layer in surrender charges, dividends and changing insurance costs. Always
              compare an insurer's official policy illustration before buying, and review the
              consumer guidance from the{" "}
              <a href="https://www.naic.org" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">NAIC</a>.
              If you mainly need protection for a fixed period, compare the cost using our{" "}
              <Link href="/calculators/term-life-insurance-calculator" className="text-orange-600 underline">term life insurance calculator</Link>.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-orange-600">{a.title}</p>
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
