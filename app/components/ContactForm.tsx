"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("done");
      setMessage("Thanks! We'll get back to you soon. ✓");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const input = "h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Name</label>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className={input} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Subject</label>
        <input value={form.subject} onChange={(e) => set("subject", e.target.value)} className={input} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Message</label>
        <textarea required value={form.message} onChange={(e) => set("message", e.target.value)} rows={5} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
      </div>
      {message && (
        <p className={`rounded-lg px-3 py-2 text-sm font-medium ${status === "error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>{message}</p>
      )}
      <button type="submit" disabled={status === "loading"} className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-60">
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
