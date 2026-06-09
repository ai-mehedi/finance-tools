"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/admin/Pagination";
import { useList } from "@/components/admin/useList";

type MenuItem = {
  _id: string;
  title: string;
  url: string;
  location: "header" | "footer";
  order: number;
  target: "_self" | "_blank";
  status: "active" | "inactive";
};

type Form = { title: string; url: string; location: string; order: string; target: string; status: string };
const empty: Form = { title: "", url: "#", location: "header", order: "0", target: "_self", status: "active" };

export default function NavMenuPage() {
  const [location, setLocation] = useState("");
  const list = useList<MenuItem>("/api/nav-menu", { location });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() { setEditing(null); setForm(empty); setError(null); setOpen(true); }
  function openEdit(m: MenuItem) {
    setEditing(m);
    setForm({ title: m.title, url: m.url, location: m.location, order: String(m.order), target: m.target, status: m.status });
    setError(null); setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      const res = await fetch(editing ? `/api/nav-menu/${editing._id}` : "/api/nav-menu", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setOpen(false); list.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function remove(m: MenuItem) {
    if (!confirm(`Delete menu item "${m.title}"?`)) return;
    await fetch(`/api/nav-menu/${m._id}`, { method: "DELETE" });
    list.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Nav Menu</h1>
          <p className="mt-1 text-sm text-zinc-500">Header & footer navigation links.</p>
        </div>
        <Button variant="primary" onClick={openCreate}><Plus /> New Item</Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Search menu…" value={list.q} onChange={(e) => list.setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={location} onChange={(e) => setLocation(e.target.value)} className="w-40">
            <option value="">All locations</option>
            <option value="header">Header</option>
            <option value="footer">Footer</option>
          </Select>
        </div>

        <Table>
          <THead>
            <TR><TH>Title</TH><TH>URL</TH><TH>Location</TH><TH>Order</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR>
          </THead>
          <TBody>
            {list.loading ? (
              <TR><TD colSpan={6} className="py-10 text-center text-zinc-400">Loading…</TD></TR>
            ) : list.data.length === 0 ? (
              <TR><TD colSpan={6} className="py-10 text-center text-zinc-400">No menu items found.</TD></TR>
            ) : (
              list.data.map((m) => (
                <TR key={m._id}>
                  <TD className="font-semibold text-zinc-900">{m.title}</TD>
                  <TD className="text-zinc-500">
                    <span className="inline-flex items-center gap-1">{m.url}{m.target === "_blank" && <ExternalLink className="size-3" />}</span>
                  </TD>
                  <TD><Badge tone="blue">{m.location}</Badge></TD>
                  <TD className="text-zinc-500">{m.order}</TD>
                  <TD><Badge tone={statusTone(m.status)}>{m.status}</Badge></TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(m)}><Trash2 className="size-4 text-rose-500" /></Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
        <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Menu Item" : "New Menu Item"}>
        <form onSubmit={save} className="space-y-4">
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>URL</Label><Input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Location</Label>
              <Select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </Select>
            </div>
            <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target</Label>
              <Select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                <option value="_self">Same tab</option>
                <option value="_blank">New tab</option>
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
