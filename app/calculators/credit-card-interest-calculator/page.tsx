import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import CreditCardInterestCalculator from "./CreditCardInterestCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/credit-card-interest-calculator";
const SELF_SLUG = "credit-card-interest-calculator";

const DESC =
  "Free credit card interest calculator. See how long a balance takes to clear and the total interest you pay, comparing a fixed monthly payment against a percent-of-balance minimum, with a payoff chart.";

const baseMetadata: Metadata = {
  title: "Credit Card Interest Calculator",
  description: DESC,
  keywords: [
    "credit card interest calculator",
    "credit card payoff calculator",
    "minimum payment calculator",
    "credit card APR calculator",
    "debt interest calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Credit Card Interest Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Credit Card Interest Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is credit card interest calculated?",
    answer:
      "Card issuers turn the annual percentage rate into a smaller periodic rate and apply it to your balance each cycle. This calculator divides the APR by twelve to charge interest monthly, then subtracts your payment, repeating until the balance reaches zero so you can see the full cost.",
  },
  {
    question: "Why does paying only the minimum cost so much?",
    answer:
      "A percent-of-balance minimum shrinks as the balance falls, so each payment covers less principal over time. Much of every payment goes to interest, which is why a minimum-only plan can take many years and cost more in interest than the original balance.",
  },
  {
    question: "What happens if my payment is too small?",
    answer:
      "If a fixed payment is less than or equal to the first month of interest, the balance never goes down and the debt grows instead. The calculator flags this so you know your payment has to exceed the monthly interest charge before you make any progress.",
  },
  {
    question: "How can I pay off my card faster?",
    answer:
      "Pay more than the minimum and keep the dollar amount fixed rather than letting it drop with the balance. Even a small increase shortens the timeline and cuts total interest sharply. Switching the calculator to a fixed payment shows the effect of committing to a steady amount.",
  },
];

export default async function CreditCardInterestCalculatorPage() {
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
    "💳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Credit Card Interest Calculator",
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
      title="Credit Card Interest Calculator"
      intro="See the real cost of carrying a balance. Enter what you owe, your APR and how you plan to pay, then press Calculate to find your payoff time and total interest."
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
            { name: "Credit Card Interest Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Credit Card Interest Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreditCardInterestCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the credit card interest calculator works</H2>
            <P>
              Each month the tool adds interest based on your APR, then subtracts your payment, and
              repeats the cycle until the balance is gone. You can model a fixed monthly payment, where
              you commit to the same dollar amount every month, or a percent-of-balance minimum, which
              shrinks as the balance does.
            </P>
            <P>
              The headline figure is how long the debt lasts, and the breakdown shows the total
              interest you hand over along the way. The chart traces your balance month by month so you
              can watch how quickly, or how slowly, it falls toward zero.
            </P>

            <H2>A worked example</H2>
            <P>
              Carry a 6,000 dollar balance at 22 percent APR. Pay a fixed 250 dollars a month and you
              clear it in a little over two years, paying roughly 1,500 dollars in interest. Switch to
              a 3 percent minimum with a 35 dollar floor and the timeline stretches for many years
              while interest climbs well past that, because each payment keeps shrinking.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Real cards may compound daily and apply fees, so treat the total as a close estimate. The
              single biggest lever is paying more than the minimum and keeping the amount steady. For
              consumer guidance on managing card debt, see the{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/credit-cards/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>.
              If you are weighing a payoff loan instead, compare it with our{" "}
              <Link href="/calculators/future-value-calculator" className="text-orange-600 underline">future value calculator</Link>{" "}
              to see what the same money could earn elsewhere.
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
