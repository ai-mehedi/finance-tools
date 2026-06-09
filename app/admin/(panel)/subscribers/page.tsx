"use client";

import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/Pagination";
import { useList } from "@/components/admin/useList";

type Subscriber = {
  _id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  source?: string;
  createdAt: string;
};

export default function SubscribersPage() {
  const [status, setStatus] = useState("");
  const list = useList<Subscriber>("/api/subscribers", { status });

  async function toggle(s: Subscriber) {
    const next = s.status === "subscribed" ? "unsubscribed" : "subscribed";
    await fetch(`/api/subscribers/${s._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    list.reload();
  }

  async function remove(s: Subscriber) {
    if (!confirm(`Delete subscriber ${s.email}?`)) return;
    await fetch(`/api/subscribers/${s._id}`, { method: "DELETE" });
    list.reload();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Subscribers</h1>
        <p className="mt-1 text-sm text-zinc-500">Newsletter subscribers.</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Search by email…" value={list.q} onChange={(e) => list.setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            <option value="">All status</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </Select>
        </div>

        <Table>
          <THead>
            <TR><TH>Email</TH><TH>Source</TH><TH>Status</TH><TH>Joined</TH><TH className="text-right">Actions</TH></TR>
          </THead>
          <TBody>
            {list.loading ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">Loading…</TD></TR>
            ) : list.data.length === 0 ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">No subscribers found.</TD></TR>
            ) : (
              list.data.map((s) => (
                <TR key={s._id}>
                  <TD className="font-semibold text-zinc-900">{s.email}</TD>
                  <TD className="text-zinc-500">{s.source || "—"}</TD>
                  <TD><Badge tone={statusTone(s.status)}>{s.status}</Badge></TD>
                  <TD className="text-zinc-500">{new Date(s.createdAt).toLocaleDateString()}</TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggle(s)}>
                        {s.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(s)}><Trash2 className="size-4 text-rose-500" /></Button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
        <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
      </Card>
    </div>
  );
}
