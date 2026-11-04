export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import { mergeSchoolConfig, formatTanggalID } from "@/lib/school-config";
import { Badge } from "@/components/ui";
import { Users, UserCog, School, BookMarked, ScanLine, FileText, MonitorPlay, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const [rows, berita, jurusan, stat] = await Promise.all([
    prisma.pengaturan.findMany({
      where: { kategori: { in: ["sekolah", "akademik"] } },
      select: { kunci: true, nilai: true },
    }),
    prisma.berita.findMany({
      where: { status: "publish" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.jurusan.findMany({ where: { aktif: true }, orderBy: { kode: "asc" } }),
    (async () => ({
      siswa: await prisma.siswa.count({ where: { status: "aktif" } }),
      guru: await prisma.guru.count({ where: { aktif: true } }),
      kelas: await prisma.kelas.count({ where: { aktif: true } }),
      jurusan: await prisma.jurusan.count({ where: { aktif: true } }),
    }))(),
  ]);

  const s = mergeSchoolConfig(rows);

  const fitur = [
    { icon: ScanLine, judul: "Absensi QR Code", teks: "Sesi QR valid 15 menit, terikat jadwal & kelas, real-time." },
    { icon: FileText, judul: "Portal Digital", teks: "Nilai, rapor, absensi, dan tagihan terhubung untuk siswa & orang tua." },
    { icon: MonitorPlay, judul: "CBT Terintegrasi", teks: "Bank soal, ujian online, koreksi otomatis, nilai langsung ke rapor." },
    { icon: ShieldCheck, judul: "Multi Role Aman", teks: "Hak akses berbasis peran dengan validasi di sisi server." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 460px at 8% 0%, #0ea5e9 0%, transparent 55%), radial-gradient(700px 500px at 95% 100%, #1e3a8a 0%, transparent 60%)",
            opacity: 0.45,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Badge tone="sky">{s.tahunAjaranAktif} · Semester {s.semesterAktif}</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Selamat Datang di <br />
            {s.nama}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-sky-100/90">
            Sekolah dengan sistem digital modern: absensi QR Code, portal siswa &amp; guru, CBT, dan
            keuangan — semuanya dalam satu website terintegrasi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ppdb"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-sky-50"
            >
              Daftar PPDB Online
            </Link>
            <Link
              href="/berita"
              className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Berita Sekolah
            </Link>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Users, label: "Siswa Terdaftar", nilai: stat.siswa },
            { icon: UserCog, label: "Guru & Tenaga", nilai: stat.guru },
            { icon: School, label: "Rombel / Kelas", nilai: stat.kelas },
            { icon: BookMarked, label: "Jurusan", nilai: stat.jurusan },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-200 p-5">
              <k.icon className="h-5 w-5 text-sky-500" />
              <p className="mt-3 text-2xl font-bold text-navy-900">{k.nilai}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tentang */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Tentang Sekolah</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {s.nama} merupakan sekolah menengah kejuruan yang mengintegrasikan teknologi digital
              dalam proses belajar mengajar. Mulai dari absensi berbasis QR Code, penilaian digital,
              hingga komunikasi dengan orang tua — semua dapat diakses dari satu portal.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Kami menyediakan jurusan-jurusan yang siap mendukung siswa memasuki dunia kerja,
              didampingi guru-guru berpengalaman dengan fasilitas praktikum yang memadai.
            </p>
            <Link
              href="/profil"
              className="mt-6 inline-block rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              Profil Sekolah
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fitur.map((f) => (
              <div key={f.judul} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-sky-500 shadow-sm">
                  <f.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-navy-900">{f.judul}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.teks}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program keahlian */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-900">Program Keahlian</h2>
            <p className="mt-2 text-sm text-slate-500">
              Jurusan yang tersedia untuk peserta didik baru
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {jurusan.map((j) => (
              <div
                key={j.id}
                className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:border-sky-300 hover:shadow-md"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy-50 text-sm font-bold text-navy-700">
                  {j.kode}
                </span>
                <p className="mt-4 text-sm font-semibold leading-snug text-navy-900">{j.nama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Berita */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-navy-900">Berita Terbaru</h2>
          <Link href="/berita" className="text-sm font-medium text-sky-600 hover:underline">
            Semua berita →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {berita.length === 0 && (
            <p className="col-span-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-400">
              Belum ada berita.
            </p>
          )}
          {berita.map((b) => (
            <article
              key={b.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid h-36 place-items-center bg-navy-900/95">
                <BookMarked className="h-8 w-8 text-sky-400" />
              </div>
              <div className="p-5">
                <p className="text-[11px] text-slate-400">{formatTanggalID(b.publishedAt)}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-navy-900">{b.judul}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{b.ringkasan}</p>
                <Link
                  href={`/berita/${b.slug}`}
                  className="mt-3 inline-block text-xs font-medium text-sky-600 hover:underline"
                >
                  Baca selengkapnya →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
