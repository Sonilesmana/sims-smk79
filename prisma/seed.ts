/**
 * Seed database SIMS SMK YP 79 Majalaya (M1)
 * - 9 role + permission
 * - Akun demo tiap role (kredensial ada di README)
 * - Pengaturan sekolah (dapat diubah lewat menu Pengaturan)
 * - Master awal: tahun ajaran, semester, jurusan, kelas, mata pelajaran
 * - Contoh guru, siswa, orang tua + relasi
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PERMISSIONS, ROLES } from "../src/lib/rbac";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin#12345";

function qrToken() {
  return "QR" + randomBytes(8).toString("hex").toUpperCase();
}

async function main() {
  console.log("Seeding SIMS SMK YP 79 Majalaya...");

  // 1. Permission
  const permMap = new Map<string, string>();
  for (const p of PERMISSIONS) {
    const row = await prisma.permission.upsert({
      where: { kode: p.kode },
      update: { modul: p.modul, aksi: p.aksi, label: p.label },
      create: { kode: p.kode, modul: p.modul, aksi: p.aksi, label: p.label },
    });
    permMap.set(p.kode, row.id);
  }

  // 2. Role + role_permission
  const roleMap = new Map<string, string>();
  for (const r of ROLES) {
    const row = await prisma.role.upsert({
      where: { kode: r.kode },
      update: { nama: r.nama, deskripsi: r.deskripsi },
      create: { kode: r.kode, nama: r.nama, deskripsi: r.deskripsi },
    });
    roleMap.set(r.kode, row.id);

    await prisma.rolePermission.deleteMany({ where: { roleId: row.id } });
    for (const kode of r.permissions) {
      const pid = permMap.get(kode);
      if (!pid) continue;
      await prisma.rolePermission.create({ data: { roleId: row.id, permissionId: pid } });
    }
  }

  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // 3. Pengaturan sekolah
  const pengaturan: [string, string, string][] = [
    ["sekolah.nama", "SMK YP 79 Majalaya", "sekolah"],
    ["sekolah.singkatan", "SMK YP 79", "sekolah"],
    ["sekolah.npsn", "", "sekolah"],
    ["sekolah.akreditasi", "A", "sekolah"],
    ["sekolah.alamat", "Majalaya, Kabupaten Bandung, Jawa Barat", "sekolah"],
    ["sekolah.telepon", "", "sekolah"],
    ["sekolah.email", "", "sekolah"],
    ["sekolah.website", "", "sekolah"],
    ["sekolah.kepala_sekolah", "", "sekolah"],
    ["sekolah.logo_url", "/logo.svg", "sekolah"],
    ["sekolah.motto", "Berkarakter, Kompeten, Siap Kerja", "sekolah"],
    ["akademik.tahun_ajaran_aktif", "2025/2026", "akademik"],
    ["akademik.semester_aktif", "Ganjil", "akademik"],
  ];
  for (const [kunci, nilai, kategori] of pengaturan) {
    await prisma.pengaturan.upsert({
      where: { kunci },
      update: { nilai, kategori },
      create: { kunci, nilai, kategori },
    });
  }

  // 4. Tahun ajaran & semester
  const ta = await prisma.tahunAjaran.upsert({
    where: { nama: "2025/2026" },
    update: { aktif: true },
    create: {
      nama: "2025/2026",
      tanggalMulai: new Date("2025-07-14"),
      tanggalAkhir: new Date("2026-06-30"),
      aktif: true,
    },
  });
  const semGanjil = await prisma.semester.upsert({
    where: { tahunAjaranId_nama: { tahunAjaranId: ta.id, nama: "Ganjil" } },
    update: { aktif: true },
    create: { tahunAjaranId: ta.id, nama: "Ganjil", aktif: true, urutan: 1 },
  });
  await prisma.semester.upsert({
    where: { tahunAjaranId_nama: { tahunAjaranId: ta.id, nama: "Genap" } },
    update: {},
    create: { tahunAjaranId: ta.id, nama: "Genap", aktif: false, urutan: 2 },
  });

  // 5. Jurusan — 3 program keahlian: AKL, TSM, TKJ
  const jurusanDef = [
    { kode: "AKL", nama: "Akuntansi dan Keuangan Lembaga" },
    { kode: "TSM", nama: "Teknik Sepeda Motor" },
    { kode: "TKJ", nama: "Teknik Komputer dan Jaringan" },
  ];
  const jurusanMap = new Map<string, string>();
  for (const j of jurusanDef) {
    const row = await prisma.jurusan.upsert({
      where: { kode: j.kode },
      update: { nama: j.nama, aktif: true },
      create: { kode: j.kode, nama: j.nama },
    });
    jurusanMap.set(j.kode, row.id);
  }

  // Jurusan lama yang sudah tidak dipakai — hapus agar tersisa 3
  await prisma.jurusan.deleteMany({ where: { kode: { in: ["MPLB", "TKRO"] } } });

  // 6. Mata pelajaran
  const mapelDef = [
    { kode: "PAI", nama: "Pendidikan Agama dan Budi Pekerti", kelompok: "umum" },
    { kode: "PPKN", nama: "Pendidikan Pancasila dan Kewarganegaraan", kelompok: "umum" },
    { kode: "BIN", nama: "Bahasa Indonesia", kelompok: "umum" },
    { kode: "MAT", nama: "Matematika", kelompok: "umum" },
    { kode: "BING", nama: "Bahasa Inggris", kelompok: "umum" },
    { kode: "PJOK", nama: "Pendidikan Jasmani, Olahraga, dan Kesehatan", kelompok: "umum" },
    { kode: "SEJ", nama: "Sejarah Indonesia", kelompok: "umum" },
    { kode: "INF", nama: "Informatika", kelompok: "umum" },
    { kode: "AKL-DAS", nama: "Dasar-dasar Akuntansi dan Keuangan Lembaga", kelompok: "kejuruan" },
    { kode: "TSM-DAS", nama: "Dasar-dasar Teknik Sepeda Motor", kelompok: "kejuruan" },
    { kode: "TKJ-DAS", nama: "Dasar-dasar Teknik Jaringan Komputer dan Telekomunikasi", kelompok: "kejuruan" },
    { kode: "PKK", nama: "Projek Kreatif dan Kewirausahaan", kelompok: "kejuruan" },
  ];
  const mapelMap = new Map<string, string>();
  for (const m of mapelDef) {
    const row = await prisma.mataPelajaran.upsert({
      where: { kode: m.kode },
      update: { nama: m.nama, kelompok: m.kelompok },
      create: { kode: m.kode, nama: m.nama, kelompok: m.kelompok },
    });
    mapelMap.set(m.kode, row.id);
  }
  // Mapel lama yang sudah dihapus — bersihkan
  await prisma.mataPelajaran.deleteMany({ where: { kode: { in: ["MPLB-DAS", "TKRO-DAS"] } } });

  // 7. Akun + profil tiap role
  type AkunDef = {
    username: string;
    nama: string;
    role: string;
    guru?: { nip: string; jenisKelamin: string };
    siswa?: { nis: string; kelasKode?: string; jenisKelamin: string };
    ortu?: { telepon: string };
  };
  const akun: AkunDef[] = [
    { username: "admin", nama: "Administrator", role: "admin" },
    { username: "kepsek", nama: "Drs. H. Ahmad Suryana, M.Pd.", role: "kepala_sekolah" },
    { username: "kurikulum", nama: "Eli Nurlaela, S.Pd.", role: "kurikulum", guru: { nip: "197801012005011002", jenisKelamin: "P" } },
    { username: "tu", nama: "Siti Aminah, S.E.", role: "tu" },
    { username: "keuangan", nama: "Bendahara Sekolah", role: "keuangan" },
    { username: "cbt", nama: "Admin CBT", role: "cbt" },
    { username: "guru", nama: "Budi Santoso, S.Kom.", role: "guru", guru: { nip: "198501012010011003", jenisKelamin: "L" } },
    { username: "kaprog", nama: "Asep Sudrajat, S.T.", role: "kaprog", guru: { nip: "199001012015041001", jenisKelamin: "L" } },
    { username: "kesiswaan", nama: "Rangga Wijaya, S.Pd. (Kesiswaan)", role: "kesiswaan" },
    { username: "siswa", nama: "Ahmad Fauzi", role: "siswa", siswa: { nis: "2425001", kelasKode: "X TKJ 1", jenisKelamin: "L" } },
    { username: "orangtua", nama: "Sutrisno (Wali Ahmad)", role: "orang_tua", ortu: { telepon: "081200000001" } },
  ];

  const kelasDef = [
    { nama: "X TKJ 1", tingkat: "X", kode: "TKJ" },
    { nama: "X AKL 1", tingkat: "X", kode: "AKL" },
    { nama: "X TSM 1", tingkat: "X", kode: "TSM" },
    { nama: "XI TKJ 1", tingkat: "XI", kode: "TKJ" },
    { nama: "XII TKJ 1", tingkat: "XII", kode: "TKJ" },
  ];

  const siswaRows: { id: string; nama: string; kelasKode?: string }[] = [];

  for (const a of akun) {
    const user = await prisma.user.upsert({
      where: { username: a.username },
      update: { nama: a.nama, roleId: roleMap.get(a.role)! },
      create: {
        username: a.username,
        nama: a.nama,
        passwordHash: hash,
        roleId: roleMap.get(a.role)!,
        email: a.username === "admin" ? "admin@smkyp79.sch.id" : null,
      },
    });

    if (a.guru) {
      await prisma.guru.upsert({
        where: { userId: user.id },
        update: { nama: a.nama, nip: a.guru.nip, jenisKelamin: a.guru.jenisKelamin },
        create: { userId: user.id, nama: a.nama, nip: a.guru.nip, jenisKelamin: a.guru.jenisKelamin },
      });
    }

    if (a.siswa) {
      // pastikan kelas ada
      const kode = a.siswa.kelasKode ?? "X TKJ 1";
      const def = kelasDef.find((k) => k.nama === kode) ?? kelasDef[0];
      const kelas = await prisma.kelas.upsert({
        where: { nama_tahunAjaranId: { nama: def.nama, tahunAjaranId: ta.id } },
        update: {},
        create: {
          nama: def.nama,
          tingkat: def.tingkat,
          tahunAjaranId: ta.id,
          jurusanId: jurusanMap.get(def.kode),
        },
      });
      const s = await prisma.siswa.upsert({
        where: { userId: user.id },
        update: { nama: a.nama, kelasId: kelas.id },
        create: {
          userId: user.id,
          nis: a.siswa.nis,
          nama: a.nama,
          jenisKelamin: a.siswa.jenisKelamin,
          kelasId: kelas.id,
          qrCode: qrToken(),
        },
      });
      siswaRows.push({ id: s.id, nama: s.nama, kelasKode: def.nama });
    }
  }

  // Tetapkan Kaprog TKJ: Asep Sudrajat
  const kaprogUser = await prisma.user.findUnique({ where: { username: "kaprog" } });
  if (kaprogUser) {
    await prisma.guru.update({
      where: { userId: kaprogUser.id },
      data: { kaprogJurusanId: jurusanMap.get("TKJ") },
    });
  }

  // Wali kelas X TKJ 1: Budi Santoso
  const guruUser = await prisma.user.findUnique({ where: { username: "guru" } });
  if (guruUser) {
    const wali = await prisma.guru.findUnique({ where: { userId: guruUser.id } });
    if (wali) {
      await prisma.kelas.updateMany({
        where: { nama: "X TKJ 1", tahunAjaranId: ta.id },
        data: { waliKelasId: wali.id },
      });
    }
  }

  // kelas sisanya
  for (const def of kelasDef) {
    await prisma.kelas.upsert({
      where: { nama_tahunAjaranId: { nama: def.nama, tahunAjaranId: ta.id } },
      update: { tingkat: def.tingkat, jurusanId: jurusanMap.get(def.kode) },
      create: {
        nama: def.nama,
        tingkat: def.tingkat,
        tahunAjaranId: ta.id,
        jurusanId: jurusanMap.get(def.kode),
      },
    });
  }

  // relasi orang tua -> anak
  const ortuUser = await prisma.user.findUnique({ where: { username: "orangtua" } });
  if (ortuUser && siswaRows[0]) {
    const ortu = await prisma.orangTua.findUnique({ where: { userId: ortuUser.id } });
    if (ortu) {
      await prisma.siswaOrangTua.upsert({
        where: { siswaId_orangTuaId: { siswaId: siswaRows[0].id, orangTuaId: ortu.id } },
        update: { hubungan: "wali", utama: true },
        create: { siswaId: siswaRows[0].id, orangTuaId: ortu.id, hubungan: "wali", utama: true },
      });
    }
  }

  // 8. Beberapa siswa tambahan (data uji awal, dapat dihapus)
  const siswaTambahan = [
    { nis: "2425002", nama: "Dewi Lestari", kelas: "X TKJ 1", jk: "P" },
    { nis: "2425003", nama: "Rizky Pratama", kelas: "X TKJ 1", jk: "L" },
    { nis: "2425004", nama: "Nurhaliza Putri", kelas: "X AKL 1", jk: "P" },
    { nis: "2425005", nama: "Rangga Saputra", kelas: "X TSM 1", jk: "L" },
    { nis: "2325001", nama: "Fajar Nugraha", kelas: "XI TKJ 1", jk: "L" },
    { nis: "2225001", nama: "Intan Permata", kelas: "XII TKJ 1", jk: "P" },
  ];
  for (const s of siswaTambahan) {
    const def = kelasDef.find((k) => k.nama === s.kelas) ?? kelasDef[0];
    const kelas = await prisma.kelas.findUnique({
      where: { nama_tahunAjaranId: { nama: def.nama, tahunAjaranId: ta.id } },
    });
    const user = await prisma.user.upsert({
      where: { username: s.nis },
      update: { nama: s.nama, roleId: roleMap.get("siswa")! },
      create: { username: s.nis, nama: s.nama, passwordHash: hash, roleId: roleMap.get("siswa")! },
    });
    await prisma.siswa.upsert({
      where: { userId: user.id },
      update: { nama: s.nama, kelasId: kelas?.id },
      create: {
        userId: user.id,
        nis: s.nis,
        nama: s.nama,
        jenisKelamin: s.jk,
        kelasId: kelas?.id,
        qrCode: qrToken(),
      },
    });
  }

  // 9. Jenis penilaian & jenis pembayaran dasar
  const jenisNilai = [
    { kode: "tugas", nama: "Tugas", bobot: 25 },
    { kode: "uh", nama: "Ulangan Harian", bobot: 25 },
    { kode: "praktik", nama: "Praktik", bobot: 20 },
    { kode: "ujian", nama: "Ujian Semester", bobot: 30 },
    { kode: "cbt", nama: "CBT", bobot: 0 },
  ];
  for (const j of jenisNilai) {
    await prisma.jenisPenilaian.upsert({
      where: { kode: j.kode },
      update: { nama: j.nama, bobot: j.bobot },
      create: j,
    });
  }

  const jenisBayar = [
    { kode: "SPP", nama: "SPP Bulanan", nominal: 150000, periode: "bulanan" },
    { kode: "DU", nama: "Daftar Ulang", nominal: 500000, periode: "tahunan" },
    { kode: "KEG", nama: "Kegiatan Sekolah", nominal: 100000, periode: "sekali" },
  ];
  for (const j of jenisBayar) {
    await prisma.jenisPembayaran.upsert({
      where: { kode: j.kode },
      update: { nama: j.nama, nominal: j.nominal, periode: j.periode },
      create: j,
    });
  }

  // 10. Contoh berita & pengumuman website publik
  await prisma.berita.upsert({
    where: { slug: "selamat-datang-di-tahun-ajaran-2025-2026" },
    update: {},
    create: {
      slug: "selamat-datang-di-tahun-ajaran-2025-2026",
      judul: "Selamat Datang di Tahun Ajaran 2025/2026",
      ringkasan:
        "Seluruh siswa diharapkan mengikuti kegiatan Masa Pengenalan Lingkungan Sekolah (MPLS) sesuai jadwal.",
      konten:
        "Seluruh siswa diharapkan mengikuti kegiatan Masa Pengenalan Lingkungan Sekolah (MPLS) sesuai jadwal yang telah ditetapkan. Pastikan membawa perlengkapan lengkap dan kartu pelajar.",
      kategori: "pengumuman",
      penulis: "Admin",
    },
  });
  await prisma.berita.upsert({
    where: { slug: "kumpulkan-tugas-html-tepat-waktu" },
    update: {},
    create: {
      slug: "kumpulkan-tugas-html-tepat-waktu",
      judul: "Kumpulkan Tugas HTML Tepat Waktu",
      ringkasan:
        "Bagi siswa kelas X TKJ 1, tugas website statis dikumpulkan melalui menu Tugas sebelum deadline.",
      konten:
        "Bagi siswa kelas X TKJ 1, tugas website statis dikumpulkan melalui menu Tugas sebelum deadline yang ditentukan.",
      kategori: "akademik",
      penulis: "Budi Santoso, S.Kom.",
    },
  });

  console.log("Seed selesai.");
  console.log(`Akun demo (password sama untuk semua): ${DEMO_PASSWORD}`);
  console.log("admin / kepsek / kurikulum / tu / keuangan / cbt / guru / kaprog / kesiswaan / siswa / orangtua");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
