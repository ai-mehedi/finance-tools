"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

const SOCIALS = [
  {
    name: "Share on X",
    color: "hover:bg-zinc-900 hover:text-white",
    href: (u: string, t: string) => `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  },
  {
    name: "Share on Facebook",
    color: "hover:bg-blue-600 hover:text-white",
    href: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    name: "Share on LinkedIn",
    color: "hover:bg-sky-700 hover:text-white",
    href: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  },
  {
    name: "Share on WhatsApp",
    color: "hover:bg-emerald-500 hover:text-white",
    href: (u: string, t: string) => `https://wa.me/?text=${t}%20${u}`,
    path: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  },
];

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
      >
        <Share2 className="size-4" /> Share
      </button>

      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        {copied ? <Check className="size-4 text-emerald-500" /> : <Link2 className="size-4" />}
        {copied ? "Copied!" : "Copy link"}
      </button>

      <div className="flex items-center gap-1.5">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.href(u, t)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            title={s.name}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors ${s.color}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={s.path} />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
