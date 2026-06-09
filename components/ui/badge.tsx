import * as React from "react";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof TONES }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}

/** Map a status string to a badge tone. */
export function statusTone(status?: string): keyof typeof TONES {
  switch (status) {
    case "active":
    case "published":
    case "subscribed":
    case "replied":
      return "green";
    case "inactive":
    case "archived":
    case "unsubscribed":
      return "neutral";
    case "draft":
    case "new":
      return "amber";
    case "banned":
      return "red";
    case "read":
      return "blue";
    default:
      return "neutral";
  }
}
