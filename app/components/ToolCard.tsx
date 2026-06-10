import Link from "next/link";
import type { ToolLite } from "@/lib/queries";

// Single source of truth for how a calculator/tool is shown as a card.
// Used by the home grid, /tools, /calculators and category pages so the
// design stays consistent everywhere.
export default function ToolCard({ tool }: { tool: ToolLite }) {
  return (
    <Link
      href={tool.url || `/tools/${tool.slug}`}
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >
      <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-orange-50/70 text-2xl ring-1 ring-orange-100/60 transition-colors group-hover:bg-orange-100">
        {tool.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tool.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
        ) : (
          "🧮"
        )}
      </span>
      <h3 className="mt-4 text-sm font-bold text-zinc-900 group-hover:text-orange-600">{tool.title}</h3>
      {tool.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{tool.description}</p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">
        Open
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
