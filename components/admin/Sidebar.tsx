"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Wrench,
  Newspaper,
  Menu as MenuIcon,
  Mail,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/nav-menu", label: "Nav Menu", icon: MenuIcon },
  { href: "/admin/contacts", label: "Contacts", icon: Mail },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-zinc-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
          <Link href="/admin" className="flex items-center gap-1.5">
            <span className="text-xl">📊</span>
            <span className="text-lg font-extrabold tracking-tight text-zinc-900">
              Topic<span className="text-orange-500">Drill</span>
            </span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-orange-50 text-orange-600"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-100 p-4 text-xs text-zinc-400">
          TopicDrill CMS · v1.0
        </div>
      </aside>
    </>
  );
}
