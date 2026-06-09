"use client";

import { useState } from "react";

export default function SubscribeForm({ soft = false, source = "site" }: { soft?: boolean; source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("done");
      setMessage("You're subscribed! 🎉");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className={`h-12 flex-1 rounded-lg px-4 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 ${
            soft ? "border border-zinc-200 bg-white" : "border-0 bg-white"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`h-12 shrink-0 rounded-lg px-6 text-sm font-bold text-white transition-colors disabled:opacity-60 ${
            soft ? "bg-orange-500 hover:bg-orange-600" : "bg-zinc-900 hover:bg-black"
          }`}
        >
          {status === "loading" ? "…" : status === "done" ? "Done ✓" : "Subscribe"}
        </button>
      </form>
      <p className={`mt-2 text-xs ${message && status === "error" ? "text-rose-500" : soft ? "text-zinc-500" : "text-white/80"}`}>
        {message || "No spam. Unsubscribe anytime."}
      </p>
    </div>
  );
}
