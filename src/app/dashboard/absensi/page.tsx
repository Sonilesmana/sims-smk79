export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Card,
  PageHeader,
  TableWrap,
  Badge,
  EmptyState,
  StatCard,
} from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bukaSesi, tutupSesi } from "./actions";
import { IzinForm } from "./izin-form";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HARI_SEKOLAH: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
};

export default async function AbsensiPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const jsHari = new Date().getDay();
  const hariIni = HARI_SEKOLAH[jsHari] ?? 0;
  const namaHari = HARI[jsHari];

  // ---------- GURU ----------
  if (user.role === "guru") {
    const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
    const jadwal = guru
      ? await prisma.jadwal.findMany({
          where: { guruId: guru.id, hari: hariIni, aktif: true },
          include: { kelas: true, mataPelajaran: true },
          orderBy: { jamMulai: "asc" },
        })
      : [];

    const sesiAktif = guru
      ? await prisma.sesiAbsen.findMany({
          where: { guruId: guru.id, status: "buka" },
          include: {
            kelas: true,
            jadwal: { include: { mataPelajaran: true } },
            _count: { select: { absensi: true } },
          },
          orderBy: { jamBuka: "desc" },
        })
      : [];

    return (
      <>
        <PageHeader
          title="Absensi QR Code"
          description={`${namaHari}, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
          action={
            <div className="flex gap-2">
              <Link href="/dashboard/absensi/rekap" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                Rekap
              </Link>
              <Link href="/dashboard/absensi/koreksi" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                Koreksi
              </Link>
            </div>
          }
        />

        {/* Buka sesi dari jadwal hari ini */}
        <Card className="mb-6" title={`Jadwal Saya — ${namaHari}`} icon="CalendarDays">
          {jadwal.length === 0 ? (
            <EmptyState text="Tidak ada jadwal mengajar hari ini." icon="CalendarDays" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {jadwal.map((j) => {
                const sesiJadwal = sesiAktif.find((s) => s.jadwalId === j.id);
                return (
                  <li key={j.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                    <div>
                      <p className="font-medium text-navy-900">{j.mataPelajaran.nama}</p>
                      <p className="text-xs text-slate-500">
                        {j.jamMulai}–{j.jamSelesai} · {j.kelas.nama} · {j.ruang ?? "Ruang TBD"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {sesiJadwal ? (
                        <Link
                          href={`/dashboard/absensi/sesi/${sesiJadwal.id}`}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Sesi Dibuka ({sesiJadwal._count.absensi} hadir) →
                        </Link>
                      ) : (
                        <>
                          <form action={bukaSesi.bind(null, j.id, "qr_guru")}>
                            <button
                              type="submit"
                              className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"
                            >
                              Buka Sesi · QR
                            </button>
                          </form>
                          <form action={bukaSesi.bind(null, j.id, "qr_siswa")}>
                            <button
                              type="submit"
                              className="rounded-lg border border-navy-900 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-50"
                            >
                              Scan Kartu
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Sesi aktif */}
        <Card title="Sesi Sedang Berjalan" icon="ScanLine">
          {sesiAktif.length === 0 ? (
            <EmptyState text="Belum ada sesi absensi yang dibuka." icon="ScanLine" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {sesiAktif.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      {s.jadwal?.mataPelajaran?.nama ?? "Sesi"} · {s.kelas.nama}
                    </p>
                    <p className="text-xs text-slate-500">
                      Dibuka {new Date(s.jamBuka).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} ·
                      token berlaku s/d {new Date(s.jamTutup).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="emerald">{s._count.absensi} hadir</Badge>
                    <Link
                      href={`/dashboard/absensi/sesi/${s.id}`}
                      className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"
                    >
                      Tampilkan QR
                    </Link>
                    <form action={tutupSesi.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Tutup
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </>
    );
  }

  // ---------- SISWA ----------
  if (user.role === "siswa") {
    const siswa = await prisma.siswa.findUnique({
      where: { userId: user.id },
      include: { kelas: true },
    });

    const riwayat = siswa
      ? await prisma.absensi.findMany({
          where: { siswaId: siswa.id },
          include: {
            sesi: { include: { jadwal: { include: { mataPelajaran: true } } } },
          },
          orderBy: { waktuScan: "desc" },
          take: 10,
        })
      : [];

    const total = { hadir: 0, izin: 0, sakit: 0, alpa: 0, terlambat: 0 };
    if (siswa) {
      const rekap = await prisma.absensi.groupBy({
        by: ["status"],
        where: { siswaId: siswa.id },
        _count: { _all: true },
      });
      for (const r of rekap) {
        if (r.status in total) total[r.status as keyof typeof total] = r._count._all;
      }
    }
    const totalCatat = Object.values(total).reduce((a, b) => a + b, 0);
    const pctHadir = totalCatat > 0 ? Math.round((total.hadir / totalCatat) * 100) : 0;

    return (
      <>
        <PageHeader title="Absensi Saya" description={siswa?.kelas ? `Kelas ${siswa.kelas.nama}` : undefined} />

        <div className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-5">
          <StatCard label="Hadir" nilai={total.hadir} icon="CheckCircle2" accent="emerald" />
          <StatCard label="Izin" nilai={total.izin} icon="FileText" accent="amber" />
          <StatCard label="Sakit" nilai={total.sakit} icon="Thermometer" accent="sky" />
          <StatCard label="Alpa" nilai={total.alpa} icon="UserX" accent="navy" />
          <StatCard label="% Kehadiran" nilai={`${pctHadir}%`} icon="Activity" accent="emerald" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Scan Absensi" icon="ScanLine">
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Saat guru menampilkan <strong>QR Code</strong> di depan kelas, scan menggunakan{" "}
                <strong>kamera HP Anda</strong>. Anda akan otomatis diarahkan ke halaman konfirmasi
                kehadiran.
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-xs text-slate-500">
                <li>Buka kamera HP (atau aplikasi pemindai QR).</li>
                <li>Arahkan ke QR Code yang ditampilkan guru.</li>
                <li>Ketuk tautan/notifikasi yang muncul — kehadiran langsung tercatat.</li>
              </ol>
              <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
                QR Code berlaku <strong>15 menit</strong> dan hanya untuk kelas Anda. Satu orang hanya
                dapat tercatat sekali di setiap sesi.
              </p>
            </div>
          </Card>

          <Card title="Pengajuan Izin / Sakit" icon="FilePlus">
            <IzinForm />
          </Card>
        </div>

        <Card className="mt-6" title="Riwayat 10 Absensi Terakhir" icon="History">
          {riwayat.length === 0 ? (
            <EmptyState text="Belum ada riwayat absensi." icon="ScanLine" />
          ) : (
            <TableWrap>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="py-2 pr-4 font-medium">Waktu</th>
                    <th className="py-2 pr-4 font-medium">Mata Pelajaran</th>
                    <th className="py-2 pr-4 font-medium">Metode</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-2.5 pr-4 text-xs text-slate-500">
                        {new Date(r.waktuScan).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-navy-900">
                        {r.sesi.jadwal?.mataPelajaran?.nama ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">{r.metode}</td>
                      <td className="py-2.5">
                        <Badge
                          tone={
                            r.status === "hadir"
                              ? "emerald"
                              : r.status === "izin" || r.status === "sakit"
                                ? "amber"
                                : "red"
                          }
                        >
                          {r.status}
                        </Badge>
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

  // ---------- ORANG TUA ----------
  if (user.role === "orang_tua") {
    const ortu = await prisma.orangTua.findUnique({
      where: { userId: user.id },
      include: { anakanak: { include: { siswa: { include: { kelas: true } } } } },
    });
    const anak = ortu?.anakanak ?? [];

    const rekapAnak = await Promise.all(
      anak.map(async (a) => {
        const r = await prisma.absensi.groupBy({
          by: ["status"],
          where: { siswaId: a.siswaId },
          _count: { _all: true },
        });
        const total = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
        for (const x of r) {
          if (x.status in total) total[x.status as keyof typeof total] = x._count._all;
        }
        return { nama: a.siswa.nama, kelas: a.siswa.kelas?.nama, ...total };
      }),
    );

    return (
      <>
        <PageHeader title="Absensi Anak" description="Rekap kehadiran anak Anda" />
        <Card>
          {rekapAnak.length === 0 ? (
            <EmptyState text="Belum ada anak yang terhubung ke akun Anda." icon="HeartHandshake" />
          ) : (
            <TableWrap>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="py-2 pr-4 font-medium">Nama Anak</th>
                    <th className="py-2 pr-4 font-medium">Kelas</th>
                    <th className="py-2 pr-4 font-medium">Hadir</th>
                    <th className="py-2 pr-4 font-medium">Izin</th>
                    <th className="py-2 pr-4 font-medium">Sakit</th>
                    <th className="py-2 font-medium">Alpa</th>
                  </tr>
                </thead>
                <tbody>
                  {rekapAnak.map((a) => (
                    <tr key={a.nama} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-2.5 pr-4 font-medium text-navy-900">{a.nama}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{a.kelas ?? "-"}</td>
                      <td className="py-2.5 pr-4 text-emerald-600">{a.hadir}</td>
                      <td className="py-2.5 pr-4 text-amber-600">{a.izin}</td>
                      <td className="py-2.5 pr-4 text-sky-600">{a.sakit}</td>
                      <td className="py-2.5 font-medium text-red-600">{a.alpa}</td>
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

  // ---------- SEMUA ROLE LAIN (ringkasan & tautan) ----------
  const awalHari = new Date();
  awalHari.setHours(0, 0, 0, 0);
  const [hadir, izin, sakit, alpa] = await Promise.all([
    prisma.absensi.count({ where: { status: "hadir", waktuScan: { gte: awalHari } } }),
    prisma.absensi.count({ where: { status: "izin", waktuScan: { gte: awalHari } } }),
    prisma.absensi.count({ where: { status: "sakit", waktuScan: { gte: awalHari } } }),
    prisma.absensi.count({ where: { status: "alpa", waktuScan: { gte: awalHari } } }),
  ]);

  return (
    <>
      <PageHeader title="Absensi & Rekap" description="Pantauan absensi hari ini" />
      <div className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatCard label="Hadir Hari Ini" nilai={hadir} icon="CheckCircle2" accent="emerald" />
        <StatCard label="Izin" nilai={izin} icon="FileText" accent="amber" />
        <StatCard label="Sakit" nilai={sakit} icon="Thermometer" accent="sky" />
        <StatCard label="Alpa" nilai={alpa} icon="UserX" accent="navy" />
      </div>
      <Card title="Menu Absensi" icon="ScanLine">
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/absensi/rekap" className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
            Rekap per Kelas
          </Link>
          <Link href="/dashboard/absensi/koreksi" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Koreksi Absensi
          </Link>
          <Link href="/dashboard/kesiswaan" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Pengajuan Izin (Kesiswaan)
          </Link>
        </div>
      </Card>
    </>
  );
}
