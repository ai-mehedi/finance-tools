"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ToolForm, type ToolValue } from "@/components/admin/ToolForm";

export default function EditToolPage() {
  const { id } = useParams<{ id: string }>();
  const [tool, setTool] = useState<ToolValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tools/${id}`)
      .then((r) => r.json())
      .then((d) => (d.tool ? setTool(d.tool) : setError(d.error ?? "Not found")))
      .catch(() => setError("Failed to load"));
  }, [id]);

  if (error) return <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>;
  if (!tool) return <p className="text-sm text-zinc-400">Loading…</p>;
  return <ToolForm tool={tool} />;
}
