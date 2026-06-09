import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { getArticles, getBlogCategories, getCategoryBySlug } from "@/lib/queries";

export const revalidate = 1800;

export const metadata = {
  title: "Finance Blog",
  alternates: { canonical: "/blog" },
  description: "Expert insights, practical tips and in-depth guides to help you make smarter financial decisions.",
};

const PER_PAGE = 9;

function fmt(d?: string) {
  return d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const activeCat = sp.category ? await getCategoryBySlug(sp.category, "blog") : null;

  const [{ data: articles, pages }, categories] = await Promise.all([
    getArticles({ page, limit: PER_PAGE, categoryId: activeCat?._id }),
    getBlogCategories(),
  ]);

  const href = (p: number) => `/blog?${new URLSearchParams({ ...(sp.category ? { category: sp.category } : {}), page: String(p) })}`;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <SiteHeader active="Blog" />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50">
          <div className="mx-auto container px-6 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">Finance Blog</h1>
            <p className="mt-3 max-w-xl text-base text-zinc-600">
              Expert insights, practical tips and in-depth guides to help you make smarter financial decisions.
            </p>
          </div>
        </div>

        <div className="mx-auto container grid gap-8 px-6 py-12 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <h2 className="mb-6 text-2xl font-extrabold text-zinc-900">
              {activeCat ? activeCat.name : "Latest Articles"}
            </h2>
            {articles.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                      {a.categories?.[0] && <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-orange-600 shadow-sm backdrop-blur">{a.categories[0].name}</span>}
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (<span className="flex h-full w-full items-center justify-center text-5xl">📰</span>)}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-500">{a.excerpt}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {a.author && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                              {(a.author.firstname?.[0] ?? "") + (a.author.lastname?.[0] ?? "")}
                            </span>
                          )}
                          <span>{fmt(a.createdAt)}</span>
                        </div>
                        <span className="text-xs font-bold text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">Read →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-400">No published articles yet.</p>
            )}

            {pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 text-sm">
                {page > 1 && <Link href={href(page - 1)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Prev</Link>}
                <span className="px-2 text-zinc-500">Page {page} of {pages}</span>
                {page < pages && <Link href={href(page + 1)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-700 hover:bg-zinc-50">Next</Link>}
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="mb-3 text-base font-extrabold text-zinc-900">Categories</h3>
              <ul>
                <li><Link href="/blog" className={`flex items-center justify-between border-b border-zinc-100 py-2.5 text-sm hover:text-orange-600 ${!activeCat ? "font-bold text-orange-600" : "text-zinc-700"}`}>All</Link></li>
                {categories.map((c) => (
                  <li key={c._id}>
                    <Link href={`/blog?category=${c.slug}`} className={`flex items-center justify-between border-b border-zinc-100 py-2.5 text-sm last:border-0 hover:text-orange-600 ${activeCat?._id === c._id ? "font-bold text-orange-600" : "text-zinc-700"}`}>
                      <span>{c.name}</span><span className="text-zinc-400">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <Newsletter variant="soft" heading="Get Weekly Money Tips & Updates" subtitle="Join thousands of smart readers who get our best financial tips and tools every week." />
      </main>
      <Footer />
    </div>
  );
}
