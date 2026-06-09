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

type Article = {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featuredImage?: string;
  categories?: { _id: string; name: string }[];
  author?: { firstname?: string; lastname?: string };
};

export default function ArticlesPage() {
  const [status, setStatus] = useState("");
  const list = useList<Article>("/api/articles", { status });

  async function remove(a: Article) {
    if (!confirm(`Delete article "${a.title}"?`)) return;
    await fetch(`/api/articles/${a._id}`, { method: "DELETE" });
    list.reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Articles</h1>
          <p className="mt-1 text-sm text-zinc-500">Blog posts & guides.</p>
        </div>
        <Link href="/admin/articles/new">
          <Button variant="primary"><Plus /> New Article</Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input placeholder="Search articles…" value={list.q} onChange={(e) => list.setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>

        <Table>
          <THead>
            <TR><TH>Title</TH><TH>Author</TH><TH>Categories</TH><TH>Status</TH><TH className="text-right">Actions</TH></TR>
          </THead>
          <TBody>
            {list.loading ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">Loading…</TD></TR>
            ) : list.data.length === 0 ? (
              <TR><TD colSpan={5} className="py-10 text-center text-zinc-400">No articles found.</TD></TR>
            ) : (
              list.data.map((a) => (
                <TR key={a._id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {a.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.featuredImage} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="h-8 w-12 rounded-md object-cover" />
                      ) : (
                        <span className="flex h-8 w-12 items-center justify-center rounded-md bg-zinc-100 text-xs">📰</span>
                      )}
                      <div>
                        <p className="font-semibold text-zinc-900">{a.title}</p>
                        <p className="text-xs text-zinc-400">{a.slug}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-xs text-zinc-500">{a.author ? `${a.author.firstname} ${a.author.lastname}` : "—"}</TD>
                  <TD className="text-xs text-zinc-500">{(a.categories ?? []).map((c) => c.name).join(", ") || "—"}</TD>
                  <TD><Badge tone={statusTone(a.status)}>{a.status}</Badge></TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/articles/${a._id}`}><Button variant="ghost" size="icon"><Pencil className="size-4" /></Button></Link>
                      <Button variant="ghost" size="icon" onClick={() => remove(a)}><Trash2 className="size-4 text-rose-500" /></Button>
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
