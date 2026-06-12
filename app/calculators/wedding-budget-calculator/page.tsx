import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import WeddingBudgetCalculator from "./WeddingBudgetCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/wedding-budget-calculator";
const SELF_SLUG = "wedding-budget-calculator";

const DESC =
  "Free wedding budget calculator. Split your total budget across venue, catering, photography, flowers and more using typical shares, and see the cost per guest at a glance.";

const baseMetadata: Metadata = {
  title: "Wedding Budget Calculator",
  description: DESC,
  keywords: [
    "wedding budget calculator",
    "wedding cost calculator",
    "wedding budget breakdown",
    "cost per guest wedding",
    "wedding budget planner",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Wedding Budget Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Budget Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How is a wedding budget usually broken down?",
    answer:
      "The single largest slice is venue and catering, which commonly takes around 40 percent of the total because it scales with the guest count. Photography and video, flowers and decor, entertainment, attire, rings and stationery, and planning each take a smaller share. This calculator applies a widely used split so you can see roughly what to set aside for every part.",
  },
  {
    question: "Why does venue and catering cost so much per person?",
    answer:
      "Most reception venues price food and drink on a per-head basis, so every extra guest adds a plate, a place setting and a share of the bar. That is why trimming the guest list is the most powerful way to lower a wedding bill. Halving the guests does not halve the photographer or the rings, but it can come close to halving the catering line.",
  },
  {
    question: "What is the cost per guest, and why does it matter?",
    answer:
      "Cost per guest is the total budget divided by the number of people you invite. It is a quick reality check: if the figure feels high for your area, you can either raise the budget, cut the list, or choose a less expensive venue and menu. Tracking it stops the guest list from quietly inflating every other cost.",
  },
  {
    question: "Should I keep money aside for surprises?",
    answer:
      "Yes. Couples routinely run into costs they did not plan for, such as vendor gratuities, alterations, overtime, delivery fees and weather contingencies. Many planners suggest holding back around five to ten percent of the budget as a buffer. The planning and extras category in this breakdown is a sensible place to park that cushion.",
  },
];

export default async function WeddingBudgetCalculatorPage() {
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
    "💍"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Wedding Budget Calculator",
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
      title="Wedding Budget Calculator"
      intro="See exactly where your wedding money should go. Enter a total budget and your guest count, then press Calculate for a category-by-category breakdown and the cost per guest."
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
            { name: "Wedding Budget Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Wedding Budget Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeddingBudgetCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the wedding budget calculator works</H2>
            <P>
              The tool takes your overall budget and divides it across the categories most weddings spend
              on, using a typical share for each. Venue and catering claim the biggest portion because they
              scale with the number of guests, while items like rings, stationery and the cake take much
              smaller slices. The donut chart shows those proportions at a glance.
            </P>
            <P>
              Alongside the breakdown, the calculator reports the cost per guest, which is simply the total
              budget divided by everyone you invite. That single number is the fastest way to judge whether
              your plans and your wallet are in step.
            </P>

            <H2>A quick example</H2>
            <P>
              Picture a 30,000 dollar budget for 120 guests. The split puts about 12,000 dollars toward
              venue and catering, roughly 3,600 dollars on photography and video, and around 3,000 dollars
              on flowers and decor, with the rest spread across music, attire, rings, the cake and a
              planning buffer. The cost per guest works out to about 250 dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              These shares are a starting point, not a rule. Priorities differ, so feel free to shift money
              toward what matters most to you and away from what does not. For broader planning ideas and
              real-world price ranges, see the{" "}
              <a href="https://www.theknot.com/content/wedding-budget-101" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">wedding budget basics from The Knot</a>.
              If you are saving toward the day rather than spending it, our{" "}
              <Link href="/calculators/savings-goal-calculator" className="text-orange-600 underline">savings goal calculator</Link> can map out the monthly amount.
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
