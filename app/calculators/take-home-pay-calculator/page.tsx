import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import TakeHomePayCalculator from "./TakeHomePayCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/take-home-pay-calculator";
const SELF_SLUG = "take-home-pay-calculator";

const DESC =
  "Free take home pay calculator. Turn your gross salary into net pay after federal income tax, Social Security, Medicare, state tax and pre-tax deductions, with a paycheck breakdown chart.";

const baseMetadata: Metadata = {
  title: "Take Home Pay Calculator",
  description: DESC,
  keywords: [
    "take home pay calculator",
    "net pay calculator",
    "paycheck calculator",
    "salary after tax",
    "net salary calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Take Home Pay Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Take Home Pay Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What does take-home pay mean?",
    answer:
      "Take-home pay, also called net pay, is the money that actually lands in your bank account after taxes and deductions come out of your gross salary. It is what you have left to spend, save or invest each pay period.",
  },
  {
    question: "Which taxes are withheld from a paycheck?",
    answer:
      "Most paychecks have federal income tax, Social Security at 6.2 percent up to the annual wage base, and Medicare at 1.45 percent. Many workers also pay state income tax. Pre-tax items like 401(k) and health premiums are subtracted before income tax is figured.",
  },
  {
    question: "Why is my net pay lower than my salary divided by 12?",
    answer:
      "Your gross salary is the figure before any withholding. Once federal tax, FICA, state tax and benefit deductions are removed, the remaining net pay is smaller. This tool shows each slice so you can see exactly where the difference goes.",
  },
  {
    question: "Do pre-tax deductions increase my take-home pay?",
    answer:
      "Pre-tax deductions lower the income that federal and state taxes are calculated on, so they reduce your tax bill. The contribution itself still leaves your paycheck, but you keep more of every dollar than if you were taxed on it first.",
  },
];

export default async function TakeHomePayCalculatorPage() {
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
    "💵"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Take Home Pay Calculator",
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
      title="Take Home Pay Calculator"
      intro="See what actually hits your bank account. Enter your gross salary, filing status, state rate and pre-tax deductions, then press Calculate to estimate your net paycheck."
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
            { name: "Take Home Pay Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Take Home Pay Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TakeHomePayCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the take-home pay calculator works</H2>
            <P>
              The tool starts with your gross salary and removes each layer of withholding in the
              order a payroll system does. Pre-tax deductions come off first, then federal income tax
              is figured on the remaining wages after the standard deduction, using progressive
              brackets. Social Security and Medicare are charged on your full gross wage, and a flat
              state rate is applied to your taxable wages.
            </P>
            <P>
              The donut chart splits every gross dollar into its destination, so you can instantly
              see how much stays with you and how much goes to each tax. Switch the pay period to view
              your net amount weekly, bi-weekly, monthly or per year.
            </P>

            <H2>A quick example</H2>
            <P>
              A single filer earning $75,000 who contributes $6,000 a year to a 401(k) in a state with
              a 5 percent income tax keeps roughly 74 to 76 percent of gross pay. On a bi-weekly cycle
              that is about $2,100 to $2,150 per paycheck, with federal tax and FICA making up the
              largest withheld slices.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This is an estimate using 2024 federal brackets and a single flat state rate, so it will
              not capture local taxes, additional Medicare on high earners, or credits. For the
              official withholding worksheet, see the{" "}
              <a href="https://www.irs.gov/individuals/tax-withholding-estimator" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS Tax Withholding Estimator</a>.
              To see how a raise pushes income into a new band, try our{" "}
              <Link href="/calculators/tax-bracket-calculator" className="text-orange-600 underline">tax bracket calculator</Link>.
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
