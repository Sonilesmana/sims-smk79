"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { menuUntuk } from "@/lib/menu";
import { logoutAction } from "@/app/(auth)/login/actions";

type Props = {
  user: SessionUser;
  sekolah: { nama: string; singkatan: string; logoUrl: string };
  children: React.ReactNode;
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const Fallback = Icons.Circle;
  const Comp = Cmp ?? Fallback;
  return <Comp className={className} />;
}

export function PanelShell({ user, sekolah, children }: Props) {
  const [open, setOpen] = useState(false);
  const [menuUser, setMenuUser] = useState(false);
  const pathname = usePathname();
  const groups = menuUntuk(user);

  const inisial = user.nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-navy-900 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-sm font-bold ring-1 ring-white/15">
            79
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{sekolah.singkatan}</p>
            <p className="truncate text-[11px] text-sky-200">Portal Sekolah</p>
          </div>
        </div>

        <nav className="scrollbar-thin h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g.judul} className="mb-4">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sky-200/60">
                {g.judul}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const aktif =
                    it.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(it.href);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                          aktif
                            ? "bg-sky-500/20 font-medium text-white ring-1 ring-sky-400/30"
                            : "text-sky-100/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon name={it.icon} className="h-4 w-4 shrink-0" />
                        <span className="truncate">{it.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
              aria-label="Buka menu"
            >
              <Icons.Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-navy-900">Sistem Informasi Manajemen Sekolah</p>
              <p className="hidden text-xs text-slate-500 sm:block">{sekolah.nama}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:flex"
            >
              <Icons.Globe className="h-3.5 w-3.5" /> Website
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuUser((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                  {inisial}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-semibold leading-tight text-navy-900">
                    {user.nama}
                  </span>
                  <span className="block text-[11px] text-slate-500">{user.roleNama}</span>
                </span>
                <Icons.ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {menuUser && (
                <div className="absolute right-0 mt-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                  <Link
                    href="/dashboard/profil"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuUser(false)}
                  >
                    Profil Saya
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Icons.LogOut className="h-3.5 w-3.5" /> Keluar
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 sm:p-6">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {sekolah.nama} — Portal Sekolah
        </footer>
      </div>
    </div>
  );
}
