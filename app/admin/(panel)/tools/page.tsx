"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge, statusTone } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/Pagination";
import { useList } from "@/components/admin/useList";

type Tool = {
  _id: string;
  title: string;
  slug: string;
  type: "tool" | "calculator";
  status: "active" | "inactive" | "draft";
  thumbnail?: string;
  categories?: { _id: string; name: string }[];
};

export default function ToolsPage() {
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const list = useList<Tool>("/api/tools", { type, status });

  async function remove(t: Tool) {
    if (!confirm(`Delete tool "${t.title}"?`)) return;
    await fetch(`/api/tools/${t._id}`, { method: "DELETE" });
    list.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Tools</h1>
          <p className="mt-1 text-sm text-zinc-500">Tools & calculators.</p>
        </div>
        <Link href="/admin/tools/new">
          <Button variant="primary"><Plus /> New Tool</Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Search tools…" value={list.q} onChange={(e) => list.setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="w-40">
            <option value="">All types</option>
            <option value="tool">Tool</option>
            <option value="calculator">Calculator</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </Select>
        </div>

        <Table>
          <THead>
            <TR><TH>Title</TH><TH>Type</TH><TH>Categories</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR>
          </THead>
          <TBody>
            {list.loading ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">Loading…</TD></TR>
            ) : list.data.length === 0 ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">No tools found.</TD></TR>
            ) : (
              list.data.map((t) => (
                <TR key={t._id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {t.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.thumbnail} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="size-8 rounded-md object-cover" />
                      ) : (
                        <span className="flex size-8 items-center justify-center rounded-md bg-zinc-100 text-xs">🧮</span>
                      )}
                      <div>
                        <p className="font-semibold text-zinc-900">{t.title}</p>
                        <p className="text-xs text-zinc-400">{t.slug}</p>
                      </div>
                    </div>
                  </TD>
                  <TD><Badge tone="blue">{t.type}</Badge></TD>
                  <TD className="text-xs text-zinc-500">{(t.categories ?? []).map((c) => c.name).join(", ") || "—"}</TD>
                  <TD><Badge tone={statusTone(t.status)}>{t.status}</Badge></TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/tools/${t._id}`}><Button variant="ghost" size="icon"><Pencil className="size-4" /></Button></Link>
                      <Button variant="ghost" size="icon" onClick={() => remove(t)}><Trash2 className="size-4 text-rose-500" /></Button>
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
