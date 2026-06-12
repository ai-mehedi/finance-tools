import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import StampDutyCalculator from "./StampDutyCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/stamp-duty-calculator";
const SELF_SLUG = "stamp-duty-calculator";

const DESC =
  "Free stamp duty calculator for India. Estimate stamp duty and registration charges on a property purchase by state, see the chargeable value, and find the total cost of buying a home.";

const baseMetadata: Metadata = {
  title: "Stamp Duty Calculator",
  description: DESC,
  keywords: [
    "stamp duty calculator",
    "stamp duty and registration charges",
    "property registration cost",
    "circle rate stamp duty",
    "home buying cost calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Stamp Duty Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stamp Duty Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What value is stamp duty charged on?",
    answer:
      "Stamp duty is charged on the higher of your agreement value and the government-set circle rate, also called the ready reckoner value. If the price you negotiated is below the official rate for that locality, the duty is still calculated on the higher official figure, so this tool always uses the larger of the two.",
  },
  {
    question: "Why do stamp duty rates differ by state and gender?",
    answer:
      "Stamp duty is a state subject, so each state sets its own rate and many also vary it within cities and rural areas. Several states offer a lower rate to women buyers to encourage property ownership, which is why a female buyer in some states pays a couple of percentage points less than a male buyer on the same property.",
  },
  {
    question: "What is the registration charge and is it capped?",
    answer:
      "The registration charge is a separate fee for recording the sale with the sub registrar, usually around one percent of the chargeable value. A few states cap this charge at a fixed maximum, so on a high value property the registration fee stops rising once it hits the cap. Enter a cap in the tool to model that.",
  },
  {
    question: "Are stamp duty and registration charges part of my home loan?",
    answer:
      "Usually not. Lenders typically fund a percentage of the property value but exclude stamp duty and registration, so you generally pay these charges from your own funds at the time of registration. Budget for them on top of your down payment when planning a purchase.",
  },
];

export default async function StampDutyCalculatorPage() {
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
    "🏠"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Stamp Duty Calculator",
    url: abs(PATH),
    description: DESC,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <StaticPage
      title="Stamp Duty Calculator"
      intro="Buying a home? Estimate the stamp duty and registration charges you will pay. Choose your state or enter your own rates, add the property and circle rate values, then press Calculate."
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
            { name: "Stamp Duty Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Stamp Duty Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StampDutyCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the stamp duty calculator works</H2>
            <P>
              The tool first decides the chargeable value, which is the higher of the price in your
              sale agreement and the government circle rate for that location. It then applies your
              state stamp duty rate to that value, adds the registration charge, and reports both the
              total charges and the all-in cost of acquiring the property.
            </P>
            <P>
              Pick a state preset to load indicative rates, or type your own figures if you know the
              exact rate for your locality and buyer category. The donut chart shows how the duty and
              registration fee sit alongside the property value, so you can see at a glance how much
              the paperwork adds to your purchase.
            </P>

            <H2>A quick example</H2>
            <P>
              Consider a flat worth 80 lakh in a Maharashtra city at 6 percent stamp duty and 1
              percent registration, with the registration capped at 30,000. Stamp duty comes to 4.8
              lakh, registration is capped at 30,000, and the total charges are about 5.1 lakh, lifting
              the all-in cost to roughly 85.1 lakh.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Rates change with state budgets, and some states add a small cess or metro surcharge on
              top of the base duty, so confirm the current figure before you register. State
              government portals such as the{" "}
              <a href="https://igrmaharashtra.gov.in" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">Maharashtra IGR site</a>{" "}
              publish the latest rates and ready reckoner values. To plan the loan side of your
              purchase, pair this with our{" "}
              <Link href="/calculators/mortgage-calculator" className="text-orange-600 underline">mortgage calculator</Link>.
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
