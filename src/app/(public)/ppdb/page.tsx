export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PpdbForm, CekStatusForm } from "./forms";

export default async function PpdbPage() {
  const jurusan = await prisma.jurusan.findMany({
    where: { aktif: true },
    orderBy: { kode: "asc" },
    select: { id: true, kode: true, nama: true },
  });

  const total = await prisma.ppdbPendaftaran.count();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-xl bg-navy-900 p-8">
        <h1 className="text-2xl font-bold text-white">PPDB Online</h1>
        <p className="mt-2 text-sm text-sky-100/85">
          Penerimaan Peserta Didik Baru — isi formulir di bawah ini, lalu simpan nomor pendaftaran
          untuk memeriksa status.
        </p>
        <p className="mt-3 text-xs text-sky-200/70">{total} pendaftar tercatat</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-navy-900">Formulir Pendaftaran</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Lengkapi data dengan benar. Tanda * wajib diisi.
          </p>
          <PpdbForm jurusan={jurusan} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-navy-900">Cek Status Pendaftaran</h2>
            <p className="mb-4 mt-1 text-xs text-slate-500">
              Masukkan nomor pendaftaran yang Anda terima.
            </p>
            <CekStatusForm />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-base font-semibold text-navy-900">Syarat Pendaftaran</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {[
                "Fotokopi ijazah/surat keterangan lulus",
                "Fotokopi Kartu Keluarga (KK)",
                "Fotokopi Akta Kelahiran",
                "Pas foto 3×4 (2 lembar)",
              ].map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-sky-500">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
