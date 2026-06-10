import Link from "next/link";
import type { CategoryLite, ToolLite } from "@/lib/queries";
import ToolCard from "./ToolCard";

const FEATURES = [
  { title: "100% Free", sub: "All tools are free to use" },
  { title: "Accurate Results", sub: "Trusted calculations" },
  { title: "Privacy Focused", sub: "Your data stays with you" },
  { title: "Easy to Use", sub: "Simple & user friendly" },
];

export default function CategoryDetail({
  category,
  tools,
  related,
}: {
  category: CategoryLite;
  tools: ToolLite[];
  related: (CategoryLite & { count: number })[];
}) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-zinc-100 bg-white">
        <nav className="mx-auto container flex items-center gap-2 px-6 py-3 text-sm text-zinc-500">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span>›</span>
          <Link href="/categories" className="hover:text-orange-600">Categories</Link>
          <span>›</span>
          <span className="font-medium text-zinc-800">{category.name}</span>
        </nav>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50">
        <span className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="relative mx-auto container px-6 py-12">
          <div className="flex items-center gap-4">
            {category.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={category.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-16 w-16 object-contain" />
            )}
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">{category.name} Tools</h1>
          </div>
          <p className="mt-4 max-w-xl text-base text-zinc-600">
            Explore our free {category.name.toLowerCase()} tools and calculators to plan smarter, save more and reach your financial goals.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-2">
                <span className="mt-0.5 text-orange-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-zinc-900">{f.title}</p>
                  <p className="text-xs text-zinc-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto container px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Tools */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xl font-extrabold text-zinc-900">{category.name} Tools</h2>
            {tools.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool._id} tool={tool} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">No tools in this category yet.</p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="border-b-2 border-orange-500 pb-2 text-base font-extrabold text-zinc-900">Other Categories</h3>
              <ul className="mt-3">
                {related.map((c) => (
                  <li key={c._id}>
                    <Link href={`/categories/${c.slug}`} className="flex items-center justify-between border-b border-zinc-100 py-2.5 text-sm transition-colors last:border-0 hover:text-orange-600">
                      <span className="text-zinc-700">{c.name}</span>
                      <span className="text-zinc-400">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 p-6">
              <h3 className="text-lg font-extrabold leading-snug text-zinc-900">Explore All Tools</h3>
              <p className="mt-2 max-w-[15rem] text-sm text-zinc-600">Access 200+ free calculators and guides in one place.</p>
              <Link href="/tools" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">Browse Tools</Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
