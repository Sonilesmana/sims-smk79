export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Card, PageHeader } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tutupSesi } from "../../actions";
import { LiveHadir } from "./live-hadir";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sims-smk79.vercel.app";

export default async function SesiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const sesi = await prisma.sesiAbsen.findUnique({
    where: { id },
    include: {
      kelas: true,
      jadwal: { include: { mataPelajaran: true, guru: true } },
      absensi: {
        include: { siswa: true },
        orderBy: { waktuScan: "asc" },
      },
    },
  });
  if (!sesi) notFound();

  // Akses: pemilik sesi, admin, kurikulum, kesiswaan, kepala sekolah
  const guruPemilik =
    user.role === "admin" ||
    ["kurikulum", "kesiswaan", "kepsek", "wali_kelas"].includes(user.role) ||
    (user.role === "guru" &&
      (await prisma.guru.findUnique({ where: { userId: user.id } }))?.id === sesi.guruId);
  if (!guruPemilik) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-slate-500">
          Anda tidak mengelola sesi absensi ini.
        </p>
      </Card>
    );
  }

  const totalSiswa = await prisma.siswa.count({
    where: { kelasId: sesi.kelasId, status: "aktif" },
  });

  const scanUrl = `${APP_URL}/dashboard/absensi/scan?token=${sesi.token}`;
  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 320,
    margin: 2,
    color: { dark: "#0f1e47", light: "#ffffff" },
  });

  const kedaluwarsa = new Date() > sesi.jamTutup;
  const aktif = sesi.status === "buka" && !kedaluwarsa;
  const hadirAwal = sesi.absensi.map((a) => ({
    siswaId: a.siswaId,
    nama: a.siswa.nama,
    pukul: new Date(a.waktuScan).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    metode: a.metode,
  }));

  return (
    <>
      <PageHeader
        title={`Sesi Absensi — ${sesi.jadwal?.mataPelajaran?.nama ?? "Umum"}`}
        description={`Kelas ${sesi.kelas.nama} · ${sesi.kode} · dibuka ${new Date(sesi.jamBuka).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/absensi/manual?sesi=${sesi.id}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Input Manual
            </Link>
            <Link
              href={`/dashboard/absensi/scan-guru?sesi=${sesi.id}`}
              className="rounded-lg border border-navy-900 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-50"
            >
              📷 Scan Kartu Pelajar
            </Link>
            {sesi.status === "buka" && (
              <form action={tutupSesi.bind(null, sesi.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Tutup Sesi
                </button>
              </form>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Panel QR */}
        <Card title="QR Code Absensi" icon="QrCode">
          {aktif ? (
            <div className="flex flex-col items-center">
              <img
                src={qrDataUrl}
                alt="QR Code Absensi"
                width={280}
                height={280}
                className="rounded-xl border border-slate-200 shadow-sm"
              />
              <p className="mt-4 text-center text-xs text-slate-500">
                Siswa scan QR ini dengan kamera HP masing-masing.
                <br />
                Token berlaku 15 menit (s/d{" "}
                {new Date(sesi.jamTutup).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB)
                dan hanya untuk kelas {sesi.kelas.nama}.
              </p>
              <div className="mt-4 w-full rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Tautan alternatif (ketik manual)
                </p>
                <p className="mt-1 break-all font-mono text-[11px] text-sky-700">{scanUrl}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-lg font-semibold text-slate-500">
                {sesi.status === "tutup" ? "Sesi telah ditutup" : "QR Code kedaluwarsa"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Token absensi hanya berlaku 15 menit sejak sesi dibuka.
              </p>
            </div>
          )}
        </Card>

        {/* Panel daftar hadir live */}
        <Card title="Kehadiran Real-Time" icon="Users">
          <LiveHadir sesiId={sesi.id} totalSiswa={totalSiswa} aktifAwal={hadirAwal} />
        </Card>
      </div>

      {/* Rekap sederhana untuk sesi ini */}
      <Card className="mt-6" title="Rekapitulasi Sesi Ini" icon="ClipboardList">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <span>
              Hadir: <strong className="text-emerald-600">{sesi.absensi.filter((a) => a.status === "hadir").length}</strong>
            </span>
            <span>
              Izin/Sakit: <strong className="text-amber-600">{sesi.absensi.filter((a) => ["izin", "sakit"].includes(a.status)).length}</strong>
            </span>
            <span>
              Belum tercatat: <strong className="text-slate-500">{Math.max(0, totalSiswa - sesi.absensi.length)}</strong>
            </span>
          </div>
          <Link
            href={`/dashboard/absensi/rekap?kelas=${sesi.kelasId}`}
            className="text-xs font-medium text-sky-600 hover:underline"
          >
            Lihat rekap lengkap kelas →
          </Link>
        </div>
      </Card>
    </>
  );
}
