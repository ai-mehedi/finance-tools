import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SocialSecurityCalculator from "./SocialSecurityCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/social-security-calculator";
const SELF_SLUG = "social-security-calculator";

const DESC =
  "Free Social Security calculator. See how claiming early or delaying changes your monthly retirement benefit, with a chart comparing your benefit at every age from 62 to 70.";

const baseMetadata: Metadata = {
  title: "Social Security Calculator",
  description: DESC,
  keywords: [
    "social security calculator",
    "social security claiming age",
    "early retirement benefit reduction",
    "delayed retirement credits",
    "when to claim social security",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Social Security Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Social Security Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is full retirement age?",
    answer:
      "Full retirement age, or FRA, is the age at which you receive 100 percent of your earned Social Security benefit. For people born in 1960 or later it is 67, and for those born from 1943 through 1954 it is 66, with a sliding scale in between. Claiming exactly at FRA gives you the full amount.",
  },
  {
    question: "How much does claiming early reduce my benefit?",
    answer:
      "Claiming before full retirement age cuts your benefit by five ninths of one percent per month for the first 36 months early, then five twelfths of one percent for each additional month. At age 62 with an FRA of 67 that works out to a permanent reduction of about 30 percent.",
  },
  {
    question: "Is it worth waiting until 70?",
    answer:
      "Delaying past full retirement age earns delayed retirement credits of about 8 percent per year, or two thirds of one percent per month, until you turn 70. Waiting raises your monthly check for life, which can pay off if you expect a long retirement, but credits stop accruing at age 70.",
  },
  {
    question: "Is this an official Social Security estimate?",
    answer:
      "No. This tool applies the standard early-reduction and delayed-credit rules to a benefit figure you provide, so it is an educational estimate only. For your personalized numbers, create a my Social Security account and use the official statement from the Social Security Administration.",
  },
];

export default async function SocialSecurityCalculatorPage() {
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
    "🧓"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Social Security Calculator",
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
      title="Social Security Calculator"
      intro="See how the age you claim changes your monthly Social Security check. Enter your benefit at full retirement age, choose a claiming age, then press Calculate to compare."
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
            { name: "Social Security Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Social Security Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SocialSecurityCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the Social Security calculator works</H2>
            <P>
              Your benefit is anchored to a single number: the amount you would receive at full
              retirement age. From there, the timing of your claim moves it up or down. The tool
              starts with the figure from your Social Security statement, then applies the official
              reduction for claiming early and the delayed-credit increase for waiting, month by month.
            </P>
            <P>
              The chart lines up your monthly benefit at every age from 62 to 70 so the trade-off is
              easy to see. Your chosen age is highlighted in solid orange, while the lighter bars show
              what the other ages would pay. Each year you wait lifts the bar, up to the cap at 70.
            </P>

            <H2>A quick example</H2>
            <P>
              Suppose your statement shows $2,000 a month at a full retirement age of 67. Claim at 62
              and that drops to roughly $1,400, a permanent 30 percent cut. Wait until 70 and the same
              record pays about $2,480, because three years of 8 percent delayed credits stack on top
              of the full amount.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              The best claiming age depends on your health, savings, spouse, and whether you keep
              working, so treat this as a starting point rather than advice. For the official rules and
              your personal estimate, visit the{" "}
              <a href="https://www.ssa.gov/benefits/retirement/planner/agereduction.html" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Social Security Administration</a>.
              To see how the benefit fits into your broader nest egg, try our{" "}
              <Link href="/calculators/retirement-calculator" className="text-orange-600 underline">retirement calculator</Link>.
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
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-200">
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-orange-600">{a.title}</p>
                    {a.excerpt && <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{a.excerpt}</p>}
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
