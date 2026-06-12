import Link from "next/link";
import type { CategoryLite } from "@/lib/queries";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function AllCategories({ categories }: { categories: (CategoryLite & { count: number })[] }) {
  return (
    <section className="w-full bg-zinc-50">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50">
        <span className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="relative mx-auto container px-6 py-12">
          <nav className="mb-5 flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span>/</span>
            <span className="font-medium text-zinc-800">Categories</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Browse All <span className="text-orange-500">Categories</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-600">
            Explore our wide range of financial tool categories. Find the right
            calculators and resources to plan, track, and grow your money wisely.
          </p>
        </div>
      </div>

      <div className="mx-auto container px-6 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-orange-50 text-2xl">
                {cat.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.thumbnail} alt={`${cat.name} calculators`} referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                ) : (
                  "📁"
                )}
              </span>
              <h3 className="mt-4 text-lg font-bold text-zinc-900 group-hover:text-orange-600">{cat.name}</h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">{cat.count} tools</span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-500">
                  View Tools <Arrow className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
