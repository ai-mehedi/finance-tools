import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import EnvelopeBudgetCalculator from "./EnvelopeBudgetCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/envelope-budget-calculator";
const SELF_SLUG = "envelope-budget-calculator";

const DESC =
  "Free envelope budget calculator. Split your monthly take-home pay into spending envelopes, see what is left to allocate, and view a donut chart of where every dollar goes.";

export const metadata: Metadata = {
  title: "Envelope Budget Calculator",
  description: DESC,
  keywords: [
    "envelope budget calculator",
    "cash envelope system",
    "zero based budget",
    "monthly budget planner",
    "envelope budgeting",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Envelope Budget Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Envelope Budget Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "What is the envelope budgeting method?",
    answer:
      "It is a system where you divide your take-home pay into separate categories, or envelopes, such as rent, groceries and savings. Each envelope gets a set amount for the month, and once an envelope is empty you stop spending in that category until the next month.",
  },
  {
    question: "What does it mean when the calculator says I have money left to allocate?",
    answer:
      "It means the total you have placed into envelopes is less than your income, so some money is still unassigned. The goal of envelope budgeting is usually to give every dollar a job, so you would keep adding to envelopes until the leftover reaches zero.",
  },
  {
    question: "What happens if I overspend my income?",
    answer:
      "If your envelopes add up to more than your take-home pay, the calculator shows an over budget figure in red. That signals you have planned to spend more than you earn, so you need to trim one or more envelopes or increase income before the month begins.",
  },
  {
    question: "Do I need physical cash to use this method?",
    answer:
      "No. The envelopes can be real cash, separate bank sub-accounts, or simply tracked categories in an app. This calculator works the same way regardless of whether you hold actual cash, because it only plans how your income is divided.",
  },
];

export default async function EnvelopeBudgetCalculatorPage() {
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
    "✉️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Envelope Budget Calculator",
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
      title="Envelope Budget Calculator"
      intro="Give every dollar a job. Enter your monthly take-home pay, fund each spending envelope, and instantly see what is left to allocate plus a chart of where your money goes."
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
            { name: "Envelope Budget Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Envelope Budget Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnvelopeBudgetCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the envelope budget calculator works</H2>
            <P>
              The tool starts with your monthly take-home pay, the amount that actually lands in your
              account after taxes and deductions. You then create an envelope for each category you
              spend on and decide how much of that pay goes into each one. As you fund envelopes, the
              calculator subtracts the total from your income and reports the balance still waiting to
              be assigned.
            </P>
            <P>
              The donut chart turns those numbers into a picture. Each slice is one envelope sized by
              its share of your income, so you can see at a glance whether housing is swallowing half
              your paycheck or whether your savings slice is as large as you would like.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you bring home 4,500 dollars a month. You put 1,400 toward housing, 500 toward
              groceries, 300 toward transport, 220 toward utilities, 600 into savings and 350 for fun.
              That allocates 3,370 dollars and leaves 1,130 unassigned. To run a true zero-based
              budget, you would raise existing envelopes or add new ones until that leftover hits
              zero.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Build the system around real spending, not wishful thinking. Look back at a few months
              of statements before you size each envelope. For a neutral primer on budgeting basics,
              see the{" "}
              <a href="https://www.consumerfinance.gov/consumer-tools/budgeting/" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">CFPB budgeting guide</a>.
              Once your envelopes are set, route any leftover into investing and project its growth
              with our{" "}
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
