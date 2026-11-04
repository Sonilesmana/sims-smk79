import type { SessionUser } from "@/lib/auth";

export type MenuItem = {
  label: string;
  href: string;
  icon: string;
  permission?: string;
};

export type MenuGroup = {
  judul: string;
  items: MenuItem[];
};

// Menu dikelompokkan dan difilter berdasarkan permission tiap peran.
export const MENU: MenuGroup[] = [
  {
    judul: "Utama",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", permission: "dashboard.view" }],
  },
  {
    judul: "Akademik",
    items: [
      { label: "Jadwal Pelajaran", href: "/dashboard/jadwal", icon: "CalendarDays", permission: "jadwal.view" },
      { label: "Absensi & Rekap", href: "/dashboard/absensi", icon: "ScanLine", permission: "absensi.view" },
      { label: "Penilaian", href: "/dashboard/nilai", icon: "ClipboardList", permission: "nilai.view" },
      { label: "Rapor Digital", href: "/dashboard/rapor", icon: "FileText", permission: "rapor.view" },
      { label: "Materi & Tugas", href: "/dashboard/materi", icon: "BookOpen", permission: "jadwal.view" },
    ],
  },
  {
    judul: "CBT",
    items: [
      { label: "Bank Soal", href: "/dashboard/cbt/bank", icon: "Database", permission: "cbt.bank" },
      { label: "Paket Ujian", href: "/dashboard/cbt/paket", icon: "FileStack", permission: "cbt.paket" },
      { label: "Ikuti Ujian", href: "/dashboard/cbt/ujian", icon: "MonitorPlay", permission: "cbt.ikuti" },
      { label: "Monitoring CBT", href: "/dashboard/cbt/monitoring", icon: "Activity", permission: "cbt.monitor" },
    ],
  },
  {
    judul: "Manajemen",
    items: [
      { label: "Data Siswa", href: "/dashboard/siswa", icon: "Users", permission: "siswa.view" },
      { label: "Data Guru", href: "/dashboard/guru", icon: "UserCog", permission: "guru.view" },
      { label: "Data Orang Tua", href: "/dashboard/orangtua", icon: "HeartHandshake", permission: "orangtua.view" },
      { label: "Kelas & Jurusan", href: "/dashboard/kelas", icon: "School", permission: "kelas.view" },
      { label: "Mata Pelajaran", href: "/dashboard/mapel", icon: "BookMarked", permission: "mapel.view" },
      { label: "Tahun Ajaran", href: "/dashboard/tahun-ajaran", icon: "CalendarRange", permission: "tahunajaran.manage" },
      { label: "Kurikulum", href: "/dashboard/kurikulum", icon: "GraduationCap", permission: "kurikulum.manage" },
    ],
  },
  {
    judul: "Tata Usaha",
    items: [
      { label: "Surat & Arsip", href: "/dashboard/tu/surat", icon: "Mail", permission: "tu.view" },
      { label: "Mutasi Siswa", href: "/dashboard/tu/mutasi", icon: "ArrowLeftRight", permission: "tu.mutasi" },
      { label: "Kartu Pelajar", href: "/dashboard/tu/kartu", icon: "IdCard", permission: "tu.kartu" },
      { label: "Alumni", href: "/dashboard/tu/alumni", icon: "UserCheck", permission: "tu.view" },
      { label: "PPDB", href: "/dashboard/ppdb", icon: "ClipboardCheck", permission: "ppdb.view" },
    ],
  },
  {
    judul: "Keuangan",
    items: [
      { label: "Tagihan", href: "/dashboard/keuangan/tagihan", icon: "Receipt", permission: "keuangan.view" },
      { label: "Pembayaran", href: "/dashboard/keuangan/pembayaran", icon: "Wallet", permission: "keuangan.view" },
      { label: "Pengeluaran", href: "/dashboard/keuangan/pengeluaran", icon: "TrendingDown", permission: "keuangan.pengeluaran" },
      { label: "Laporan Keuangan", href: "/dashboard/keuangan/laporan", icon: "BarChart3", permission: "keuangan.laporan" },
    ],
  },
  {
    judul: "Sistem",
    items: [
      { label: "Pengguna & Role", href: "/dashboard/pengguna", icon: "ShieldCheck", permission: "user.view" },
      { label: "Website & Berita", href: "/dashboard/website", icon: "Globe", permission: "website.manage" },
      { label: "Pengumuman", href: "/dashboard/pengumuman", icon: "Megaphone", permission: "pengumuman.manage" },
      { label: "Pengaturan", href: "/dashboard/pengaturan", icon: "Settings", permission: "pengaturan.manage" },
      { label: "Audit Log", href: "/dashboard/audit", icon: "ScrollText", permission: "audit.view" },
      { label: "Backup & Restore", href: "/dashboard/backup", icon: "DatabaseBackup", permission: "backup.manage" },
    ],
  },
];

export function menuUntuk(user: SessionUser): MenuGroup[] {
  const boleh = (perm?: string) => {
    if (!perm) return true;
    if (user.role === "admin") return true;
    return user.permissions.includes(perm);
  };
  return MENU.map((g) => ({ ...g, items: g.items.filter((i) => boleh(i.permission)) })).filter(
    (g) => g.items.length > 0,
  );
}
