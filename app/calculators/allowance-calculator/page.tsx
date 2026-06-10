import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import AllowanceCalculator from "./AllowanceCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/allowance-calculator";
const SELF_SLUG = "allowance-calculator";

const DESC =
  "Free allowance calculator. See how a weekly or monthly kids' allowance adds up over time, how much gets saved, and how a small interest rate grows the pot.";

const baseMetadata: Metadata = {
  title: "Allowance Calculator",
  description: DESC,
  keywords: [
    "allowance calculator",
    "kids allowance calculator",
    "weekly allowance calculator",
    "allowance savings calculator",
    "teen allowance calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Allowance Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Allowance Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How much allowance should I give?",
    answer:
      "There is no single right number. A common rule of thumb is about one dollar per year of age each week, but families set amounts based on budget, chores and local costs. Use the calculator to see the yearly total at any amount you choose.",
  },
  {
    question: "How does this calculator handle saving?",
    answer:
      "You set the percent of each allowance that is put aside. The calculator adds that saved portion to a balance and applies the interest rate you enter, so you can see both the spending money and the growing savings over time.",
  },
  {
    question: "Should a child save part of their allowance?",
    answer:
      "Setting aside even a small share teaches the habit early. Many parents use a save, spend and give split. Watching a balance grow, especially with a little interest, helps a child connect patience with reward.",
  },
  {
    question: "Is the interest rate realistic?",
    answer:
      "A kids' savings account often pays a small rate, while a parent match or a high-yield account can pay more. Enter whatever rate fits your situation, or set it to zero to see plain saved totals without any growth.",
  },
];

export default async function AllowanceCalculatorPage() {
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
    name: "Allowance Calculator",
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
      title="Allowance Calculator"
      intro="See how a weekly or monthly allowance adds up, how much gets saved, and how a little interest grows the balance over the years. Enter your numbers and press Calculate."
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
            { name: "Allowance Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Allowance Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AllowanceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the allowance calculator works</H2>
            <P>
              Pick how much you pay and how often, and the calculator turns it into a yearly total.
              It then takes the share you choose to save, sets it aside, and applies your interest
              rate month by month. The chart shows the saved balance climbing as the years pass.
            </P>
            <P>
              The result splits the money three ways: the part that gets spent, the part that gets
              saved, and the interest that the saved part earns. That makes it easy to talk through
              choices with a child without getting lost in the math.
            </P>

            <H2>A quick example</H2>
            <P>
              Pay $10 a week and save half of it. That is $520 a year, with $260 set aside. Over five
              years the saved portion alone reaches about $1,300, and a small 2% rate nudges it a
              little higher. Seeing that number grow can make saving feel worthwhile.
            </P>

            <H2>Teaching money habits</H2>
            <P>
              An allowance is one of the first chances a child has to make real money decisions. A
              simple save, spend and give split builds good instincts early. When you are ready to
              compare longer-term growth, try our{" "}
              <Link href="/calculators/compound-interest-calculator" className="text-orange-600 underline">compound interest calculator</Link>{" "}
              or browse all of our{" "}
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
