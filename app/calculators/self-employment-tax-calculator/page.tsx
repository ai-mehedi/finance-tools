import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import SelfEmploymentTaxCalculator from "./SelfEmploymentTaxCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/self-employment-tax-calculator";
const SELF_SLUG = "self-employment-tax-calculator";

const DESC =
  "Free self employment tax calculator. Estimate the Social Security and Medicare tax on your net profit, including the Additional Medicare Tax, and see the deductible half of your SE tax.";

const baseMetadata: Metadata = {
  title: "Self Employment Tax Calculator",
  description: DESC,
  keywords: [
    "self employment tax calculator",
    "SE tax calculator",
    "social security and medicare tax",
    "schedule SE estimate",
    "self employed tax",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Self Employment Tax Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Self Employment Tax Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "What is self-employment tax?",
    answer:
      "Self-employment tax is how self-employed people pay into Social Security and Medicare. Employees split these contributions with an employer, but when you work for yourself you cover both halves, which is why the headline rate of 15.3 percent feels steep compared with the amount withheld from a regular paycheck.",
  },
  {
    question: "Why is only part of my profit taxed?",
    answer:
      "Before the tax is figured, your net profit is multiplied by 92.35 percent to reach your net earnings from self-employment. This adjustment mirrors the employer-side payroll tax that a regular employee never sees, so it keeps the self-employed roughly even with employees rather than taxing them on a larger base.",
  },
  {
    question: "How do W-2 wages from a job affect the result?",
    answer:
      "The Social Security portion only applies up to an annual wage base. If a regular job already used part of that base, the calculator subtracts those wages so you are not taxed twice on the same Social Security ceiling. The Medicare portion has no cap, so it still applies to all of your net earnings.",
  },
  {
    question: "Can I deduct any of this tax?",
    answer:
      "Yes. You can deduct half of the base Social Security and Medicare portions of your self-employment tax when figuring your income tax. The calculator shows that deductible half so you can carry it into your wider tax estimate, though it does not reduce the self-employment tax itself.",
  },
];

export default async function SelfEmploymentTaxCalculatorPage() {
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
    name: "Self Employment Tax Calculator",
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
      title="Self Employment Tax Calculator"
      intro="Estimate the Social Security and Medicare tax you owe on freelance or business income. Enter your net profit, any W-2 wages and your filing status, then press Calculate to see the breakdown."
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
            { name: "Self Employment Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Self Employment Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SelfEmploymentTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the self-employment tax calculator works</H2>
            <P>
              The tool follows the same path as Schedule SE. It starts by taking 92.35 percent of your
              net profit to find your net earnings from self-employment, then applies a 12.4 percent
              Social Security rate up to the annual wage base and a 2.9 percent Medicare rate with no
              ceiling. Higher earners also pick up the 0.9 percent Additional Medicare Tax once combined
              income passes the threshold for their filing status.
            </P>
            <P>
              The donut chart splits the total into its three parts so you can see where the money goes.
              The orange wedge is Social Security, the lighter wedge is Medicare, and the grey sliver, if
              present, is the Additional Medicare Tax that only affects higher incomes.
            </P>

            <H2>A worked example</H2>
            <P>
              Imagine a freelancer with 80,000 dollars of net profit and no W-2 wages. Net earnings come
              to 73,880 dollars. Social Security at 12.4 percent adds about 9,161 dollars, Medicare at
              2.9 percent adds roughly 2,143 dollars, and with income below the Additional Medicare
              threshold there is nothing extra. The total self-employment tax is near 11,300 dollars,
              and half of it can be deducted against income tax.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This estimate covers self-employment tax only, not federal or state income tax, and it
              uses standard rates that can change year to year. Self-employed people usually pay through
              quarterly estimated taxes, so check the current figures and rules with the{" "}
              <a href="https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS self-employment tax page</a>{" "}
              before filing. To see how the income side of your business could grow, try our{" "}
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
  return toolMetadata(SELF_SLUG, baseMetadata);
}
