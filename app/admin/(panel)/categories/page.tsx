"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ImageField } from "@/components/admin/ImageField";
import { Pagination } from "@/components/admin/Pagination";
import { useList } from "@/components/admin/useList";

type Category = {
  _id: string;
  name: string;
  slug: string;
  type: "tool" | "blog";
  status: "active" | "inactive";
  thumbnail?: string;
};

const empty = { name: "", slug: "", type: "tool", status: "active", thumbnail: "" };

export default function CategoriesPage() {
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const list = useList<Category>("/api/categories", { type, status });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setError(null);
    setOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, type: c.type, status: c.status, thumbnail: c.thumbnail ?? "" });
    setError(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(editing ? `/api/categories/${editing._id}` : "/api/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setOpen(false);
      list.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    await fetch(`/api/categories/${c._id}`, { method: "DELETE" });
    list.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Categories</h1>
          <p className="mt-1 text-sm text-zinc-500">Tool & blog categories.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus /> New Category
        </Button>
      </div>

      <Card>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search categories…"
              value={list.q}
              onChange={(e) => list.setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="w-36">
            <option value="">All types</option>
            <option value="tool">Tool</option>
            <option value="blog">Blog</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH>Type</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {list.loading ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">Loading…</TD></TR>
            ) : list.error ? (
              <TR><TD colSpan={5} className="py-10 text-center text-rose-500">{list.error}</TD></TR>
            ) : list.data.length === 0 ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">No categories found.</TD></TR>
            ) : (
              list.data.map((c) => (
                <TR key={c._id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {c.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="size-8 rounded-md object-cover" />
                      ) : (
                        <span className="flex size-8 items-center justify-center rounded-md bg-zinc-100 text-xs">📁</span>
                      )}
                      <span className="font-semibold text-zinc-900">{c.name}</span>
                    </div>
                  </TD>
                  <TD className="text-zinc-500">{c.slug}</TD>
                  <TD><Badge tone="orange">{c.type}</Badge></TD>
                  <TD><Badge tone={statusTone(c.status)}>{c.status}</Badge></TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c)}><Trash2 className="size-4 text-rose-500" /></Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Category" : "New Category"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Slug <span className="font-normal text-zinc-400">(auto from name if blank)</span></Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="tool">Tool</option>
                <option value="blog">Blog</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <ImageField label="Thumbnail" value={form.thumbnail} onChange={(url) => setForm({ ...form, thumbnail: url })} generateName={form.name} generateType="finance category" />

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
