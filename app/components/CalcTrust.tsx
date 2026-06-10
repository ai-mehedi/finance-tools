import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * E-E-A-T trust strip for calculator/tool pages (YMYL requirement).
 * Renders a byline (author + optional reviewer), a last-updated date, and an
 * optional collapsible "How we calculate this" methodology box.
 *
 * Drop near the top of a calculator page, above the tool or just under the H1.
 * Pair with the matching schema fields on webAppSchema(): dateModified, author,
 * reviewer.
 */
export default function CalcTrust({
  author = "TopicDrill Editorial Team",
  reviewer,
  updated,
  methodology,
  showByline = false,
}: {
  author?: string;
  reviewer?: string;
  updated?: string;
  /** The actual formula + assumptions + sources. Specific to THIS calculator. */
  methodology?: ReactNode;
  /** The site-wide byline already renders in StaticPage for calculators, so this
   *  defaults off. Set true on pages that don't use StaticPage. */
  showByline?: boolean;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
      {showByline && (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
        <span>
          Written by <span className="font-semibold text-zinc-700">{author}</span>
        </span>
        {reviewer && (
          <>
            <span className="text-zinc-300">·</span>
            <span>
              Reviewed by <span className="font-semibold text-zinc-700">{reviewer}</span>
            </span>
          </>
        )}
        {updated && (
          <>
            <span className="text-zinc-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Updated {updated}
            </span>
          </>
        )}
      </p>
      )}

      {methodology && (
        <details className={`group ${showByline ? "mt-3 border-t border-zinc-200 pt-3" : ""}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-zinc-900 [&::-webkit-details-marker]:hidden">
            How we calculate this
            <ChevronDown className="size-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2.5 space-y-2 text-[15px] leading-7 text-zinc-600">{methodology}</div>
        </details>
      )}
    </div>
  );
}
