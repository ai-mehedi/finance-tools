import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import GiftTaxCalculator from "./GiftTaxCalculator";
import { getRelatedTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, EDITORIAL, personSchema, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PATH = "/calculators/gift-tax-calculator";
const SELF_SLUG = "gift-tax-calculator";

const DESC =
  "Free US gift tax calculator. See how much of a gift is covered by the annual exclusion, how much uses your lifetime exemption and whether any 40 percent gift tax is due.";

const baseMetadata: Metadata = {
  title: "Gift Tax Calculator",
  description: DESC,
  keywords: [
    "gift tax calculator",
    "annual gift exclusion",
    "lifetime gift exemption",
    "federal gift tax",
    "gift tax 2025",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, siteName: "TopicDrill", title: "Gift Tax Calculator | TopicDrill", description: DESC, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Gift Tax Calculator | TopicDrill", description: DESC, images: ["/og.png"] },
};

const FAQ = [
  {
    question: "How much can I gift tax free each year?",
    answer:
      "In 2025 you can give up to $19,000 per recipient per year with no gift tax and no reporting. A married couple can combine their exclusions to give up to $38,000 to each person through gift splitting.",
  },
  {
    question: "What is the lifetime gift exemption?",
    answer:
      "Gifts above the annual exclusion do not trigger tax right away. Instead they reduce your lifetime exemption, which is $13.99 million per person in 2025 and is shared with the estate tax. Tax is owed only once that exemption is used up.",
  },
  {
    question: "Who pays the gift tax?",
    answer:
      "The person making the gift is responsible for any gift tax, not the recipient. In practice very few people ever owe it because the lifetime exemption is so large. The top federal gift tax rate is 40 percent.",
  },
  {
    question: "Do I need to file a gift tax return?",
    answer:
      "If you give any single person more than the annual exclusion in a year, you generally must file IRS Form 709, even when no tax is due. The form tracks how much of your lifetime exemption you have used.",
  },
];

export default async function GiftTaxCalculatorPage() {
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
    "🎁"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gift Tax Calculator",
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
      title="Gift Tax Calculator"
      intro="See how a gift is treated under US federal rules: what the annual exclusion covers, what counts against your lifetime exemption and whether any tax is due. Enter the details, then press Calculate."
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
            { name: "Gift Tax Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Gift Tax Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GiftTaxCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the gift tax calculator works</H2>
            <P>
              The tool applies the federal rules in two steps. First it removes the annual exclusion,
              which is per recipient, so a gift split across several people is shielded more. Whatever
              is left is the taxable gift that counts against your lifetime exemption.
            </P>
            <P>
              Next it checks how much lifetime exemption you have left. The taxable gift reduces that
              balance, and only if the exemption runs out does any tax apply, at a flat 40 percent on
              the excess. For most people the exemption easily absorbs the gift, so the tax is zero.
            </P>

            <H2>A quick example</H2>
            <P>
              Give one person $50,000 in 2025 as a single donor. The first $19,000 is excluded, so
              $31,000 is a taxable gift. With your full lifetime exemption available, that $31,000
              simply reduces your exemption to about $13.96 million and no tax is owed, though Form 709
              is still required.
            </P>

            <H2>Things to keep in mind</H2>
            <P>
              This calculator uses 2025 federal figures and ignores state gift taxes and special
              rules such as the unlimited spousal and tuition exclusions. Always confirm with the{" "}
              <a href="https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes" target="_blank" rel="nofollow noopener" className="text-orange-600 underline">IRS gift tax guidance</a>{" "}
              or a tax professional. To plan ahead, see our{" "}
              <Link href="/calculators/estate-tax-calculator" className="text-orange-600 underline">estate tax calculator</Link>.
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
