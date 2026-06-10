import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import Four01kMatchCalculator from "./Four01kMatchCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/401k-match-calculator";
const SELF_SLUG = "401k-match-calculator";

const DESC =
  "Free 401k match calculator. See how much your employer adds to your retirement account each year and whether you are capturing the full match.";

export const metadata: Metadata = {
  title: "401k Match Calculator",
  description: DESC,
  keywords: [
    "401k match calculator",
    "employer match calculator",
    "401k employer contribution",
    "company match calculator",
    "retirement match calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "401k Match Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "401k Match Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How does a 401k employer match work?",
    answer:
      "Your employer adds money to your 401k based on what you contribute. A common formula is a 50% match up to 6% of pay, meaning the company adds 50 cents for every dollar you defer, on contributions up to 6% of your salary. The match is essentially free money toward retirement.",
  },
  {
    question: "What does 50% match up to 6% mean in dollars?",
    answer:
      "If you earn $70,000 and contribute at least 6%, you put in $4,200 and your employer adds 50% of that, or $2,100. If you contribute less than 6%, the match shrinks in proportion, so you receive less of the available company money.",
  },
  {
    question: "Should I always contribute enough to get the full match?",
    answer:
      "For most people, yes. The employer match is an immediate return on your money that few other investments can match. At minimum, aim to contribute up to the match cap before directing extra savings elsewhere.",
  },
  {
    question: "Does the employer match count toward my contribution limit?",
    answer:
      "No. The annual employee deferral limit set by the IRS applies only to your own contributions. Employer matching dollars fall under a separate, higher combined limit, so the match does not reduce how much you can personally contribute.",
  },
];

export default async function Four01kMatchCalculatorPage() {
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
    "💰"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "401k Match Calculator",
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
      title="401k Match Calculator"
      intro="See how much your employer adds to your 401k each year and whether you are capturing the full match. Enter your salary and plan details, then press Calculate."
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
            { name: "401k Match Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="401k Match Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Four01kMatchCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the 401k match works</H2>
            <P>
              An employer match is extra money your company puts into your retirement account based on
              what you contribute. The most common structure is a partial match, such as 50 cents on
              the dollar up to 6% of your pay. Some employers offer a full dollar-for-dollar match,
              which is even more valuable.
            </P>
            <P>
              The key detail is the cap. The match applies only to contributions up to a set
              percentage of salary. If you contribute below that cap, you forfeit part of the match,
              which is why this calculator highlights any company money you are leaving behind.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose you earn $70,000 and your plan matches 50% up to 6%. Contribute 6% and you put
              in $4,200 while your employer adds $2,100, for $6,300 a year. Contribute only 3% and the
              employer match falls to about $1,050, so you lose roughly half of the free money.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Capturing the full match is usually the first priority in any savings plan. Watch for
              vesting schedules, which can require a few years of service before employer money is
              fully yours. For official contribution limits and rules, see the{" "}
              <a href="https://www.irs.gov" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS</a>.
              You can also plan growth with our{" "}
              <Link href="/calculators/compound-interest-calculator" className="text-orange-600 underline">compound interest calculator</Link>.
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
