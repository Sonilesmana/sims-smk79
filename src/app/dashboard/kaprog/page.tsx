export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState, StatCard } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function KaprogPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const guru = await prisma.guru.findUnique({
    where: { userId: user.id },
    include: { kaprogJurusan: true },
  });

  const jurusan = guru?.kaprogJurusan ?? null;

  if (!guru || !jurusan) {
    return (
      <>
        <PageHeader title="Kepala Program Keahlian" description="Monitoring jurusan yang dipimpin" />
        <Card icon="Briefcase" title="Belum ditugaskan">
          <EmptyState
            text="Anda belum ditugaskan sebagai Kepala Program Keahlian. Hubungi Admin untuk pengaturan (guru → kolom kaprogJurusanId)."
            icon="Briefcase"
          />
        </Card>
      </>
    );
  }

  const [kelas, mapelKejuruan] = await Promise.all([
    prisma.kelas.findMany({
      where: { jurusanId: jurusan.id, aktif: true },
      include: { _count: { select: { siswa: true } }, waliKelas: true },
      orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
    }),
    prisma.mataPelajaran.findMany({
      where: { OR: [{ jurusanId: jurusan.id }, { kelompok: "kejuruan" }], aktif: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  const totalSiswa = kelas.reduce((a, k) => a + k._count.siswa, 0);
  const totalRombel = kelas.length;

  return (
    <>
      <PageHeader
        title={`Kaprog — ${jurusan.nama}`}
        description={`${guru.nama} · Kepala Program Keahlian ${jurusan.kode}`}
        action={<Badge tone="sky">{jurusan.kode}</Badge>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Rombongan Belajar" nilai={totalRombel} icon="School" />
        <StatCard label="Total Siswa Jurusan" nilai={totalSiswa} icon="Users" accent="navy" />
        <StatCard
          label="Mata Pelajaran Kejuruan"
          nilai={mapelKejuruan.length}
          icon="BookMarked"
          accent="emerald"
        />
        <StatCard
          label="Tahun Ajaran"
          nilai="2025/2026"
          icon="CalendarRange"
          accent="amber"
        />
      </div>

      <Card className="mb-6" title="Kelas pada Jurusan Ini" icon="School">
        {kelas.length === 0 ? (
          <EmptyState text="Belum ada kelas untuk jurusan ini." icon="School" />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-4 font-medium">Tingkat</th>
                  <th className="py-2 pr-4 font-medium">Wali Kelas</th>
                  <th className="py-2 font-medium">Jumlah Siswa</th>
                </tr>
              </thead>
              <tbody>
                {kelas.map((k) => (
                  <tr key={k.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{k.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{k.tingkat}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{k.waliKelas?.nama ?? "—"}</td>
                    <td className="py-2.5">
                      <Badge tone="sky">{k._count.siswa} siswa</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Card title="Mata Pelajaran Kejuruan" icon="BookMarked">
        {mapelKejuruan.length === 0 ? (
          <EmptyState text="Belum ada mata pelajaran kejuruan." icon="BookMarked" />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Kode</th>
                  <th className="py-2 pr-4 font-medium">Nama Mata Pelajaran</th>
                  <th className="py-2 font-medium">Kelompok</th>
                </tr>
              </thead>
              <tbody>
                {mapelKejuruan.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{m.kode}</td>
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{m.nama}</td>
                    <td className="py-2.5">
                      <Badge tone="sky">{m.kelompok}</Badge>
                    </td>
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
