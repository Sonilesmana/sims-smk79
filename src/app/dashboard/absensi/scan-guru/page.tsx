export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { getSessionUser, punyaPermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GuruScanner } from "./guru-scanner";

export default async function ScanGuruPage({
  searchParams,
}: {
  searchParams: Promise<{ sesi?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || !punyaPermission(user, "absensi.create")) return null;

  const { sesi: sesiId } = await searchParams;

  if (!sesiId) {
    // Tampilkan daftar sesi buka milik guru bila belum memilih
    const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
    const sesiAktif = guru
      ? await prisma.sesiAbsen.findMany({
          where: { guruId: guru.id, status: "buka" },
          include: { kelas: true, jadwal: { include: { mataPelajaran: true } } },
          orderBy: { jamBuka: "desc" },
        })
      : [];

    return (
      <>
        <PageHeader title="Scan Kartu Pelajar" description="Pilih sesi yang sedang berjalan" />
        <Card>
          {sesiAktif.length === 0 ? (
            <EmptyState
              text="Tidak ada sesi yang sedang berjalan. Buka sesi terlebih dahulu."
              icon="ScanLine"
              action={
                <Link href="/dashboard/absensi" className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white">
                  Ke Halaman Absensi
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {sesiAktif.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-navy-900">
                    {s.jadwal?.mataPelajaran?.nama ?? "Sesi"} · {s.kelas.nama}
                  </span>
                  <Link
                    href={`/dashboard/absensi/scan-guru?sesi=${s.id}`}
                    className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"
                  >
                    Pilih & Scan
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </>
    );
  }

  const sesi = await prisma.sesiAbsen.findUnique({
    where: { id: sesiId },
    include: { kelas: true, jadwal: { include: { mataPelajaran: true } } },
  });
  if (!sesi) notFound();

  const aktif = sesi.status === "buka" && new Date() <= sesi.jamTutup;

  return (
    <>
      <PageHeader
        title="Scan Kartu Pelajar"
        description={`${sesi.jadwal?.mataPelajaran?.nama ?? "Sesi"} · Kelas ${sesi.kelas.nama}`}
        action={
          <Link
            href={`/dashboard/absensi/sesi/${sesi.id}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            ← Detail Sesi
          </Link>
        }
      />
      <Card title="Arahkan Kamera ke Kartu Pelajar" icon="Camera">
        <GuruScanner sesiId={sesi.id} diaktifkan={aktif} />
      </Card>
    </>
  );
}
