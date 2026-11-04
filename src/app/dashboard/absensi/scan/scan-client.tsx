"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { lakukanScan, type ScanHasil } from "../actions";

export function ScanClient({ token }: { token: string }) {
  const [hasil, setHasil] = useState<ScanHasil | null>(null);
  const berjalan = useRef(false);

  useEffect(() => {
    if (berjalan.current) return; // cegah eksekusi ganda (StrictMode)
    berjalan.current = true;
    lakukanScan(token)
      .catch(() => setHasil({ ok: false, pesan: "Terjadi kesalahan jaringan. Coba lagi." }))
      .then((r) => r && setHasil(r));
  }, [token]);

  if (!hasil) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        <div>
          <p className="font-semibold text-navy-900">Mencatat kehadiran…</p>
          <p className="mt-1 text-sm text-slate-500">Memvalidasi QR dengan sesi kelas Anda.</p>
        </div>
      </div>
    );
  }

  const Icon = hasil.ok ? CheckCircle2 : XCircle;

  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <span
        className={`grid h-20 w-20 place-items-center rounded-full ${
          hasil.ok ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
        }`}
      >
        <Icon className="h-10 w-10" />
      </span>
      <div>
        <p className={`text-lg font-bold ${hasil.ok ? "text-emerald-700" : "text-red-700"}`}>
          {hasil.ok ? "Hadir Tercatat!" : "Gagal Mencatat"}
        </p>
        <p className="mt-1 text-sm text-slate-600">{hasil.pesan}</p>
      </div>

      {hasil.ok && (
        <div className="w-full max-w-sm rounded-xl border border-emerald-200 bg-emerald-50/60 px-6 py-4 text-sm text-emerald-900">
          <p><span className="font-medium">Nama:</span> {hasil.nama}</p>
          {hasil.mapel && <p><span className="font-medium">Mata Pelajaran:</span> {hasil.mapel}</p>}
          {hasil.kelas && <p><span className="font-medium">Kelas:</span> {hasil.kelas}</p>}
          {hasil.waktu && <p><span className="font-medium">Waktu Scan:</span> {hasil.waktu} WIB</p>}
        </div>
      )}

      <Link
        href="/dashboard/absensi"
        className="mt-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
      >
        Kembali ke Absensi
      </Link>
    </div>
  );
}
