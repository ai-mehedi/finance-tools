"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ImageField } from "@/components/admin/ImageField";
import { CategoryPicker } from "@/components/admin/CategoryPicker";
import { RichEditor } from "@/components/admin/RichEditor";

export type ArticleValue = {
  _id?: string;
  title?: string;
  slug?: string;
  status?: string;
  focusKeyword?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  categories?: ({ _id: string } | string)[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

export function ArticleForm({ article }: { article?: ArticleValue }) {
  const router = useRouter();
  const editing = !!article?._id;

  const [authorId, setAuthorId] = useState<string | null>(null);
  useEffect(() => {
    if (editing) return;
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setAuthorId(d.user?._id ?? null)).catch(() => {});
  }, [editing]);

  const [form, setForm] = useState({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    status: article?.status ?? "draft",
    focusKeyword: article?.focusKeyword ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    featuredImage: article?.featuredImage ?? "",
    categories: (article?.categories ?? []).map((c) => (typeof c === "string" ? c : c._id)),
    metaTitle: article?.metaTitle ?? "",
    metaDescription: article?.metaDescription ?? "",
    keywords: (article?.keywords ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      };
      if (!editing) payload.author = authorId;
      const res = await fetch(editing ? `/api/articles/${article!._id}` : "/api/articles", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles"><Button type="button" variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{editing ? "Edit Article" : "New Article"}</h1>
            <p className="text-sm text-zinc-500">Blog posts & guides.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/articles"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : "Save Article"}</Button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4 p-5">
            <div>
              <Label>Title</Label>
              <Input required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
            </div>
            <div>
              <Label>Content</Label>
              <RichEditor value={form.content} onChange={(html) => set("content", html)} placeholder="Write your article…" />
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">SEO</p>
            <div className="space-y-3">
              <div><Label>Focus keyword</Label><Input value={form.focusKeyword} onChange={(e) => set("focusKeyword", e.target.value)} /></div>
              <div><Label>Meta title</Label><Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></div>
              <div><Label>Meta description</Label><Textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></div>
              <div><Label>Keywords <span className="font-normal text-zinc-400">(comma separated)</span></Label><Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} /></div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <div>
              <Label>Slug <span className="font-normal text-zinc-400">(optional)</span></Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
          </Card>

          <Card className="p-5">
            <CategoryPicker type="blog" value={form.categories} onChange={(ids) => set("categories", ids)} />
          </Card>

          <Card className="p-5">
            <ImageField label="Featured image" value={form.featuredImage} onChange={(url) => set("featuredImage", url)} generateName={form.title} generateType="finance blog article" />
          </Card>
        </div>
      </div>
    </form>
  );
}
