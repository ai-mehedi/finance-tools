import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import GstCalculator from "./GstCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/gst-calculator";
const SELF_SLUG = "gst-calculator";

const DESC =
  "Free GST calculator. Add or remove Goods and Services Tax from any price, pick a slab from 0 to 28 percent, and see the net amount split into CGST, SGST or IGST.";

const baseMetadata: Metadata = {
  title: "GST Calculator",
  description: DESC,
  keywords: [
    "gst calculator",
    "goods and services tax calculator",
    "cgst sgst calculator",
    "add gst to price",
    "reverse gst calculator",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "GST Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "GST Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How do I add GST to a price?",
    answer:
      "Multiply the net amount by the GST rate written as a fraction, then add it back. For an 18 percent slab on a net of 1000, the GST is 1000 times 0.18 which is 180, so the final price is 1180. Choose the exclusive mode in this tool to do that automatically.",
  },
  {
    question: "How do I remove GST from a price that already includes it?",
    answer:
      "Divide the gross price by one plus the rate as a fraction. For a price of 1180 that includes 18 percent GST, the net is 1180 divided by 1.18 which is 1000, and the GST portion is 180. Pick the inclusive mode to reverse the tax this way.",
  },
  {
    question: "What is the difference between CGST, SGST and IGST?",
    answer:
      "For a sale within the same state the GST is split equally into CGST collected by the centre and SGST collected by the state. For a sale across state lines a single IGST is charged instead at the full rate. This calculator shows whichever split matches the supply type you choose.",
  },
  {
    question: "Which GST rate should I use?",
    answer:
      "It depends on the item. Common slabs are 5 percent for essentials, 12 and 18 percent for most goods and services, and 28 percent for luxury or sin items, with some goods at 0 or 3 percent. Check the official rate for your specific product before relying on the figure.",
  },
];

export default async function GstCalculatorPage() {
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
    "🧾"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GST Calculator",
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
      title="GST Calculator"
      intro="Add or strip Goods and Services Tax from any amount in seconds. Choose a slab, decide whether your figure is before or after tax, and see the CGST, SGST or IGST split instantly."
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
            { name: "GST Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="GST Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GstCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the GST calculator works</H2>
            <P>
              Goods and Services Tax is a percentage added on top of the value of a product or
              service. This tool works both ways. In exclusive mode it treats your figure as the net
              price and adds tax on top. In inclusive mode it treats your figure as the final price
              and works backwards to reveal how much of it was tax.
            </P>
            <P>
              Once the tax is calculated, the tool splits it according to the supply type. A sale
              within a single state is divided into equal halves of CGST and SGST, while a sale that
              crosses state borders is charged as one combined IGST. The donut chart shows how the
              net amount and the tax components make up the final price.
            </P>

            <H2>A worked example</H2>
            <P>
              Suppose you invoice a client 25,000 for design work taxed at the 18 percent slab within
              your own state. The GST comes to 4,500, made up of 2,250 CGST and 2,250 SGST, so the
              client pays 29,500 in total. If the same client were in another state, the entire 4,500
              would appear as a single IGST line instead.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              Always confirm the correct slab for your goods or service, since applying the wrong rate
              affects your invoice and filings. For the authoritative rules and rate finder, see the{" "}
              <a href="https://www.gst.gov.in" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">official GST portal</a>.
              If you are pricing a product and want to layer a markup before tax, our{" "}
              <Link href="/calculators/discount-calculator" className="text-orange-600 underline">discount calculator</Link>{" "}
              can help you set the net figure first.
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
