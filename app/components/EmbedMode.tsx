"use client";

import { useEffect } from "react";

/**
 * When a page is loaded with ?embed=1 (i.e. inside an <iframe> embedded on
 * another site), mark the document so global CSS can hide the site chrome
 * (header, footer, ads, newsletter) and show just the calculator. Mounted once
 * in the root layout.
 */
export default function EmbedMode() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("embed") !== "1") return;
    document.documentElement.setAttribute("data-embed", "1");

    // Auto-height: report our content height to the host page so the embedding
    // iframe can resize itself (no scrollbars, no fixed 640px guess).
    const post = () => {
      const height = Math.ceil(document.body.scrollHeight);
      window.parent?.postMessage({ type: "td-embed-height", height }, "*");
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    window.addEventListener("load", post);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", post);
    };
  }, []);
  return null;
}
