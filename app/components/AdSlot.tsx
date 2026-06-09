"use client";

import { useEffect, useRef } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
const IS_PROD = process.env.NODE_ENV === "production";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * CWV-safe AdSense display unit.
 * - Reserves height (minHeight) so ads don't cause layout shift.
 * - Renders nothing in dev / when no client is configured, except a labelled
 *   placeholder so you can see placement while building.
 */
export function AdSlot({
  slot = DEFAULT_SLOT,
  className = "",
  minHeight = 280,
  format = "auto",
  responsive = true,
}: {
  slot?: string;
  className?: string;
  minHeight?: number;
  format?: string;
  responsive?: boolean;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!IS_PROD || !CLIENT || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blocker or script not ready */
    }
  }, [slot]);

  // No client/slot, or not production: show a dashed placeholder during dev only.
  if (!CLIENT || !slot || !IS_PROD) {
    if (IS_PROD) return null;
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-400 ${className}`}
        style={{ minHeight }}
      >
        Ad placement
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight }}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-zinc-300">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
