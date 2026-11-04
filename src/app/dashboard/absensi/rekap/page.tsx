export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STATUS = ["hadir", "izin", "sakit", "alpa", "terlambat"] as const;

export default async function RekapPage({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { kelas: kelasId } = await searchParams;

  const kelasList = await prisma.kelas.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  const siswa = await prisma.siswa.findMany({
    where: { status: "aktif", ...(kelasId ? { kelasId } : {}) },
    include: { kelas: true, absensi: true },
    orderBy: { nama: "asc" },
  });

  const baris = siswa.map((s) => {
    const hitung: Record<string, number> = {};
    for (const st of STATUS) hitung[st] = 0;
    for (const a of s.absensi) hitung[a.status] = (hitung[a.status] ?? 0) + 1;
    const total = STATUS.reduce((a2, st) => a2 + hitung[st], 0);
    const pct = total > 0 ? Math.round((hitung.hadir / total) * 100) : null;
    return { siswa: s, hitung, pct };
  });

  return (
    <>
      <PageHeader
        title="Rekap Absensi"
        description="Rekapitulasi kehadiran seluruh siswa"
        action={
          <a
            href={`/api/absensi/rekap/export${kelasId ? `?kelas=${kelasId}` : ""}`}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            ⭳ Export CSV
          </a>
        }
      />

      {/* Filter kelas */}
      <form method="GET" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="kelas" className="mb-1.5 block text-xs font-medium text-slate-500">
            Filter Kelas
          </label>
          <select
            id="kelas"
            name="kelas"
            defaultValue={kelasId ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
        >
          Tampilkan
        </button>
      </form>

      <Card>
        {baris.length === 0 ? (
          <EmptyState text="Belum ada data siswa/absensi." icon="Users" />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">NIS</th>
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-3 font-medium">H</th>
                  <th className="py-2 pr-3 font-medium">I</th>
                  <th className="py-2 pr-3 font-medium">S</th>
                  <th className="py-2 pr-3 font-medium">A</th>
                  <th className="py-2 pr-3 font-medium">T</th>
                  <th className="py-2 font-medium">% Hadir</th>
                </tr>
              </thead>
              <tbody>
                {baris.map(({ siswa: s, hitung, pct }) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{s.nis}</td>
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{s.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{s.kelas?.nama ?? "-"}</td>
                    <td className="py-2.5 pr-3 text-emerald-600">{hitung.hadir}</td>
                    <td className="py-2.5 pr-3 text-amber-600">{hitung.izin}</td>
                    <td className="py-2.5 pr-3 text-sky-600">{hitung.sakit}</td>
                    <td className="py-2.5 pr-3 text-red-600">{hitung.alpa}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{hitung.terlambat}</td>
                    <td className="py-2.5">
                      {pct === null ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <Badge tone={pct >= 75 ? "emerald" : pct >= 50 ? "amber" : "red"}>{pct}%</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        H = Hadir · I = Izin · S = Sakit · A = Alpa · T = Terlambat. Export membuka CSV (dapat
        dibuka di Excel).
      </p>
    </>
  );
}
