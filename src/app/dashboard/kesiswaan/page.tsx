export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState, StatCard } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/school-config";
import { ProsesIzinForm } from "./proses-form";

const ALPA_MIN = 3;

export default async function KesiswaanPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [pengajuanMenunggu, alpaTerbanyak, kelasList] = await Promise.all([
    prisma.pengajuanIzin.findMany({
      where: { status: "menunggu" },
      include: { siswa: { include: { kelas: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.absensi.groupBy({
      by: ["siswaId"],
      where: { status: "alpa" },
      _count: { _all: true },
      having: { siswaId: { _count: { gte: ALPA_MIN } } },
      orderBy: { _count: { siswaId: "desc" } },
    }),
    prisma.kelas.findMany({
      where: { aktif: true },
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),
  ]);

  const siswaPerhatianIds = alpaTerbanyak.map((a) => a.siswaId);
  const siswaPerhatian = siswaPerhatianIds.length
    ? await prisma.siswa.findMany({
        where: { id: { in: siswaPerhatianIds } },
        include: { kelas: true },
      })
    : [];
  const siswaPerhatianMap = new Map(siswaPerhatian.map((s) => [s.id, s]));

  // Rekap absensi per kelas (4 status utama)
  const rekapKelas = await Promise.all(
    kelasList.map(async (k) => {
      const [hadir, izin, sakit, alpa] = await Promise.all([
        prisma.absensi.count({ where: { status: "hadir", siswa: { kelasId: k.id } } }),
        prisma.absensi.count({ where: { status: "izin", siswa: { kelasId: k.id } } }),
        prisma.absensi.count({ where: { status: "sakit", siswa: { kelasId: k.id } } }),
        prisma.absensi.count({ where: { status: "alpa", siswa: { kelasId: k.id } } }),
      ]);
      return { ...k, hadir, izin, sakit, alpa };
    }),
  );

  return (
    <>
      <PageHeader
        title="Kesiswaan"
        description="Pembinaan, izin/sakit, dan pemantauan kedisiplinan siswa"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pengajuan Izin Menunggu"
          nilai={pengajuanMenunggu.length}
          icon="Inbox"
          accent="amber"
        />
        <StatCard
          label={`Siswa Alpa ≥ ${ALPA_MIN}`}
          nilai={alpaTerbanyak.length}
          icon="AlertTriangle"
          accent="amber"
        />
        <StatCard
          label="Rombongan Belajar"
          nilai={kelasList.length}
          icon="School"
          accent="navy"
        />
        <StatCard
          label="Total Alpa Tercatat"
          nilai={rekapKelas.reduce((a, r) => a + r.alpa, 0)}
          icon="UserX"
          accent="emerald"
        />
      </div>

      {/* Perlu perhatian */}
      <Card
        className="mb-6"
        title={`Perlu Perhatian — Alpa ≥ ${ALPA_MIN} kali`}
        icon="AlertTriangle"
      >
        {alpaTerbanyak.length === 0 ? (
          <EmptyState
            text="Tidak ada siswa dengan alpa ≥ 3. Kedisiplinan aman. 🎉"
            icon="HeartHandshake"
          />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Siswa</th>
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-4 font-medium">Jumlah Alpa</th>
                  <th className="py-2 font-medium">Peringatan</th>
                </tr>
              </thead>
              <tbody>
                {alpaTerbanyak.map((a) => {
                  const s = siswaPerhatianMap.get(a.siswaId);
                  if (!s) return null;
                  return (
                    <tr key={a.siswaId} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-2.5 pr-4 font-medium text-navy-900">{s.nama}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{s.kelas?.nama ?? "-"}</td>
                      <td className="py-2.5 pr-4 font-semibold text-red-600">{a._count._all}×</td>
                      <td className="py-2.5">
                        <Badge tone="red">Panggil orang tua / surat peringatan</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      {/* Pengajuan izin menunggu persetujuan */}
      <Card
        className="mb-6"
        title="Pengajuan Izin / Sakit — Menunggu Persetujuan"
        icon="Inbox"
        action={<Badge tone="amber">{pengajuanMenunggu.length} menunggu</Badge>}
      >
        {pengajuanMenunggu.length === 0 ? (
          <EmptyState text="Tidak ada pengajuan yang menunggu." icon="CheckCircle2" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {pengajuanMenunggu.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    {p.siswa.nama}{" "}
                    <span className="font-normal text-slate-500">
                      · {p.siswa.kelas?.nama ?? "?"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    <Badge tone="sky">{p.jenis}</Badge>{" "}
                    {formatTanggalID(p.tanggalMulai)} s/d {formatTanggalID(p.tanggalAkhir)}
                  </p>
                  <p className="mt-1 max-w-md text-xs italic text-slate-600">“{p.alasan}”</p>
                </div>
                <ProsesIzinForm id={p.id} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Rekap per kelas */}
      <Card title="Rekap Kehadiran per Kelas" icon="School">
        {rekapKelas.every((r) => r.hadir + r.izin + r.sakit + r.alpa === 0) ? (
          <EmptyState text="Belum ada data absensi." icon="ScanLine" />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-4 font-medium">Hadir</th>
                  <th className="py-2 pr-4 font-medium">Izin</th>
                  <th className="py-2 pr-4 font-medium">Sakit</th>
                  <th className="py-2 font-medium">Alpa</th>
                </tr>
              </thead>
              <tbody>
                {rekapKelas.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{r.nama}</td>
                    <td className="py-2.5 pr-4 text-emerald-600">{r.hadir}</td>
                    <td className="py-2.5 pr-4 text-amber-600">{r.izin}</td>
                    <td className="py-2.5 pr-4 text-sky-600">{r.sakit}</td>
                    <td className="py-2.5 font-medium text-red-600">{r.alpa}</td>
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
