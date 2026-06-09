"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ImageField } from "@/components/admin/ImageField";
import { CategoryPicker } from "@/components/admin/CategoryPicker";
import { RichEditor } from "@/components/admin/RichEditor";

export type ToolValue = {
  _id?: string;
  title?: string;
  slug?: string;
  type?: string;
  status?: string;
  url?: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  categories?: ({ _id: string } | string)[];
  faq?: { question: string; answer: string }[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

type Faq = { question: string; answer: string };

export function ToolForm({ tool }: { tool?: ToolValue }) {
  const router = useRouter();
  const editing = !!tool?._id;

  const [faq, setFaq] = useState<Faq[]>(tool?.faq ?? []);

  const [form, setForm] = useState({
    title: tool?.title ?? "",
    slug: tool?.slug ?? "",
    type: tool?.type ?? "tool",
    status: tool?.status ?? "active",
    url: tool?.url ?? "",
    description: tool?.description ?? "",
    content: tool?.content ?? "",
    thumbnail: tool?.thumbnail ?? "",
    categories: (tool?.categories ?? []).map((c) => (typeof c === "string" ? c : c._id)),
    metaTitle: tool?.metaTitle ?? "",
    metaDescription: tool?.metaDescription ?? "",
    keywords: (tool?.keywords ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // One-click AI: generate long-form content, FAQ and SEO fields from the title.
  async function generate() {
    if (!form.title.trim()) {
      setError("Add a title first, then generate.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-tool-content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setForm((f) => ({
        ...f,
        content: data.content ?? f.content,
        metaTitle: data.metaTitle || f.metaTitle,
        metaDescription: data.metaDescription || f.metaDescription,
        keywords: Array.isArray(data.keywords) && data.keywords.length ? data.keywords.join(", ") : f.keywords,
      }));
      if (Array.isArray(data.faq) && data.faq.length) setFaq(data.faq);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        faq: faq.filter((f) => f.question.trim() && f.answer.trim()),
      };
      const res = await fetch(editing ? `/api/tools/${tool!._id}` : "/api/tools", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/admin/tools");
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
          <Link href="/admin/tools"><Button type="button" variant="outline" size="icon"><ArrowLeft className="size-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{editing ? "Edit Tool" : "New Tool"}</h1>
            <p className="text-sm text-zinc-500">Tools & calculators.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={generate}
            disabled={generating || !form.title.trim()}
            title="Generate content, FAQ and SEO from the title using AI"
          >
            <Sparkles className="size-4" /> {generating ? "Generating…" : "Generate with AI"}
          </Button>
          <Link href="/admin/tools"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : "Save Tool"}</Button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4 p-5">
            <div>
              <Label>Title</Label>
              <Input required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <Label>Short description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div>
              <Label>Content</Label>
              <RichEditor value={form.content} onChange={(html) => set("content", html)} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">FAQ</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFaq((f) => [...f, { question: "", answer: "" }])}
              >
                <Plus className="size-4" /> Add question
              </Button>
            </div>
            {faq.length === 0 ? (
              <p className="text-sm text-zinc-400">No FAQ items yet. Add common questions about this tool.</p>
            ) : (
              <div className="space-y-3">
                {faq.map((item, i) => (
                  <div key={i} className="rounded-xl border border-zinc-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500">Q{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setFaq((f) => f.filter((_, idx) => idx !== i))}
                        className="text-zinc-400 hover:text-rose-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Question"
                      value={item.question}
                      onChange={(e) => setFaq((f) => f.map((x, idx) => (idx === i ? { ...x, question: e.target.value } : x)))}
                    />
                    <Textarea
                      className="mt-2"
                      placeholder="Answer"
                      value={item.answer}
                      onChange={(e) => setFaq((f) => f.map((x, idx) => (idx === i ? { ...x, answer: e.target.value } : x)))}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-400">SEO</p>
            <div className="space-y-3">
              <div><Label>Meta title</Label><Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></div>
              <div><Label>Meta description</Label><Textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></div>
              <div><Label>Keywords <span className="font-normal text-zinc-400">(comma separated)</span></Label><Input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} /></div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                  <option value="tool">Tool</option>
                  <option value="calculator">Calculator</option>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Slug <span className="font-normal text-zinc-400">(optional)</span></Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => set("url", e.target.value)} />
            </div>
          </Card>

          <Card className="p-5">
            <CategoryPicker type="tool" value={form.categories} onChange={(ids) => set("categories", ids)} />
          </Card>

          <Card className="p-5">
            <ImageField label="Thumbnail" value={form.thumbnail} onChange={(url) => set("thumbnail", url)} generateName={form.title} generateType="finance calculator" />
          </Card>
        </div>
      </div>
    </form>
  );
}
