import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import BillSplitCalculator from "./BillSplitCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/bill-split-calculator";
const SELF_SLUG = "bill-split-calculator";

const DESC =
  "Free bill split calculator. Split a restaurant or group bill evenly, add a tip, and see exactly how much each person owes, rounded up to the cent.";

export const metadata: Metadata = {
  title: "Bill Split Calculator",
  description: DESC,
  keywords: [
    "bill split calculator",
    "split the bill",
    "tip and split calculator",
    "restaurant bill splitter",
    "split bill with tip",
    "group bill calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Bill Split Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Bill Split Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How do I split a bill with tip?",
    answer:
      "Add the tip to the bill first, then divide by the number of people. For example, a $120 bill with an 18% tip is $141.60 total, which split four ways is $35.40 each. This calculator does that math for you instantly.",
  },
  {
    question: "How much should I tip?",
    answer:
      "In the United States, 15% to 20% is standard for sit-down restaurant service, with 18% a common middle choice. Use the preset buttons to switch quickly, or type a custom percentage for delivery, large groups or exceptional service.",
  },
  {
    question: "Why is the per-person amount rounded up?",
    answer:
      "Dividing evenly can leave fractions of a cent. Rounding each share up to the nearest cent guarantees the group collects at least the full bill plus tip, so the table is never a few cents short when the check is paid.",
  },
  {
    question: "Can I split a bill unevenly?",
    answer:
      "This tool splits the total evenly across everyone, which covers most shared meals and group outings. For uneven shares, total each person's items first, then apply the tip percentage to each subtotal separately.",
  },
];

export default async function BillSplitCalculatorPage() {
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
    name: "Bill Split Calculator",
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
      title="Bill Split Calculator"
      intro="Split a restaurant or group bill evenly, add a tip, and see what each person owes. Enter the bill, tip and headcount, then press Calculate."
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
            { name: "Bill Split Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Bill Split Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BillSplitCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the bill split calculator works</H2>
            <P>
              The tool takes your bill, adds the tip as a percentage of that amount, and divides the
              total evenly by the number of people. It rounds each share up to the nearest cent so the
              group always collects enough to cover the full check, which avoids the awkward moment
              where the pooled cash comes up a few cents short.
            </P>
            <P>
              Use the preset tip buttons for quick choices, or type any custom percentage. Everything
              updates as soon as you press Calculate, so it is easy to try different tip levels or group
              sizes.
            </P>

            <H2>A quick example</H2>
            <P>
              A $120 dinner with a 20% tip comes to $144 total. Split between four friends, that is
              exactly $36 each. Bump the tip to 25% and the total becomes $150, or $37.50 per person.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The split is even, so if one person ordered far more, total their items separately first.
              Tipping norms vary by country and service type. For everyday money habits and budgeting,
              browse our{" "}
              <Link href="/calculators" className="text-orange-600 underline">free calculators</Link>,
              including the{" "}
              <Link href="/calculators/tip-calculator" className="text-orange-600 underline">tip calculator</Link>{" "}
              for single-person tipping.
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
