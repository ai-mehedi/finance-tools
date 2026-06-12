import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SplitBillCalculator from "./SplitBillCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/split-bill-calculator";
const SELF_SLUG = "split-bill-calculator";

const DESC =
  "Free split bill calculator. Divide a restaurant or group bill across any number of people, add tax and tip, split evenly or by shares, and see exactly what each person owes.";

const baseMetadata: Metadata = {
  title: "Split Bill Calculator",
  description: DESC,
  keywords: [
    "split bill calculator",
    "split the bill",
    "tip calculator",
    "group bill splitter",
    "divide restaurant bill",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Split Bill Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Split Bill Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "How does this split bill calculator handle tip and tax?",
    answer:
      "Enter the pre-tip subtotal as the bill, then a tax percent and a tip percent. The tool applies both to the bill, adds them to find the grand total, and only then divides that total across the group, so every person covers a fair slice of the tip and tax too.",
  },
  {
    question: "Can I split a bill unevenly?",
    answer:
      "Yes. Choose the by shares method and give each person a weight. A weight of two means that person pays twice as much as someone with a weight of one. The calculator scales every share so the weighted amounts always add up to the grand total.",
  },
  {
    question: "Why does rounding up collect a little extra?",
    answer:
      "When you round each person's share up to the next whole dollar, the small leftover cents add up. The tool reports that surplus so you know the group is paying slightly above the bill, which usually goes toward an extra bit of tip.",
  },
  {
    question: "Is the tip calculated on the pre-tax or post-tax amount?",
    answer:
      "This calculator figures the tip from the bill subtotal you enter, which is the pre-tax convention many people prefer. If you would rather tip on the post-tax amount, simply add your tax into the bill figure before calculating.",
  },
];

export default async function SplitBillCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Split Bill Calculator",
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
      title="Split Bill Calculator"
      intro="Splitting a restaurant or group bill? Enter the total, add tax and tip, split it evenly or by shares, then press Calculate to see exactly what each person owes."
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
            { name: "Split Bill Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Split Bill Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SplitBillCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the split bill calculator works</H2>
            <P>
              The tool starts from the bill subtotal you type in. It adds tax and tip as percentages
              of that subtotal to build a grand total, and then divides the grand total across the
              group. Splitting after tip and tax matters: it guarantees nobody quietly skips their
              fair share of the gratuity or the sales tax.
            </P>
            <P>
              Choose split evenly when everyone shared roughly the same, or split by shares when one
              person ordered the expensive steak and another just had a salad. The bar chart shows
              each person side by side so the math is easy to check before anyone pays.
            </P>

            <H2>A quick example</H2>
            <P>
              A $120 dinner for four with 8 percent tax and an 18 percent tip works out to a grand
              total of roughly $151.20. Split evenly, that is about $37.80 each. If one diner had
              double the food, set their share to two and the rest to one, and the tool charges that
              person near $50.40 while the others pay about $25.20.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Some venues add an automatic service charge for large parties, so check the receipt
              before you add your own tip. For guidance on customary tipping in the United States,
              the{" "}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Consumer Financial Protection Bureau</a>{" "}
              offers neutral money basics. If you are dividing rent or shared household costs instead,
              try our{" "}
              <Link href="/calculators/rent-split-calculator" className="text-orange-600 underline">rent split calculator</Link>.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40">
                    <span className="text-sm font-bold text-zinc-900">{a.title}</span>
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
