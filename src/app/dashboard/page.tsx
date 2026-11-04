export const dynamic = "force-dynamic";

import { Card, StatCard } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatTanggalID } from "@/lib/school-config";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [jumlahSiswa, jumlahGuru, jumlahKelas, jumlahMapel] = await Promise.all([
    prisma.siswa.count({ where: { status: "aktif" } }),
    prisma.guru.count({ where: { aktif: true } }),
    prisma.kelas.count({ where: { aktif: true } }),
    prisma.mataPelajaran.count({ where: { aktif: true } }),
  ]);

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Data ringkas khusus per peran
  let ringkas: { label: string; nilai: string }[] = [];
  if (user.role === "siswa") {
    const siswa = await prisma.siswa.findUnique({ where: { userId: user.id } });
    if (siswa) {
      const [absensi, nilai] = await Promise.all([
        prisma.absensi.count({ where: { siswaId: siswa.id, status: "hadir" } }),
        prisma.nilai.count({ where: { siswaId: siswa.id } }),
      ]);
      const tagihan = await prisma.tagihan.aggregate({
        where: { siswaId: siswa.id, status: { not: "lunas" } },
        _sum: { totalTagihan: true, dibayar: true },
      });
      const sisa =
        (tagihan._sum.totalTagihan ?? 0) - (tagihan._sum.dibayar ?? 0);
      ringkas = [
        { label: "Kehadiran tercatat", nilai: String(absensi) },
        { label: "Penilaian diterima", nilai: String(nilai) },
        { label: "Sisa tagihan", nilai: formatRupiah(sisa) },
      ];
    }
  } else if (user.role === "orang_tua") {
    const ortu = await prisma.orangTua.findUnique({
      where: { userId: user.id },
      include: { anakanak: { include: { siswa: true } } },
    });
    const anak = ortu?.anakanak ?? [];
    const ids = anak.map((a) => a.siswaId);
    const [hadir, alpa, sisaTagihan] = await Promise.all([
      prisma.absensi.count({ where: { siswaId: { in: ids }, status: "hadir" } }),
      prisma.absensi.count({ where: { siswaId: { in: ids }, status: "alpa" } }),
      prisma.tagihan.aggregate({
        where: { siswaId: { in: ids }, status: { not: "lunas" } },
        _sum: { totalTagihan: true, dibayar: true },
      }),
    ]);
    ringkas = [
      { label: "Anak terhubung", nilai: String(anak.length) },
      { label: "Kehadiran anak", nilai: String(hadir) },
      { label: "Ketidakhadiran (alpa)", nilai: String(alpa) },
      {
        label: "Sisa tagihan",
        nilai: formatRupiah(
          (sisaTagihan._sum.totalTagihan ?? 0) - (sisaTagihan._sum.dibayar ?? 0),
        ),
      },
    ];
  } else if (user.role === "keuangan") {
    const [masuk, keluar] = await Promise.all([
      prisma.pembayaran.aggregate({ _sum: { jumlah: true } }),
      prisma.pengeluaran.aggregate({
        where: { status: "disetujui" },
        _sum: { jumlah: true },
      }),
    ]);
    ringkas = [
      { label: "Total pemasukan", nilai: formatRupiah(masuk._sum.jumlah ?? 0) },
      { label: "Total pengeluaran", nilai: formatRupiah(keluar._sum.jumlah ?? 0) },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">Dashboard {user.roleNama}</h1>
        <p className="text-sm text-slate-500">{hariIni}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Siswa Aktif" nilai={jumlahSiswa} icon="Users" />
        <StatCard label="Guru & Tenaga" nilai={jumlahGuru} icon="UserCog" />
        <StatCard label="Rombongan Belajar" nilai={jumlahKelas} icon="School" />
        <StatCard label="Mata Pelajaran" nilai={jumlahMapel} icon="BookMarked" />
      </div>

      {ringkas.length > 0 && (
        <Card title="Ringkasan Anda" icon="Activity">
          <ul className="divide-y divide-slate-100">
            {ringkas.map((r) => (
              <li key={r.label} className="flex items-center justify-between py-3 text-sm">
                <span className="text-slate-600">{r.label}</span>
                <span className="font-semibold text-navy-900">{r.nilai}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Pengumuman Terbaru" icon="Megaphone">
          <PengumumanRingkas />
        </Card>
        <Card title="Berita Website" icon="Newspaper">
          <BeritaRingkas />
        </Card>
      </div>
    </div>
  );
}

async function PengumumanRingkas() {
  const rows = await prisma.pengumuman.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  if (rows.length === 0)
    return <EmptyState text="Belum ada pengumuman." />;
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((p) => (
        <li key={p.id} className="py-3">
          <p className="text-sm font-medium text-navy-900">{p.judul}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{p.konten}</p>
          <p className="mt-1 text-[11px] text-slate-400">{formatTanggalID(p.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}

async function BeritaRingkas() {
  const rows = await prisma.berita.findMany({
    where: { status: "publish" },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });
  if (rows.length === 0) return <EmptyState text="Belum ada berita." />;
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((b) => (
        <li key={b.id} className="py-3">
          <p className="text-sm font-medium text-navy-900">{b.judul}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{b.ringkasan}</p>
          <p className="mt-1 text-[11px] text-slate-400">{formatTanggalID(b.publishedAt)}</p>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
