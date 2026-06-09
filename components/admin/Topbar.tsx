"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminUser = { firstname?: string; lastname?: string; email?: string };

export function Topbar({ user, onMenu }: { user: AdminUser | null; onMenu: () => void }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const initials =
    `${user?.firstname?.[0] ?? ""}${user?.lastname?.[0] ?? ""}`.toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur lg:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden">
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-zinc-900">
            {user ? `${user.firstname} ${user.lastname}` : "Admin"}
          </p>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
          {initials}
        </span>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut /> Logout
        </Button>
      </div>
    </header>
  );
}
