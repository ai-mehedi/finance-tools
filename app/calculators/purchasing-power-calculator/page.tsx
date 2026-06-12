import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import PurchasingPowerCalculator from "./PurchasingPowerCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/purchasing-power-calculator";
const SELF_SLUG = "purchasing-power-calculator";

const DESC =
  "Free purchasing power calculator. See how inflation erodes the real value of your money over time, what today's dollars will buy later, and how much you would need to keep pace.";

const baseMetadata: Metadata = {
  title: "Purchasing Power Calculator",
  description: DESC,
  keywords: [
    "purchasing power calculator",
    "inflation calculator",
    "buying power calculator",
    "real value of money",
    "value of money over time",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Purchasing Power Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Purchasing Power Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is purchasing power?",
    answer:
      "Purchasing power is how much a fixed amount of money can actually buy. As prices rise with inflation, the same dollar buys less, so its purchasing power falls even though the number on the bill stays the same.",
  },
  {
    question: "How does this calculator measure inflation's effect?",
    answer:
      "It discounts today's amount by the average inflation rate for each year ahead. The real value is what your money will buy later stated in today's dollars, while the equivalent needed is the larger nominal sum required then to match what you can buy now.",
  },
  {
    question: "What inflation rate should I use?",
    answer:
      "Long run inflation in many developed economies has averaged around two to three percent a year, though it swings with the economy. Use a rate that reflects your outlook or your own cost of living, and try a few values to see the range of outcomes.",
  },
  {
    question: "How can I protect my money from losing buying power?",
    answer:
      "Holding cash that earns less than inflation steadily loses value. Investing so your money grows at or above the inflation rate, or using inflation linked assets, helps preserve purchasing power, though every option carries its own risk.",
  },
];

export default async function PurchasingPowerCalculatorPage() {
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
    "💵"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Purchasing Power Calculator",
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
      title="Purchasing Power Calculator"
      intro="Find out what your money will really be worth down the road. Enter an amount, an average inflation rate and a horizon, then press Calculate to see how buying power erodes."
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
            { name: "Purchasing Power Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Purchasing Power Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PurchasingPowerCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the purchasing power calculator works</H2>
            <P>
              Inflation quietly shrinks what your money can buy. The tool takes the amount you have
              today and applies your chosen average inflation rate to each future year, then reports
              two figures: the real value, which is what that money will buy later stated in today&apos;s
              dollars, and the equivalent amount you would need then to buy the same things.
            </P>
            <P>
              The chart shows the real value sloping downward year by year while the dashed line marks
              your original amount. The gap between them is the buying power that inflation has quietly
              taken away.
            </P>

            <H2>A worked example</H2>
            <P>
              Picture 50,000 dollars sitting in cash with inflation averaging 3 percent a year. After
              20 years that money still reads 50,000 dollars, but it only buys what about 27,700 dollars
              buys today. You would need roughly 90,300 dollars in 20 years to match the buying power of
              50,000 dollars now.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Actual inflation varies year to year and differs by what you spend on, so treat the result
              as a guide rather than a forecast. You can track real inflation figures from the{" "}
              <a href="https://www.bls.gov/cpi/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">U.S. Bureau of Labor Statistics</a>.
              To see how investing could outrun inflation, try our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
