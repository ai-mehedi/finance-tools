import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize stored rich-text HTML before rendering it inside a page that
 * already has its own <h1> (the page title). Any stray <h1> in body content
 * (e.g. legacy/imported content) is demoted to <h2> so each page keeps a
 * single, top-level <h1> — avoids the "Multiple H1 tags" SEO flag.
 */
export function normalizeContentHtml(html?: string): string {
  if (!html) return "";
  return (
    html
      // Demote stray body <h1> to <h2> so the page keeps a single top-level <h1>.
      .replace(/<(\/?)h1(\b[^>]*)>/gi, "<$1h2$2>")
      // Backfill missing alt text on legacy content images (derive from the
      // file name) so no rendered image trips the "Missing alt text" flag.
      .replace(/<img\b([^>]*)>/gi, (tag, attrs) => {
        if (/\balt\s*=/i.test(attrs)) return tag;
        const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
        const alt = src
          .split(/[?#]/)[0]
          .split("/")
          .pop()!
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();
        return `<img${attrs} alt="${alt}">`;
      })
  );
}
