import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RentSplitCalculator from "./RentSplitCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/rent-split-calculator";
const SELF_SLUG = "rent-split-calculator";

const DESC =
  "Free rent split calculator. Divide rent and shared utilities between roommates evenly, by room size, or by income, with a donut chart showing each person's share.";

const baseMetadata: Metadata = {
  title: "Rent Split Calculator",
  description: DESC,
  keywords: [
    "rent split calculator",
    "split rent by room size",
    "roommate rent calculator",
    "fair rent split",
    "rent and utilities split",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Rent Split Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Rent Split Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How should roommates split rent fairly?",
    answer:
      "There is no single right answer, but the fairest splits tie each person's payment to what they use. Splitting by private room size charges more to whoever has the larger bedroom, while splitting by income keeps the rent proportional to what each person can afford. An even split is simplest when rooms and budgets are similar.",
  },
  {
    question: "Should utilities be split the same way as rent?",
    answer:
      "Usually not. This calculator always divides utilities evenly because electricity, water and internet pay for the shared parts of the home that everyone uses regardless of room size or income. Only the base rent is weighted by the method you choose.",
  },
  {
    question: "How does the room-size method work?",
    answer:
      "Each person's rent is set in proportion to their private bedroom's square footage. If one room is 180 square feet and another is 120 square feet, the first roommate pays 180 divided by the total square footage of all rooms, times the rent. Bigger room, bigger share.",
  },
  {
    question: "Is splitting rent by income legal and common?",
    answer:
      "Splitting rent by income is a private agreement between roommates and is perfectly allowed. It is common among couples or friends with very different earnings who still want to share a nicer place. Put whatever method you agree on in writing so everyone is clear on the monthly amounts.",
  },
];

export default async function RentSplitCalculatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rent Split Calculator",
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
      title="Rent Split Calculator"
      intro="Work out a fair share of the rent for every roommate. Choose an even split, split by room size, or split by income, add your shared utilities, and press Calculate."
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
            { name: "Rent Split Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Rent Split Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RentSplitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the rent split calculator works</H2>
            <P>
              Rent fairness comes down to one question: should everyone pay the same, or should the
              person with the bigger room or the bigger paycheck pay more? This tool keeps the base
              rent flexible while always dividing shared utilities evenly, because the kitchen, the
              wifi and the heat serve the whole household no matter whose room is largest.
            </P>
            <P>
              Pick a method, type in each roommate's room size and income, and the calculator turns
              those numbers into weights. The donut chart shows the resulting split at a glance, and
              the results panel compares every share against a plain even split so you can see exactly
              who is paying more or less and by how much.
            </P>

            <H2>A quick example</H2>
            <P>
              Say the rent is $2,400, utilities are $300, and you split by room size. The rooms are
              180, 140 and 120 square feet, totalling 440. The person in the largest room pays 180
              divided by 440 of the rent, about $982, plus $100 of utilities, for $1,082. The smallest
              room pays roughly $655 in rent plus the same $100, for $755. Everyone covers an equal
              slice of the utilities, but the rent tracks the space they actually have.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Weighting by room size assumes the bedrooms are the main difference; if one room has a
              private bathroom or a balcony, you may want to nudge its share up by hand. Whatever you
              agree on, get it in writing, especially on a joint lease where everyone is on the hook
              for the full rent. For tenant rights and lease basics, the{" "}
              <a href="https://www.hud.gov/topics/rental_assistance/tenantrights" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">HUD tenant rights</a>{" "}
              page is a neutral starting point. To divide one-off shared costs like groceries or a
              cleaner, try our{" "}
              <Link href="/calculators/bill-split-calculator" className="text-orange-600 underline">bill split calculator</Link>.
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
