import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import AnnuityPayoutCalculator from "./AnnuityPayoutCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/annuity-payout-calculator";
const SELF_SLUG = "annuity-payout-calculator";

const DESC =
  "Free annuity payout calculator. Find the level monthly income a starting balance can pay over a set number of years while it keeps earning interest, with a balance chart.";

export const metadata: Metadata = {
  title: "Annuity Payout Calculator",
  description: DESC,
  keywords: [
    "annuity payout calculator",
    "annuity income calculator",
    "annuity withdrawal calculator",
    "monthly annuity payment calculator",
    "retirement payout calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Annuity Payout Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Annuity Payout Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is an annuity payout calculated?",
    answer:
      "The payout is the level payment that draws a balance to zero over the chosen period while the remaining balance keeps earning interest. It uses the present value of an annuity formula: PMT = P × i / (1 − (1 + i)^-n), where i is the rate per period and n is the number of payments.",
  },
  {
    question: "Why does interest let me withdraw more than just the balance divided by years?",
    answer:
      "Because the money you have not yet withdrawn keeps earning interest. That ongoing growth funds part of each payment, so you can take out more in total than your starting balance, with the extra coming from the interest earned along the way.",
  },
  {
    question: "What happens at the end of the payout period?",
    answer:
      "By design the balance reaches zero at the end of the period you choose. The calculator assumes you want to fully spend the balance over that time. If you want the money to last indefinitely, withdraw only the interest each year instead.",
  },
  {
    question: "Is this the same as a real annuity contract?",
    answer:
      "Not exactly. A commercial annuity may guarantee income for life and includes fees and insurer assumptions. This calculator models a self funded payout from a balance at a fixed rate, which is useful for planning but not a quote.",
  },
];

export default async function AnnuityPayoutCalculatorPage() {
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
    "🏦"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Annuity Payout Calculator",
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
      title="Annuity Payout Calculator"
      intro="Find the level monthly income a balance can pay over a set number of years while it keeps earning interest, and watch the balance run down. Enter your numbers and press Calculate."
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
            { name: "Annuity Payout Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Annuity Payout Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnnuityPayoutCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the annuity payout calculator works</H2>
            <P>
              In the payout phase, your balance does two things at once. It pays you a fixed amount
              each month, and whatever is left keeps earning interest. The calculator finds the exact
              monthly payment that spends the balance down to zero right at the end of your chosen
              period. Early on, interest covers a big share of each payment, which is why the balance
              chart falls slowly at first and faster toward the end.
            </P>
            <P>
              This is the same present value of an annuity math that pension providers and retirement
              planners use. Because the unspent balance keeps working, the total you receive is larger
              than your starting balance, with the difference coming from interest.
            </P>

            <H2>A quick example</H2>
            <P>
              Start with $500,000 earning 4% a year and draw it down over 25 years. The level payment
              is about $2,640 a month, or roughly $31,600 a year. Across the full period you receive
              close to $790,000, well above the $500,000 you began with, thanks to interest on the
              balance you have not yet spent.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The result assumes a steady rate and no fees, taxes or inflation, so your spending power
              will shrink over time even if the dollar payment stays flat. A higher rate or shorter
              period raises the monthly payout. To build the balance first, use our{" "}
              <Link href="/calculators/annuity-calculator" className="text-orange-600 underline">annuity calculator</Link>, or
              explore all of our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>.
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
