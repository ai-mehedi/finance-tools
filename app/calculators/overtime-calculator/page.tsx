import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import OvertimeCalculator from "./OvertimeCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/overtime-calculator";
const SELF_SLUG = "overtime-calculator";

const DESC =
  "Free overtime pay calculator. Work out your gross weekly paycheck from regular and overtime hours at time-and-a-half or double time, with an hour-by-hour pay chart.";

const baseMetadata: Metadata = {
  title: "Overtime Pay Calculator",
  description: DESC,
  keywords: [
    "overtime calculator",
    "overtime pay calculator",
    "time and a half calculator",
    "double time pay",
    "weekly paycheck calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Overtime Pay Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Overtime Pay Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How is overtime pay calculated?",
    answer:
      "Overtime pay is your hourly rate multiplied by an overtime multiplier, then multiplied by the number of overtime hours. The most common multiplier is one and a half, so a 22 dollar an hour wage becomes 33 dollars an hour for each overtime hour. Your regular hours are still paid at the base rate and added on top.",
  },
  {
    question: "What does time-and-a-half mean?",
    answer:
      "Time-and-a-half is a multiplier of 1.5. For every overtime hour you earn your normal rate plus half of it again. Double time means a multiplier of 2, where each overtime hour pays twice the base rate. This calculator lets you pick either one or enter a custom multiplier.",
  },
  {
    question: "When do overtime hours start?",
    answer:
      "Under the United States Fair Labor Standards Act, non-exempt employees generally earn overtime for hours worked beyond 40 in a single workweek. Some states and contracts add daily overtime or higher multipliers. Enter your own regular-hour cap and overtime hours so the result matches your specific rules.",
  },
  {
    question: "Is the result before or after tax?",
    answer:
      "This calculator shows gross pay, which is your earnings before any deductions. Income tax, Social Security, Medicare and benefits all come out afterward, so your take-home amount will be lower. Treat the figure here as the top-line number on your paycheck for that week.",
  },
];

export default async function OvertimeCalculatorPage() {
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
    "⏱️"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Overtime Pay Calculator",
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
      title="Overtime Pay Calculator"
      intro="Find out what a week of long hours is really worth. Enter your hourly rate, regular and overtime hours and an overtime multiplier, then press Calculate to see your gross pay."
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
            { name: "Overtime Pay Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Overtime Pay Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OvertimeCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the overtime pay calculator works</H2>
            <P>
              The tool splits your week into two buckets. Regular hours are paid at your base rate,
              and overtime hours are paid at that rate multiplied by your chosen factor. It adds the
              two together for your gross weekly pay and isolates the overtime premium, the extra
              dollars you earn only because those hours were paid above the normal rate.
            </P>
            <P>
              The bar chart shows the pay earned in each individual hour of the week. The shorter bars
              are your regular hours, and the taller ones are overtime, so you can see at a glance how
              much more each late hour is worth compared with a standard one.
            </P>

            <H2>A quick example</H2>
            <P>
              Say you earn 22 dollars an hour, work 40 regular hours and 8 overtime hours at
              time-and-a-half. Your regular pay is 880 dollars and your overtime rate is 33 dollars an
              hour, so the 8 overtime hours add 264 dollars. Your gross pay for the week is 1,144
              dollars, of which 88 dollars is the overtime premium above plain pay.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Rules vary by employer, state and country, so confirm your overtime threshold and
              multiplier before relying on a number. The United States Department of Labor explains
              the federal standard on its{" "}
              <a href="https://www.dol.gov/agencies/whd/overtime" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">overtime pay page</a>.
              To see how a steady habit of saving part of that extra pay could grow, run the figure
              through our{" "}
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

export async function generateMetadata(): Promise<Metadata> {
  const self = await getToolBySlug(SELF_SLUG);
  if (!self?.ogImage) return baseMetadata;
  return {
    ...baseMetadata,
    openGraph: { ...(baseMetadata.openGraph as object), images: [{ url: self.ogImage }] },
    twitter: { ...(baseMetadata.twitter as object), card: "summary_large_image", images: [self.ogImage] },
  };
}
