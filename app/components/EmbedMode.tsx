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
    if (params.get("embed") === "1") {
      document.documentElement.setAttribute("data-embed", "1");
    }
  }, []);
  return null;
}
