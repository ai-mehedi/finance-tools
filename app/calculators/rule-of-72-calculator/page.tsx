import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RuleOf72Calculator from "./RuleOf72Calculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/rule-of-72-calculator";
const SELF_SLUG = "rule-of-72-calculator";

const DESC =
  "Free Rule of 72 calculator. Estimate how many years it takes your money to double at a given return, or the return you need to double in a set time, with the exact figure alongside.";

const baseMetadata: Metadata = {
  title: "Rule of 72 Calculator",
  description: DESC,
  keywords: [
    "rule of 72 calculator",
    "doubling time calculator",
    "money doubling rule",
    "rule of 72",
    "compound interest doubling",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Rule of 72 Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Rule of 72 Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is the Rule of 72?",
    answer:
      "The Rule of 72 is a mental shortcut for estimating how long an investment takes to double. Divide 72 by the annual return written as a whole number, and the answer is roughly the number of years to double. At 8 percent, 72 divided by 8 gives about 9 years.",
  },
  {
    question: "How accurate is the Rule of 72?",
    answer:
      "It is surprisingly close for rates between about 6 and 10 percent, where it lands within a fraction of a year of the exact answer. At very low or very high rates the gap widens, which is why this tool shows the exact doubling time from the compound interest formula next to the estimate.",
  },
  {
    question: "Why 72 and not another number?",
    answer:
      "The true math uses the natural logarithm of 2, which is about 69.3. Seventy two is used instead because it divides cleanly by many common rates such as 2, 3, 4, 6, 8, 9 and 12, making the arithmetic easy to do in your head.",
  },
  {
    question: "Can I use the Rule of 72 for inflation?",
    answer:
      "Yes. Divide 72 by the inflation rate to estimate how many years it takes prices to double and your money to lose half its buying power. At 3 percent inflation, 72 divided by 3 is about 24 years to halve your purchasing power.",
  },
];

export default async function RuleOf72CalculatorPage() {
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
    "⏳"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rule of 72 Calculator",
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
      title="Rule of 72 Calculator"
      intro="Estimate how fast your money doubles. Enter a return to see the years it takes, or a horizon to see the return you would need, with the exact figure shown alongside the rule of thumb."
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
            { name: "Rule of 72 Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Rule of 72 Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RuleOf72Calculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the Rule of 72 calculator works</H2>
            <P>
              The rule is built on a single division. To estimate doubling time, the tool divides 72
              by the annual return. To estimate the return you would need, it divides 72 by your
              chosen horizon. Either way the result is a quick approximation you could check in your
              head, and the tool then puts the exact compound interest answer right next to it.
            </P>
            <P>
              The chart traces each doubling along a timeline. The first marker is your starting
              amount, the next is twice that, then four times, and so on. Because doublings are
              evenly spaced in time at a fixed rate, the curve steepens sharply as the balance climbs.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn 8 percent a year. Dividing 72 by 8 gives 9 years to double, and the
              exact formula lands at about 9.0 years too. So $10,000 becomes roughly $20,000 in nine
              years, $40,000 in eighteen, and $80,000 in twenty seven, without you adding a cent.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The rule assumes a steady return, which real markets never deliver, so treat the output
              as a back of the envelope guide rather than a forecast. For a primer on how compounding
              actually builds wealth, the{" "}
              <a href="https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">SEC compound interest calculator</a>{" "}
              is a neutral reference. To project a full balance with contributions, try our{" "}
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40">
                    <span className="text-sm font-bold text-zinc-900 group-hover:text-orange-600">{a.title}</span>
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
