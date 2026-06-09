import Link from "next/link";
import type { ArticleLite, ToolLite } from "@/lib/queries";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Articles({ articles, popularTools }: { articles: ArticleLite[]; popularTools: ToolLite[] }) {
  if (!articles.length && !popularTools.length) return null;
  return (
    <section className="w-full bg-zinc-50">
      <div className="mx-auto container grid gap-8 px-6 py-14 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl">
              Latest Financial Guides &amp; Articles
            </h2>
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600">
              View All <Arrow />
            </Link>
          </div>

          {articles.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {articles.map((a) => (
                <Link key={a._id} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200">
                    {a.categories?.[0] && (
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-orange-600 shadow-sm backdrop-blur">
                        {a.categories[0].name}
                      </span>
                    )}
                    {a.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-4xl">📰</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 group-hover:text-orange-600">{a.title}</h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-500">{a.excerpt}</p>
                    <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-[11px] text-zinc-400">
                      {a.author && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[9px] font-bold text-orange-600">
                          {(a.author.firstname?.[0] ?? "") + (a.author.lastname?.[0] ?? "")}
                        </span>
                      )}
                      <span>{fmtDate(a.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">
              No published articles yet.
            </p>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h3 className="mb-4 text-base font-extrabold text-zinc-900">Popular Calculators</h3>
            <ul className="space-y-1">
              {popularTools.map((t, i) => (
                <li key={t._id}>
                  <Link href={`/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-orange-50">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-zinc-700 group-hover:text-orange-600">{t.title}</span>
                    <Arrow className="text-zinc-300 group-hover:text-orange-500" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/tools" className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100">
              View All Calculators <Arrow />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
