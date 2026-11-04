"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const TAUTAN = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/program", label: "Program Keahlian" },
  { href: "/berita", label: "Berita" },
  { href: "/ppdb", label: "PPDB" },
  { href: "/kontak", label: "Kontak" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const aktif = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {TAUTAN.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              aktif(t.href)
                ? "font-medium text-navy-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="ml-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-800 md:hidden"
        >
          Login
        </Link>
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
        aria-label="Menu"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            {TAUTAN.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  aktif(t.href) ? "bg-slate-50 font-medium text-navy-900" : "text-slate-600"
                }`}
              >
                {t.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-navy-900 px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
