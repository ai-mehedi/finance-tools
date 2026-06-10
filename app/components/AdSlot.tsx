"use client";

import { useEffect, useRef, useState } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
const IS_PROD = process.env.NODE_ENV === "production";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * CWV-safe, hydration-safe AdSense display unit.
 *
 * Hydration: the <ins> is rendered ONLY after the component mounts on the
 * client. The server-rendered HTML therefore never contains the
 * `adsbygoogle` <ins>, so the AdSense script can't mutate a node React is
 * still trying to hydrate — which is what triggers React error #418.
 * The outer container is still rendered on the server and reserves height
 * so the late <ins> doesn't cause layout shift (CLS).
 *
 * Shapes:
 * - Responsive banner (default): `<AdSlot slot="..." />` — reflows to fit width.
 * - Square / fixed rectangle:    `<AdSlot slot="..." responsive={false} width={300} height={250} />`
 * - Multiplex (related-content):  `<AdSlot slot="..." format="autorelaxed" />`
 */
export function AdSlot({
  slot = DEFAULT_SLOT,
  className = "",
  minHeight = 280,
  format = "auto",
  responsive = true,
  width,
  height,
}: {
  slot?: string;
  className?: string;
  minHeight?: number;
  format?: string;
  responsive?: boolean;
  /** Fixed pixel width — use with `responsive={false}` for square/rectangle units. */
  width?: number;
  /** Fixed pixel height — use with `responsive={false}` for square/rectangle units. */
  height?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !IS_PROD || !CLIENT || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blocker or script not ready */
    }
  }, [mounted, slot]);

  const isFixed = !responsive && !!width && !!height;
  const reserved = isFixed ? height : minHeight;

  // No client/slot, or not production: show a dashed placeholder during dev only.
  if (!CLIENT || !slot || !IS_PROD) {
    if (IS_PROD) return null;
    return (
      <div
        data-embed-hide
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-400 ${className}`}
        style={{ minHeight: reserved, ...(isFixed ? { width, height } : {}) }}
      >
        Ad placement{isFixed ? ` ${width}×${height}` : ""}
      </div>
    );
  }

  return (
    <div
      data-embed-hide
      className={`flex flex-col items-center justify-center ${className}`}
      style={{ minHeight: reserved }}
      suppressHydrationWarning
    >
      <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-zinc-300">Advertisement</p>
      {mounted && (
        <ins
          key={slot}
          className="adsbygoogle"
          style={
            isFixed
              ? { display: "inline-block", width, height, textAlign: "center", marginInline: "auto" }
              : { display: "block", width: "100%", minHeight, textAlign: "center", marginInline: "auto" }
          }
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          {...(isFixed
            ? {}
            : {
                "data-ad-format": format,
                "data-full-width-responsive": responsive ? "true" : "false",
              })}
        />
      )}
    </div>
  );
}
