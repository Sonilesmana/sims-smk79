export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProgramPage() {
  const jurusan = await prisma.jurusan.findMany({
    where: { aktif: true },
    orderBy: { kode: "asc" },
    include: { _count: { select: { kelas: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-navy-900">Program Keahlian</h1>
      <p className="mt-2 text-sm text-slate-500">
        Jurusan yang tersedia bagi peserta didik
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {jurusan.length === 0 && (
          <p className="col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm text-slate-400">
            Data jurusan belum tersedia.
          </p>
        )}
        {jurusan.map((j) => (
          <div key={j.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-navy-50 text-sm font-bold text-navy-700">
              {j.kode}
            </span>
            <h2 className="mt-4 text-base font-semibold text-navy-900">{j.nama}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Program keahlian {j.kode} membekali peserta didik dengan kompetensi teknis dan sikap
              profesional sesuai kebutuhan dunia kerja.
            </p>
            <p className="mt-4 text-xs text-slate-400">{j._count.kelas} rombongan belajar</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-navy-900 p-8 text-center">
        <h2 className="text-xl font-bold text-white">Tertarik bergabung?</h2>
        <p className="mt-2 text-sm text-sky-100/85">
          Pendaftaran peserta didik baru dibuka secara online.
        </p>
        <Link
          href="/ppdb"
          className="mt-5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy-900"
        >
          Daftar PPDB Online
        </Link>
      </div>
    </div>
  );
}
