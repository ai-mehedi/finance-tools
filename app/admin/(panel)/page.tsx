"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, Wrench, Newspaper, Mail, Users, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CARDS = [
  { key: "categories", label: "Categories", icon: FolderTree, href: "/admin/categories", endpoint: "/api/categories" },
  { key: "tools", label: "Tools", icon: Wrench, href: "/admin/tools", endpoint: "/api/tools" },
  { key: "articles", label: "Articles", icon: Newspaper, href: "/admin/articles", endpoint: "/api/articles" },
  { key: "contacts", label: "Contacts", icon: Mail, href: "/admin/contacts", endpoint: "/api/contact" },
  { key: "subscribers", label: "Subscribers", icon: Users, href: "/admin/subscribers", endpoint: "/api/subscribers" },
] as const;

export default function DashboardPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [batching, setBatching] = useState(false);
  const [batchMsg, setBatchMsg] = useState<string | null>(null);

  useEffect(() => {
    CARDS.forEach((c) => {
      fetch(`${c.endpoint}?limit=1`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setCounts((prev) => ({ ...prev, [c.key]: d.total ?? 0 })))
        .catch(() => setCounts((prev) => ({ ...prev, [c.key]: null })));
    });
  }, []);

  // Generate the next 5 pending topics into draft articles (same path the daily
  // cron uses). Drafts land in Articles for review before publishing.
  async function generateBatch() {
    setBatching(true);
    setBatchMsg(null);
    try {
      const res = await fetch("/api/cron/generate-articles?count=5", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Batch failed");
      setBatchMsg(
        `Created ${data.created} draft${data.created === 1 ? "" : "s"}` +
          (data.failed ? `, ${data.failed} failed` : "") +
          ". Review them under Articles."
      );
    } catch (err) {
      setBatchMsg(err instanceof Error ? err.message : "Batch failed");
    } finally {
      setBatching(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Overview of your TopicDrill content.</p>
        </div>
        <div className="text-right">
          <Button type="button" variant="primary" onClick={generateBatch} disabled={batching}>
            {batching ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {batching ? "Generating…" : "Generate 5 drafts now"}
          </Button>
          {batchMsg && <p className="mt-2 max-w-xs text-xs text-zinc-500">{batchMsg}</p>}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const count = counts[c.key];
          return (
            <Link key={c.key} href={c.href}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">{c.label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-zinc-900">
                      {count === undefined ? "…" : count === null ? "—" : count}
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div className="flex items-center gap-1 border-t border-zinc-100 px-5 py-2.5 text-xs font-semibold text-orange-500">
                  Manage <ArrowRight className="size-3.5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
