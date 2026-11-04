// Helper identitas sekolah — nilai default, dapat ditimpa dari tabel Pengaturan.
// Logo & data asli SMK YP 79 Majalaya dapat diisi lewat menu Admin → Pengaturan Sistem.

export const SCHOOL_DEFAULT = {
  nama: "SMK YP 79 Majalaya",
  singkatan: "SMK YP 79",
  npsn: "",
  akreditasi: "A",
  alamat: "Majalaya, Kabupaten Bandung, Jawa Barat",
  telepon: "",
  email: "",
  website: "",
  kepalaSekolah: "",
  logoUrl: "/logo.svg",
  tahunAjaranAktif: "2025/2026",
  semesterAktif: "Ganjil",
  motto: "Berkarakter, Kompeten, Siap Kerja",
} as const;

export type SchoolConfig = typeof SCHOOL_DEFAULT;

export const KUNCI_PENGATURAN: Record<keyof SchoolConfig, string> = {
  nama: "sekolah.nama",
  singkatan: "sekolah.singkatan",
  npsn: "sekolah.npsn",
  akreditasi: "sekolah.akreditasi",
  alamat: "sekolah.alamat",
  telepon: "sekolah.telepon",
  email: "sekolah.email",
  website: "sekolah.website",
  kepalaSekolah: "sekolah.kepala_sekolah",
  logoUrl: "sekolah.logo_url",
  tahunAjaranAktif: "akademik.tahun_ajaran_aktif",
  semesterAktif: "akademik.semester_aktif",
  motto: "sekolah.motto",
};

export function mergeSchoolConfig(rows: { kunci: string; nilai: string | null }[]): SchoolConfig {
  const map = new Map(rows.map((r) => [r.kunci, r.nilai ?? ""]));
  const out: Record<string, string> = { ...SCHOOL_DEFAULT };
  for (const [key, kunci] of Object.entries(KUNCI_PENGATURAN)) {
    const v = map.get(kunci);
    if (v) out[key] = v;
  }
  return out as SchoolConfig;
}

// Format tanggal Indonesia: 20 Oktober 2026
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggalID(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTanggalJamID(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  const jam = String(d.getHours()).padStart(2, "0");
  const menit = String(d.getMinutes()).padStart(2, "0");
  return `${formatTanggalID(d)} ${jam}:${menit}`;
}

export function formatRupiah(nilai: number | null | undefined): string {
  const n = Number(nilai ?? 0);
  return "Rp " + n.toLocaleString("id-ID");
}
