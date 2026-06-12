import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TipCalculator from "./TipCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/tip-calculator";
const SELF_SLUG = "tip-calculator";

const DESC =
  "Free tip calculator. Work out the gratuity, the grand total and each person's share for any bill, tip on the pre-tax subtotal if you prefer, round up to whole dollars, and compare common tip rates side by side.";

const baseMetadata: Metadata = {
  title: "Tip Calculator",
  description: DESC,
  keywords: [
    "tip calculator",
    "gratuity calculator",
    "split the bill calculator",
    "tip percentage",
    "restaurant tip calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Tip Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tip Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "Should I tip on the pre-tax amount or the full bill?",
    answer:
      "Both are common and either is acceptable. Tipping on the pre-tax subtotal excludes sales tax from the calculation, so it is slightly cheaper and arguably fairer because tax is not a service the server provided. Many people simply tip on the total because it is easier to eyeball. This calculator lets you pick whichever base you prefer and shows the difference.",
  },
  {
    question: "What is a standard tip percentage at a restaurant?",
    answer:
      "In the United States, 15 percent is often considered the floor for adequate sit-down service, 18 to 20 percent is the common range for good service, and 25 percent or more rewards exceptional service. Quick counter service, takeout and delivery tend to run lower. Norms vary by country, so the right number depends on local custom.",
  },
  {
    question: "How does rounding up the total work?",
    answer:
      "When you turn on round up, the calculator raises the grand total to the next whole dollar and adds the difference to the tip. That keeps the math tidy for cash payers and nudges the gratuity slightly higher. The per-person figure is then taken from the rounded total, so everyone splits the same clean number.",
  },
  {
    question: "How is the bill split between people?",
    answer:
      "After the tip is added, the calculator divides the grand total by the number of people to give an equal per-person share, and also shows how much of that share is tip. It assumes an even split. If diners ordered very different amounts, you may want to apportion the bill by each person's items first and then apply the tip percentage to each share.",
  },
];

export default async function TipCalculatorPage() {
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
    name: "Tip Calculator",
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
      title="Tip Calculator"
      intro="Enter the bill, choose a tip percentage and the number of people, and instantly see the tip, the total and each person's share. Tip on the pre-tax amount or round up if you like."
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
            { name: "Tip Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Tip Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TipCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the tip calculator works</H2>
            <P>
              The calculator starts from the bill as printed. If you tell it the sales tax rate baked
              into that figure, it backs out the pre-tax subtotal so you can choose to tip on either the
              full amount or just the food and service. It then applies your tip percentage, adds it to
              the bill, optionally rounds the total up to the next whole dollar, and divides by the size
              of your party.
            </P>
            <P>
              The bar chart compares the grand total at five common tip rates so you can see, at a glance,
              what a few extra percentage points actually cost on this particular bill. On a small check
              the difference between 15 and 25 percent is often just a couple of dollars per person.
            </P>

            <H2>A quick example</H2>
            <P>
              Say the bill is 84.50 dollars, including 8 percent sales tax, split between two people at a
              20 percent tip on the full amount. The tip works out to about 16.90 dollars, the total to
              roughly 101.40 dollars, and each person pays a little over 50 dollars. Switch the tip to the
              pre-tax subtotal and the gratuity drops by just over a dollar.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Tipping customs differ widely around the world, and in some countries a service charge is
              already added to the bill, in which case an extra tip is optional. The U.S. Department of
              Labor explains how tips interact with wages in its{" "}
              <a href="https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">tipped-employee fact sheet</a>.
              When a group is settling up after a meal, our{" "}
              <Link href="/calculators/percentage-calculator" className="text-orange-600 underline">percentage calculator</Link> can help with any uneven splits.
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
