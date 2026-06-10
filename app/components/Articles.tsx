import Link from "next/link";
import type { ArticleLite, ToolLite } from "@/lib/queries";
import BlogCard from "./BlogCard";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
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
                <BlogCard key={a._id} article={a} size="sm" />
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
                  <Link href={t.url || `/tools/${t.slug}`} className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-orange-50">
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
