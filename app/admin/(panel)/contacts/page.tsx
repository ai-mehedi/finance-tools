"use client";

import { useState } from "react";
import { Search, Trash2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/admin/Pagination";
import { useList } from "@/components/admin/useList";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

export default function ContactsPage() {
  const [status, setStatus] = useState("");
  const list = useList<Contact>("/api/contact", { status });
  const [view, setView] = useState<Contact | null>(null);

  async function updateStatus(c: Contact, value: string) {
    await fetch(`/api/contact/${c._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    list.reload();
  }

  async function remove(c: Contact) {
    if (!confirm(`Delete submission from ${c.name}?`)) return;
    await fetch(`/api/contact/${c._id}`, { method: "DELETE" });
    setView(null);
    list.reload();
  }

  function openView(c: Contact) {
    setView(c);
    if (c.status === "new") updateStatus(c, "read");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Contacts</h1>
        <p className="mt-1 text-sm text-zinc-500">Contact form submissions.</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Search name, email, subject…" value={list.q} onChange={(e) => list.setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="">All status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </Select>
        </div>

        <Table>
          <THead>
            <TR><TH>Name</TH><TH>Email</TH><TH>Subject</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR>
          </THead>
          <TBody>
            {list.loading ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">Loading…</TD></TR>
            ) : list.data.length === 0 ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">No submissions found.</TD></TR>
            ) : (
              list.data.map((c) => (
                <TR key={c._id} className="cursor-pointer" onClick={() => openView(c)}>
                  <TD className="font-semibold text-zinc-900">{c.name}</TD>
                  <TD className="text-zinc-500">{c.email}</TD>
                  <TD className="text-zinc-500">{c.subject || "—"}</TD>
                  <TD><Badge tone={statusTone(c.status)}>{c.status}</Badge></TD>
                  <TD className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openView(c)}><Eye className="size-4" /></Button>
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

      <Modal open={!!view} onClose={() => setView(null)} title="Submission">
        {view && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-zinc-400">Name</p><p className="font-semibold text-zinc-900">{view.name}</p></div>
              <div><p className="text-xs text-zinc-400">Email</p><p className="font-semibold text-zinc-900">{view.email}</p></div>
              <div><p className="text-xs text-zinc-400">Phone</p><p className="text-zinc-700">{view.phone || "—"}</p></div>
              <div><p className="text-xs text-zinc-400">Subject</p><p className="text-zinc-700">{view.subject || "—"}</p></div>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Message</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-zinc-700">{view.message}</p>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
              <Select value={view.status} onChange={(e) => { updateStatus(view, e.target.value); setView({ ...view, status: e.target.value as Contact["status"] }); }} className="w-40">
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </Select>
              <Button variant="destructive" onClick={() => remove(view)}><Trash2 /> Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
