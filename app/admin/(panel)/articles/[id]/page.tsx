"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArticleForm, type ArticleValue } from "@/components/admin/ArticleForm";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((d) => (d.article ? setArticle(d.article) : setError(d.error ?? "Not found")))
      .catch(() => setError("Failed to load"));
  }, [id]);

  if (error) return <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>;
  if (!article) return <p className="text-sm text-zinc-400">Loading…</p>;
  return <ArticleForm article={article} />;
}
