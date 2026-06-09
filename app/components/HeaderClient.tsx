"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/lib/queries";

export default function HeaderClient({ items, active }: { items: NavItem[]; active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 container items-center gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="text-xl">📊</span>
          <span className="text-lg font-extrabold tracking-tight text-zinc-900">
            Topic<span className="text-orange-500">Drill</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {items.map((item) => (
            <Link
              key={item._id}
              href={item.url || "#"}
              className={`flex items-center gap-1 text-sm font-semibold transition-colors hover:text-orange-500 ${
                item.title === active ? "text-orange-500" : "text-zinc-700"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <form action="/tools" className="relative hidden md:block">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              name="q"
              type="search"
              placeholder="Search tools, calculators..."
              className="h-10 w-56 rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-400 focus:bg-white lg:w-64"
            />
          </form>
          <Link href="/tools" className="hidden rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 sm:block">
            Explore Tools
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-zinc-100 px-6 py-2 lg:hidden">
          {items.map((item) => (
            <Link
              key={item._id}
              href={item.url || "#"}
              onClick={() => setOpen(false)}
              className={`py-3 text-sm font-semibold ${item.title === active ? "text-orange-500" : "text-zinc-700"}`}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
