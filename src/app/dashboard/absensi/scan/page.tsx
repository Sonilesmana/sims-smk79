export const dynamic = "force-dynamic";

import { Card, PageHeader } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { ScanClient } from "./scan-client";
import Link from "next/link";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getSessionUser();
  const { token } = await searchParams;

  if (!user) {
    return (
      <>
        <PageHeader title="Scan Absensi" description="Konfirmasi kehadiran via QR Code" />
        <Card>
          <div className="py-10 text-center">
            <p className="font-medium text-navy-900">Anda harus login sebagai siswa terlebih dahulu.</p>
            <p className="mt-1 text-sm text-slate-500">
              Setelah login, scan ulang QR Code yang ditampilkan guru.
            </p>
            <Link
              href={`/login?next=/dashboard/absensi/scan${token ? `?token=${token}` : ""}`}
              className="mt-4 inline-block rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
            >
              Login sebagai Siswa
            </Link>
          </div>
        </Card>
      </>
    );
  }

  if (!token) {
    return (
      <>
        <PageHeader title="Scan Absensi" description="Cara mencatat kehadiran" />
        <Card>
          <div className="space-y-3 py-6 text-sm text-slate-600">
            <p>
              Halaman ini terbuka ketika Anda <strong>men-scan QR Code</strong> yang ditampilkan
              guru di depan kelas.
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-slate-500">
              <li>Tunggu guru membuka sesi absensi.</li>
              <li>Scan QR Code menggunakan kamera HP.</li>
              <li>Kehadiran langsung tercatat dan dapat dilihat oleh guru.</li>
            </ol>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Konfirmasi Kehadiran" description="Validasi otomatis dengan sesi kelas" />
      <Card>
        <ScanClient token={token} />
      </Card>
    </>
  );
}
