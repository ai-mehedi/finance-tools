import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import InvoiceCalculator from "./InvoiceCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/invoice-calculator";
const SELF_SLUG = "invoice-calculator";

const DESC =
  "Free invoice total calculator. Add line items with quantity and unit price, apply a percentage discount, sales tax and shipping, and see the subtotal, tax and grand total instantly.";

export const metadata: Metadata = {
  title: "Invoice Total Calculator",
  description: DESC,
  keywords: [
    "invoice calculator",
    "invoice total calculator",
    "line item calculator",
    "sales tax invoice",
    "billing calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: "Invoice Total Calculator | TopicDrill", description: DESC },
  twitter: { card: "summary", title: "Invoice Total Calculator | TopicDrill", description: DESC },
};

const FAQ = [
  {
    question: "How is the invoice total calculated?",
    answer:
      "Each line is quantity times unit price, and those amounts add up to the subtotal. Any percentage discount is taken off the subtotal first, then tax is charged on the discounted amount, and finally a flat shipping fee is added to reach the grand total.",
  },
  {
    question: "Is tax applied before or after the discount?",
    answer:
      "This calculator applies the discount first and then charges tax on the lower, post-discount amount. That mirrors how most jurisdictions treat a straightforward percentage discount, since you only owe tax on what the customer actually pays for the goods.",
  },
  {
    question: "Is shipping taxed in this tool?",
    answer:
      "No. The shipping fee here is added after tax as a flat charge and is not itself taxed. Rules vary by region, so if your local rules tax shipping, fold that fee into a taxed line item instead of the separate shipping box.",
  },
  {
    question: "Can I bill several items at once?",
    answer:
      "Yes. Use Add line to create as many rows as you need, each with its own description, quantity and unit price. The itemised breakdown lists every row so you can copy the figures straight onto a written invoice.",
  },
];

export default async function InvoiceCalculatorPage() {
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
    name: "Invoice Total Calculator",
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
      title="Invoice Total Calculator"
      intro="Build an invoice line by line and watch the math add up. Enter each item, apply a discount, tax and shipping, then press Calculate to get a clean subtotal, tax and grand total."
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
            { name: "Invoice Total Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Invoice Total Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InvoiceCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the invoice total calculator works</H2>
            <P>
              The calculator treats your invoice as a stack of line items. It multiplies the quantity
              of each item by its unit price, sums those amounts into a subtotal, then layers on the
              adjustments a real bill needs: a percentage discount, sales tax or VAT, and a flat
              shipping fee. The result is the exact figure your customer owes.
            </P>
            <P>
              Order matters. The discount comes off first, so tax is charged on the reduced amount
              rather than the full list price. Shipping is added last and is left untaxed, which keeps
              the breakdown easy to read and matches the layout of most printed invoices.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you bill ten hours of design at 85 dollars, one hosting setup at 150 dollars and
              four stock photos at 12 dollars. That is a subtotal of 1,048 dollars. A 10 percent
              discount removes 104.80 dollars, leaving 943.20 dollars. Sales tax of 8.25 percent on
              that base adds 77.81 dollars, so with no shipping the invoice total comes to 1,021.01
              dollars.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Tax rules differ by location, and some places tax shipping or handle discounts
              differently, so confirm the right treatment before sending a formal bill. For United
              States sales tax guidance you can check your state revenue site via the{" "}
              <a href="https://www.usa.gov/state-taxes" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">USA.gov state taxes directory</a>.
              If you also need to price a discount on its own, the{" "}
              <Link href="/calculators/discount-calculator" className="text-orange-600 underline">discount calculator</Link> works well alongside this tool.
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
