import Link from "next/link";
import { SCHOOL_DEFAULT } from "@/lib/school-config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri: identitas sekolah */}
      <div className="relative hidden lg:flex flex-col justify-between bg-navy-900 p-12 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(900px 500px at 10% 0%, #0ea5e9 0%, transparent 55%), radial-gradient(700px 500px at 90% 100%, #1e3a8a 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 text-xl font-bold">
              79
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight">{SCHOOL_DEFAULT.nama}</p>
              <p className="text-sm text-sky-200">Sistem Informasi Manajemen Sekolah</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Satu aplikasi untuk seluruh kegiatan sekolah.
          </h1>
          <p className="mt-4 text-sky-100/90">
            Absensi QR Code, akademik &amp; kurikulum, CBT, tata usaha, keuangan, hingga rapor
            digital — semuanya terhubung dalam satu database.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-sky-100/85">
            {[
              "Absensi QR Code real-time",
              "Rapor digital & penilaian terpadu",
              "Computer Based Test (CBT)",
              "Keuangan & tagihan terintegrasi",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-500/25 text-sky-200">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sky-200/70">
          © {new Date().getFullYear()} {SCHOOL_DEFAULT.nama} — Portal Sekolah
        </p>
      </div>

      {/* Panel kanan: form */}
      <div className="flex flex-col items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy-900 text-white font-bold">
                79
              </div>
              <span className="font-semibold text-navy-900">{SCHOOL_DEFAULT.singkatan}</span>
            </div>
            <Link href="/" className="text-sm text-sky-600 hover:underline">
              ← Website
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
