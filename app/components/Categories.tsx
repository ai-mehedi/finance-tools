import Link from "next/link";
import type { CategoryLite } from "@/lib/queries";

export default function Categories({ categories }: { categories: CategoryLite[] }) {
  if (!categories.length) return null;
  return (
    <section className="w-full bg-white">
      <div className="mx-auto container px-6 py-14">
        <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          Browse Tools By Category
        </h2>

        <div className="grid grid-cols-2 divide-x divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:grid-cols-4 sm:divide-y-0 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center p-5 text-center transition-colors hover:bg-orange-50/50"
            >
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-orange-50 text-3xl">
                {cat.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.thumbnail} alt="" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                ) : (
                  "📁"
                )}
              </span>
              <h3 className="mt-3 text-sm font-bold text-zinc-900 group-hover:text-orange-600">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
