import Link from "next/link";
import type { ArticleLite } from "@/lib/queries";

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Single source of truth for an article/blog card. `size` tweaks the image
// height, padding and title size so the same card works in dense grids (related
// guides) and the main blog listing.
export default function BlogCard({
  article,
  size = "md",
}: {
  article: ArticleLite;
  size?: "sm" | "md";
}) {
  const a = article;
  const href = `/blog/${a.slug}`;
  const cat = a.categories?.[0];
  const imgH = size === "sm" ? "h-40" : "h-48";
  const pad = size === "sm" ? "p-4" : "p-6";
  const titleSize = size === "sm" ? "text-lg" : "text-xl";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
      {/* Image */}
      <Link href={href} className={`relative block ${imgH} overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200`}>
        {a.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.featuredImage}
            alt={a.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl">📰</span>
        )}
      </Link>

      {/* Body */}
      <div className={`flex flex-grow flex-col ${pad}`}>
        <div className="flex-grow">
          {cat && (
            <Link
              href={`/blog?category=${cat.slug}`}
              className="mb-3 inline-block border-b-2 border-orange-500 pb-0.5 text-xs font-bold uppercase tracking-wide text-zinc-700 transition-colors hover:text-orange-600"
            >
              {cat.name}
            </Link>
          )}
          <Link
            href={href}
            className={`mb-3 block ${titleSize} font-black leading-tight text-zinc-900 transition-colors line-clamp-2 hover:text-orange-600 hover:underline`}
          >
            {a.title}
          </Link>
          {a.excerpt && <p className="mb-4 text-sm leading-relaxed text-zinc-600 line-clamp-3">{a.excerpt}</p>}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-zinc-400">
            {a.author && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                {(a.author.firstname?.[0] ?? "") + (a.author.lastname?.[0] ?? "")}
              </span>
            )}
            {fmtDate(a.createdAt)}
          </span>
          <Link
            href={href}
            className="inline-block border-b border-transparent pb-1 text-sm font-black uppercase text-orange-600 transition-colors hover:border-orange-600"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
}
