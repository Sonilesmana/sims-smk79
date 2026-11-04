export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function KelasPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [kelas, jurusan] = await Promise.all([
    prisma.kelas.findMany({
      where: { aktif: true },
      include: {
        jurusan: true,
        tahunAjaran: true,
        waliKelas: true,
        _count: { select: { siswa: true } },
      },
      orderBy: { nama: "asc" },
    }),
    prisma.jurusan.findMany({ where: { aktif: true }, orderBy: { kode: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Kelas & Jurusan" description={`${kelas.length} rombongan belajar`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {jurusan.map((j) => (
          <div key={j.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-bold text-navy-700">
                {j.kode}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium leading-snug text-navy-900">{j.nama}</p>
          </div>
        ))}
      </div>

      <Card title="Daftar Kelas">
        {kelas.length === 0 ? (
          <EmptyState text="Belum ada data kelas." />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-4 font-medium">Tingkat</th>
                  <th className="py-2 pr-4 font-medium">Jurusan</th>
                  <th className="py-2 pr-4 font-medium">Wali Kelas</th>
                  <th className="py-2 pr-4 font-medium">Jumlah Siswa</th>
                  <th className="py-2 font-medium">Tahun Ajaran</th>
                </tr>
              </thead>
              <tbody>
                {kelas.map((k) => (
                  <tr key={k.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{k.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{k.tingkat}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{k.jurusan?.nama ?? "-"}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{k.waliKelas?.nama ?? "-"}</td>
                    <td className="py-2.5 pr-4">
                      <Badge tone="sky">{k._count.siswa} siswa</Badge>
                    </td>
                    <td className="py-2.5 text-slate-600">{k.tahunAjaran.nama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
