"use client";

import { useEffect, useState } from "react";
import { Share2, Code2, Check, Copy, X, Printer } from "lucide-react";

/**
 * Per-calculator action bar: Share (native share or copy link) + Embed (copy an
 * iframe snippet so other sites can embed the calculator — a backlink engine).
 * Also records the calculator in localStorage for the "Recently used" list.
 * Rendered centrally for all calculators via StaticPage.
 */
export default function CalcActions({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [openEmbed, setOpenEmbed] = useState(false);
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  useEffect(() => {
    const clean = window.location.origin + window.location.pathname;
    setUrl(clean);
    // Record in "recently used" (most-recent first, de-duped, capped at 8).
    try {
      const key = "td:recent";
      const path = window.location.pathname;
      const prev: { title: string; path: string }[] = JSON.parse(localStorage.getItem(key) || "[]");
      const next = [{ title, path }, ...prev.filter((x) => x.path !== path)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* localStorage unavailable — non-critical */
    }
  }, [title]);

  // Self-resizing embed: the iframe posts its height (EmbedMode) and this small
  // script listens and resizes it, so it never shows scrollbars or empty space.
  const embedId = url ? "topicdrill-" + url.split("/").pop() : "topicdrill-calc";
  const embedCode = url
    ? `<iframe id="${embedId}" src="${url}?embed=1" width="100%" height="640" style="border:1px solid #e4e4e7;border-radius:8px" title="${title}" loading="lazy"></iframe>
<script>(function(){var f=document.getElementById("${embedId}");window.addEventListener("message",function(e){if(f&&e.source===f.contentWindow&&e.data&&e.data.type==="td-embed-height"){f.style.height=e.data.height+"px";}});})();</script>`
    : "";

  async function copy(text: string, which: "link" | "embed") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    copy(url, "link");
  }

  return (
    <div className="mt-5" data-embed-hide>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600"
        >
          {copied === "link" ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
          {copied === "link" ? "Link copied" : "Share"}
        </button>
        <button
          onClick={() => setOpenEmbed((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600"
        >
          <Code2 className="size-3.5" /> Embed
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-600"
        >
          <Printer className="size-3.5" /> Print / PDF
        </button>
      </div>

      {openEmbed && (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-700">Add this calculator to your site</p>
            <button onClick={() => setOpenEmbed(false)} className="text-zinc-400 hover:text-zinc-700">
              <X className="size-4" />
            </button>
          </div>
          <textarea
            readOnly
            value={embedCode}
            onFocusCapture={(e) => e.currentTarget.select()}
            className="h-20 w-full resize-none rounded-lg border border-zinc-200 bg-white p-2.5 font-mono text-[11px] leading-5 text-zinc-600 outline-none"
          />
          <button
            onClick={() => copy(embedCode, "embed")}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600"
          >
            {copied === "embed" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied === "embed" ? "Copied!" : "Copy embed code"}
          </button>
        </div>
      )}
    </div>
  );
}
