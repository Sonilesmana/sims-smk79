export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { mergeSchoolConfig } from "@/lib/school-config";
import { PublicNav } from "@/components/public-nav";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const rows = await prisma.pengaturan.findMany({
    where: { kategori: { in: ["sekolah", "akademik"] } },
    select: { kunci: true, nilai: true },
  });
  const s = mergeSchoolConfig(rows);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy-900 text-sm font-bold text-white">
              {s.singkatan.replace(/[^0-9]/g, "").slice(0, 2) || "79"}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-navy-900">{s.nama}</p>
              <p className="text-[11px] text-slate-500">{s.motto}</p>
            </div>
          </Link>

          <PublicNav />

          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-800 sm:inline-flex"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-navy-900 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <p className="text-base font-semibold text-white">{s.nama}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.alamat}</p>
            {s.akreditasi && (
              <p className="mt-2 text-sm text-slate-400">Akreditasi {s.akreditasi}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Tautan</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link href="/profil" className="hover:text-white">Profil Sekolah</Link></li>
              <li><Link href="/program" className="hover:text-white">Program Keahlian</Link></li>
              <li><Link href="/berita" className="hover:text-white">Berita</Link></li>
              <li><Link href="/ppdb" className="hover:text-white">PPDB Online</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Kontak</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {s.telepon && <li>Telepon: {s.telepon}</li>}
              {s.email && <li>Email: {s.email}</li>}
              <li><Link href="/kontak" className="hover:text-white">Kirim pesan →</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {s.nama} — Portal Sekolah
        </div>
      </footer>
    </div>
  );
}
