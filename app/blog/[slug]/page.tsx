import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import Newsletter from "../../components/Newsletter";
import Footer from "../../components/Footer";
import JsonLd from "../../components/JsonLd";
import { AdSlot } from "../../components/AdSlot";
import ShareButtons from "../../components/ShareButtons";
import { getArticleBySlug, getArticles } from "@/lib/queries";
import { articleSchema, breadcrumbSchema, faqSchema, abs, openGraphFor } from "@/lib/seo";
import { normalizeContentHtml } from "@/lib/utils";

export const revalidate = 1800;

function fmt(d?: string) {
  return d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "Article not found" };
  const title = a.metaTitle || a.title;
  const description = a.metaDescription || a.excerpt;
  const author = a.author ? `${a.author.firstname ?? ""} ${a.author.lastname ?? ""}`.trim() : undefined;
  return {
    title,
    description,
    keywords: a.focusKeyword,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      ...openGraphFor({ path: `/blog/${slug}`, title, description, type: "article", image: a.featuredImage }),
      publishedTime: a.createdAt,
      modifiedTime: (a as { updatedAt?: string }).updatedAt || a.createdAt,
      authors: author ? [author] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const cat = article.categories?.[0];
  const { data: more } = await getArticles({ limit: 3, categoryId: cat?._id });
  const related = more.filter((m) => m.slug !== article.slug).slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <JsonLd
        data={[
          articleSchema(article),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            ...(cat ? [{ name: cat.name, path: `/blog?category=${cat.slug}` }] : []),
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
          ...(article.faq?.length ? [faqSchema(article.faq)] : []),
        ]}
      />
      <SiteHeader active="Blog" />
      <main className="flex-1">
        <div className="border-b border-zinc-100 bg-white">
          <nav className="mx-auto container flex flex-wrap items-center gap-2 px-6 py-3 text-sm text-zinc-500">
            <Link href="/" className="hover:text-orange-600">Home</Link><span>›</span>
            <Link href="/blog" className="hover:text-orange-600">Blog</Link>
            {cat && (<><span>›</span><Link href={`/blog?category=${cat.slug}`} className="hover:text-orange-600">{cat.name}</Link></>)}
            <span>›</span><span className="truncate font-medium text-zinc-800">{article.title}</span>
          </nav>
        </div>

        <article className="mx-auto max-w-3xl px-6 py-10">
          {cat && <span className="inline-block rounded-md bg-orange-100 px-2.5 py-1 text-xs font-bold tracking-wide text-orange-600">{cat.name}</span>}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl">{article.title}</h1>
          {article.excerpt && <p className="mt-4 text-lg text-zinc-500">{article.excerpt}</p>}

          <div className="mt-6 flex items-center gap-3 border-b border-zinc-100 pb-6 text-sm">
            {article.author && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                {(article.author.firstname?.[0] ?? "") + (article.author.lastname?.[0] ?? "")}
              </span>
            )}
            <div>
              {article.author && <p className="font-bold text-zinc-900">{article.author.firstname} {article.author.lastname}</p>}
              <p className="text-xs text-zinc-500">{fmt(article.createdAt)}</p>
            </div>
            <div className="ml-auto">
              <ShareButtons url={abs(`/blog/${article.slug}`)} title={article.title} />
            </div>
          </div>

          {article.featuredImage && (
            <div className="mt-6 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.featuredImage} alt={article.title} referrerPolicy="no-referrer" loading="lazy" decoding="async" className="w-full object-cover" />
            </div>
          )}

          {article.content ? (
            <div className="tiptap mt-8" dangerouslySetInnerHTML={{ __html: normalizeContentHtml(article.content) }} />
          ) : (
            <p className="mt-8 rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">
              Full article coming soon.
            </p>
          )}

          {/* In-article ad (after the content) */}
          <AdSlot className="mt-10" />
        </article>

        {related.length > 0 && (
          <div className="mx-auto max-w-3xl px-6 pb-12">
            <h2 className="mb-5 text-xl font-extrabold text-zinc-900">Related Articles</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r._id} href={`/blog/${r.slug}`} className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md">
                  <p className="text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{r.title}</p>
                  <p className="mt-2 text-xs text-zinc-400">{fmt(r.createdAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-6 pb-10">
          <AdSlot slot="6708312646" format="autorelaxed" responsive={false} minHeight={400} />
        </div>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
