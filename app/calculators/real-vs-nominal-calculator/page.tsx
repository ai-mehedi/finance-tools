import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import StaticPage, { H2, P } from "../../components/StaticPage";
import BlogCard from "../../components/BlogCard";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import RealVsNominalCalculator from "./RealVsNominalCalculator";
import { getTools, getArticles, getToolBySlug } from "@/lib/queries";
import { abs, breadcrumbSchema, faqSchema, SITE_URL } from "@/lib/seo";
import { toolMetadata } from "@/lib/tool-metadata";

export const revalidate = 3600;

const PATH = "/calculators/real-vs-nominal-calculator";
const SELF_SLUG = "real-vs-nominal-calculator";

const DESC =
  "Free real vs nominal calculator. Convert a nominal return, salary or amount into its real, inflation-adjusted value and see how much purchasing power inflation quietly removes.";

const baseMetadata: Metadata = {
  title: "Real vs Nominal Calculator",
  description: DESC,
  keywords: [
    "real vs nominal calculator",
    "real rate of return",
    "inflation adjusted return",
    "nominal to real",
    "real interest rate",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: PATH,
    siteName: "TopicDrill",
    title: "Real vs Nominal Calculator | TopicDrill",
    description: DESC,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real vs Nominal Calculator | TopicDrill",
    description: DESC,
    images: ["/og.png"],
  },
};

const FAQ = [
  {
    question: "What is the difference between real and nominal?",
    answer:
      "A nominal value is the raw, stated number — the 7 percent your fund reported or the $60,000 on your contract. A real value strips out inflation to show what that number is actually worth in purchasing power. If inflation was 3 percent, a 7 percent nominal return is only about 3.9 percent real.",
  },
  {
    question: "How do you convert nominal to real?",
    answer:
      "The exact formula is real rate = (1 + nominal) ÷ (1 + inflation) − 1. A quick approximation is simply nominal minus inflation, which is close enough at low rates. For a $1,000 amount, the real value is $1,000 ÷ (1 + inflation) for one year.",
  },
  {
    question: "Why does the real return matter more than the nominal?",
    answer:
      "Because you spend purchasing power, not percentages. A savings account paying 4 percent while inflation runs at 5 percent is losing you money in real terms, even though the balance grows. Real figures tell you whether you are genuinely getting ahead.",
  },
  {
    question: "Is the approximation 'nominal minus inflation' accurate?",
    answer:
      "It is a good rough guide and widely used, but it slightly overstates the real rate. At higher inflation the gap matters, so this calculator uses the exact division formula and shows the difference.",
  },
];

export default async function RealVsNominalCalculatorPage() {
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
    "📈"
  );

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Real vs Nominal Calculator",
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
      title="Real vs Nominal Calculator"
      intro="See what a nominal return or amount is really worth after inflation. Enter the nominal figure and the inflation rate, then press Calculate to get the real, inflation-adjusted value."
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
            { name: "Real vs Nominal Calculator", path: PATH },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-6">
        <p className="text-sm font-semibold text-zinc-600">Share this calculator</p>
        <ShareButtons url={abs(PATH)} title="Real vs Nominal Calculator" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RealVsNominalCalculator />

          <div className="mt-8">
            <AdSlot minHeight={120} />
          </div>

          <div className="mt-10">
            <H2>How the real vs nominal calculator works</H2>
            <P>
              Every headline financial number is nominal — it ignores the fact that money buys a little
              less each year. The real value adjusts for inflation so you can compare amounts across time
              on equal footing. This calculator applies the exact relationship, real = (1 + nominal) ÷ (1 +
              inflation) − 1 for rates, and divides amounts by the inflation factor, rather than the rough
              subtraction shortcut.
            </P>
            <P>
              The distinction shows up everywhere: investment returns, savings rates, salaries, pensions
              and the value of a future cash sum. Two investments with the same nominal return can leave
              you very differently off if they were earned in different inflation environments.
            </P>

            <H2>A quick example</H2>
            <P>
              Your portfolio returned 7 percent last year and inflation was 3 percent. The shortcut says
              your real return was 4 percent, but the exact figure is (1.07 ÷ 1.03) − 1 = 3.88 percent.
              Over many years that small gap compounds, which is why long-term plans should be built on
              real, not nominal, numbers.
            </P>

            <H2>Putting real returns to work</H2>
            <P>
              When you project savings or retirement, use a real growth rate so the result is in today's
              money and easy to judge. To model how inflation erodes a fixed amount over time, pair this
              with our{" "}
              <Link href="/calculators/inflation-calculator" className="text-orange-600 underline">inflation calculator</Link>,
              and to see real growth compound, the{" "}
              <Link href="/calculators/compound-interest-calculator" className="text-orange-600 underline">compound interest calculator</Link>{" "}
              accepts whatever rate you choose.
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
