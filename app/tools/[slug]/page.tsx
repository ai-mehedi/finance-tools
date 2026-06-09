import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import Newsletter from "../../components/Newsletter";
import Footer from "../../components/Footer";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import { getToolBySlug } from "@/lib/queries";
import { webAppSchema, faqSchema, breadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };
  const title = tool.metaTitle || tool.title;
  const description = tool.metaDescription || tool.description;
  return {
    title,
    description,
    alternates: { canonical: `/tools/${slug}` },
    openGraph: {
      type: "website",
      url: `/tools/${slug}`,
      title,
      description,
      ...(tool.thumbnail ? { images: [{ url: tool.thumbnail }] } : {}),
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const cat = tool.categories?.[0];

  const schemas: unknown[] = [
    webAppSchema(tool),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Tools", path: "/tools" },
      ...(cat ? [{ name: cat.name, path: `/categories/${cat.slug}` }] : []),
      { name: tool.title, path: `/tools/${tool.slug}` },
    ]),
  ];
  if (tool.faq && tool.faq.length > 0) schemas.push(faqSchema(tool.faq));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <JsonLd data={schemas} />
      <SiteHeader active="Tools" />
      <main className="flex-1">
        <div className="border-b border-zinc-100 bg-white">
          <nav className="mx-auto container flex flex-wrap items-center gap-2 px-6 py-3 text-sm text-zinc-500">
            <Link href="/" className="hover:text-orange-600">Home</Link><span>›</span>
            <Link href="/tools" className="hover:text-orange-600">Tools</Link>
            {cat && (<><span>›</span><Link href={`/categories/${cat.slug}`} className="hover:text-orange-600">{cat.name}</Link></>)}
            <span>›</span><span className="font-medium text-zinc-800">{tool.title}</span>
          </nav>
        </div>

        <div className="mx-auto container grid gap-8 px-6 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-3xl">
                {tool.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tool.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                ) : ("🧮")}
              </span>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">{tool.title}</h1>
                {tool.description && <p className="mt-1 text-sm text-zinc-500">{tool.description}</p>}
              </div>
            </div>

            {/* Calculator placeholder (engine built separately) */}
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
              <span className="text-4xl">🧮</span>
              <p className="mt-3 text-base font-bold text-zinc-900">Interactive calculator coming soon</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">This {tool.type} is being built. Meanwhile, explore the guide below.</p>
            </div>

            {/* Content */}
            {tool.content && (
              <div className="tiptap mt-8 rounded-2xl border border-zinc-200 bg-white p-6" dangerouslySetInnerHTML={{ __html: tool.content }} />
            )}

            {/* FAQ */}
            {tool.faq && tool.faq.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-xl font-extrabold text-zinc-900">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {tool.faq.map((f, i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 bg-white p-4">
                      <p className="font-bold text-zinc-900">{f.question}</p>
                      <p className="mt-1 text-sm text-zinc-600">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {cat && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="text-base font-extrabold text-zinc-900">Category</h3>
                <Link href={`/categories/${cat.slug}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-100">
                  {cat.name}
                </Link>
              </div>
            )}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-6">
              <h3 className="text-lg font-extrabold leading-snug text-zinc-900">Explore More Tools</h3>
              <p className="mt-2 text-sm text-zinc-600">200+ free calculators in one place.</p>
              <Link href="/tools" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600">Browse Tools</Link>
            </div>
            <AdSlot slot="8843302220" minHeight={250} />
          </aside>
        </div>
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
