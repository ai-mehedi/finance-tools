import Link from "next/link";
import type { ArticleLite } from "@/lib/queries";

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Single source of truth for an article/blog card. `size` tweaks the image
// height and padding so the same card works in dense grids (related guides)
// and the main blog listing.
export default function BlogCard({
  article,
  size = "md",
}: {
  article: ArticleLite;
  size?: "sm" | "md";
}) {
  const a = article;
  const imgH = size === "sm" ? "h-36" : "h-44";
  const pad = size === "sm" ? "p-4" : "p-5";
  const titleSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <Link
      href={`/blog/${a.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
    >
      <div className={`relative ${imgH} overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200`}>
        {a.categories?.[0] && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-orange-600 shadow-sm backdrop-blur">
            {a.categories[0].name}
          </span>
        )}
        {a.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl">📰</span>
        )}
      </div>
      <div className={`flex flex-1 flex-col ${pad}`}>
        <h3 className={`line-clamp-2 ${titleSize} font-bold leading-snug text-zinc-900 group-hover:text-orange-600`}>{a.title}</h3>
        {a.excerpt && <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-500">{a.excerpt}</p>}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {a.author && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                {(a.author.firstname?.[0] ?? "") + (a.author.lastname?.[0] ?? "")}
              </span>
            )}
            <span>{fmtDate(a.createdAt)}</span>
          </div>
          <span className="text-xs font-bold text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">Read →</span>
        </div>
      </div>
    </Link>
  );
}
