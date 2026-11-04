export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState, StatCard } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/school-config";
import { CatatanForm } from "./catatan-form";

const STATUS_ABSENSI = ["hadir", "izin", "sakit", "alpa", "terlambat"] as const;

export default async function WaliKelasPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const guru = await prisma.guru.findUnique({ where: { userId: user.id } });

  const kelasWali = guru
    ? await prisma.kelas.findMany({
        where: { waliKelasId: guru.id, aktif: true },
        include: {
          jurusan: true,
          siswa: { where: { status: "aktif" }, orderBy: { nama: "asc" } },
        },
        orderBy: { nama: "asc" },
      })
    : [];

  if (!guru || kelasWali.length === 0) {
    return (
      <>
        <PageHeader
          title="Wali Kelas"
          description="Pembinaan siswa pada kelas yang Anda walikan"
        />
        <Card icon="BookOpenCheck" title="Belum ditugaskan">
          <EmptyState
            text="Anda belum ditugaskan sebagai wali kelas. Hubungi Admin atau bagian Kurikulum untuk penugasan."
            icon="BookOpenCheck"
          />
        </Card>
      </>
    );
  }

  // Agregasi absensi untuk seluruh siswa di kelas yang diwalikan
  const semuaSiswaIds = kelasWali.flatMap((k) => k.siswa.map((s) => s.id));
  const rekap = await prisma.absensi.groupBy({
    by: ["siswaId", "status"],
    where: { siswaId: { in: semuaSiswaIds } },
    _count: { _all: true },
  });

  const rekapMap = new Map<string, Map<string, number>>();
  for (const r of rekap) {
    if (!rekapMap.has(r.siswaId)) rekapMap.set(r.siswaId, new Map());
    rekapMap.get(r.siswaId)!.set(r.status, r._count._all);
  }

  // Catatan wali terakhir per siswa
  const catatanList = await prisma.catatanWali.findMany({
    where: { siswaId: { in: semuaSiswaIds } },
    orderBy: { createdAt: "desc" },
    include: { guru: true },
  });
  const catatanMap = new Map<string, (typeof catatanList)[number]>();
  for (const c of catatanList) {
    if (!catatanMap.has(c.siswaId)) catatanMap.set(c.siswaId, c);
  }

  return (
    <>
      <PageHeader
        title="Wali Kelas"
        description={`Mengelola ${kelasWali.length} kelas yang diwalikan oleh ${guru.nama}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Kelas Diwalikan"
          nilai={kelasWali.length}
          icon="School"
        />
        <StatCard
          label="Total Siswa"
          nilai={semuaSiswaIds.length}
          icon="Users"
          accent="navy"
        />
        <StatCard
          label="Kehadiran Tercatat"
          nilai={rekap.reduce((a, r) => a + (r.status === "hadir" ? r._count._all : 0), 0)}
          icon="ScanLine"
          accent="emerald"
        />
        <StatCard
          label="Total Ketidakhadiran"
          nilai={rekap.reduce(
            (a, r) => a + (["izin", "sakit", "alpa"].includes(r.status) ? r._count._all : 0),
            0,
          )}
          icon="AlertTriangle"
          accent="amber"
        />
      </div>

      {kelasWali.map((k) => (
        <Card
          key={k.id}
          className="mb-6"
          title={`Kelas ${k.nama} — ${k.jurusan?.nama ?? "Umum"}`}
          icon="School"
          action={<Badge tone="sky">{k.siswa.length} siswa</Badge>}
        >
          {k.siswa.length === 0 ? (
            <EmptyState text="Belum ada siswa di kelas ini." icon="Users" />
          ) : (
            <TableWrap>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="py-2 pr-4 font-medium">Nama</th>
                    {STATUS_ABSENSI.map((s) => (
                      <th key={s} className="py-2 pr-4 font-medium capitalize">{s}</th>
                    ))}
                    <th className="py-2 pr-4 font-medium">Kehadiran</th>
                    <th className="py-2 font-medium">Catatan Wali</th>
                  </tr>
                </thead>
                <tbody>
                  {k.siswa.map((s) => {
                    const r = rekapMap.get(s.id);
                    const get = (st: string) => r?.get(st) ?? 0;
                    const hadir = get("hadir");
                    const total = STATUS_ABSENSI.reduce((a, st) => a + get(st), 0);
                    const pct = total > 0 ? Math.round((hadir / total) * 100) : null;
                    const cat = catatanMap.get(s.id);

                    return (
                      <tr key={s.id} className="border-b border-slate-50 align-top hover:bg-slate-50/60">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-navy-900">{s.nama}</p>
                          <p className="font-mono text-[11px] text-slate-400">{s.nis}</p>
                        </td>
                        {STATUS_ABSENSI.map((st) => (
                          <td key={st} className="py-2.5 pr-4 text-slate-600">{get(st)}</td>
                        ))}
                        <td className="py-2.5 pr-4">
                          {pct === null ? (
                            <span className="text-xs text-slate-400">belum ada data</span>
                          ) : (
                            <Badge tone={pct >= 75 ? "emerald" : pct >= 50 ? "amber" : "red"}>
                              {pct}%
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5">
                          {cat && (
                            <p className="mb-2 max-w-xs text-xs text-slate-500">
                              <span className="font-medium text-slate-700">
                                {formatTanggalID(cat.createdAt)}:
                              </span>{" "}
                              {cat.catatan}
                            </p>
                          )}
                          <CatatanForm siswaId={s.id} nama={s.nama.split(" ")[0]} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      ))}
    </>
  );
}
