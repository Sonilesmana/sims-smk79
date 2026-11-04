export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/school-config";

export default async function BeritaListPage() {
  const rows = await prisma.berita.findMany({
    where: { status: "publish" },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900">Berita &amp; Pengumuman</h1>
      <p className="mt-1 text-sm text-slate-500">Informasi terbaru dari sekolah</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 && (
          <p className="col-span-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm text-slate-400">
            Belum ada berita dipublikasikan.
          </p>
        )}
        {rows.map((b) => (
          <Link
            key={b.id}
            href={`/berita/${b.slug}`}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            <div className="grid h-32 place-items-center bg-navy-900/95">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                {b.kategori}
              </span>
            </div>
            <div className="p-5">
              <p className="text-[11px] text-slate-400">{formatTanggalID(b.publishedAt)}</p>
              <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-navy-900">{b.judul}</h2>
              <p className="mt-2 line-clamp-3 text-xs text-slate-500">{b.ringkasan}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
