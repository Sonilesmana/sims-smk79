export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/school-config";

export default async function JadwalPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const HARI = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Guru & siswa hanya melihat jadwal terkait dirinya
  const filter: Record<string, unknown> = { aktif: true };
  if (user.role === "guru" || user.role === "kurikulum") {
    const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
    if (guru) filter.guruId = guru.id;
  } else if (user.role === "siswa") {
    const siswa = await prisma.siswa.findUnique({ where: { userId: user.id } });
    if (siswa?.kelasId) filter.kelasId = siswa.kelasId;
  } else if (user.role === "orang_tua") {
    const ortu = await prisma.orangTua.findUnique({
      where: { userId: user.id },
      include: { anakanak: { include: { siswa: true } } },
    });
    const ids = (ortu?.anakanak ?? []).map((a) => a.siswa.kelasId).filter(Boolean) as string[];
    filter.kelasId = { in: ids };
  }

  const rows = await prisma.jadwal.findMany({
    where: filter,
    include: { kelas: true, mataPelajaran: true, guru: true },
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    take: 200,
  });

  return (
    <>
      <PageHeader title="Jadwal Pelajaran" description={`${rows.length} sesi terjadwal`} />
      <Card>
        {rows.length === 0 ? (
          <EmptyState
            text="Belum ada jadwal untuk Anda. Silakan hubungi bagian Kurikulum."
            icon="CalendarDays"
          />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Hari</th>
                  <th className="py-2 pr-4 font-medium">Jam</th>
                  <th className="py-2 pr-4 font-medium">Mata Pelajaran</th>
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-4 font-medium">Guru</th>
                  <th className="py-2 font-medium">Ruang</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((j) => (
                  <tr key={j.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4">
                      <Badge tone="sky">{HARI[j.hari] ?? j.hari}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-600">
                      {j.jamMulai}–{j.jamSelesai}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{j.mataPelajaran.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{j.kelas.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{j.guru.nama}</td>
                    <td className="py-2.5 text-slate-600">{j.ruang ?? "-"}</td>
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
