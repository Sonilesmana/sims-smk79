// Daftar permission & pemetaan RBAC
// Format kode: <modul>.<aksi>

export type PermissionDef = { kode: string; modul: string; aksi: string; label: string };

export const PERMISSIONS: PermissionDef[] = [
  { kode: "dashboard.view", modul: "dashboard", aksi: "view", label: "Lihat dashboard" },

  { kode: "user.view", modul: "user", aksi: "view", label: "Lihat pengguna" },
  { kode: "user.create", modul: "user", aksi: "create", label: "Tambah pengguna" },
  { kode: "user.update", modul: "user", aksi: "update", label: "Ubah pengguna" },
  { kode: "user.delete", modul: "user", aksi: "delete", label: "Hapus pengguna" },
  { kode: "role.manage", modul: "role", aksi: "manage", label: "Kelola role & permission" },

  { kode: "siswa.view", modul: "siswa", aksi: "view", label: "Lihat siswa" },
  { kode: "siswa.create", modul: "siswa", aksi: "create", label: "Tambah siswa" },
  { kode: "siswa.update", modul: "siswa", aksi: "update", label: "Ubah siswa" },
  { kode: "siswa.delete", modul: "siswa", aksi: "delete", label: "Hapus siswa" },

  { kode: "guru.view", modul: "guru", aksi: "view", label: "Lihat guru" },
  { kode: "guru.create", modul: "guru", aksi: "create", label: "Tambah guru" },
  { kode: "guru.update", modul: "guru", aksi: "update", label: "Ubah guru" },
  { kode: "guru.delete", modul: "guru", aksi: "delete", label: "Hapus guru" },

  { kode: "orangtua.view", modul: "orangtua", aksi: "view", label: "Lihat orang tua" },
  { kode: "orangtua.manage", modul: "orangtua", aksi: "manage", label: "Kelola orang tua" },

  { kode: "kelas.view", modul: "kelas", aksi: "view", label: "Lihat kelas & jurusan" },
  { kode: "kelas.manage", modul: "kelas", aksi: "manage", label: "Kelola kelas & jurusan" },
  { kode: "mapel.view", modul: "mapel", aksi: "view", label: "Lihat mata pelajaran" },
  { kode: "mapel.manage", modul: "mapel", aksi: "manage", label: "Kelola mata pelajaran" },

  { kode: "tahunajaran.manage", modul: "tahunajaran", aksi: "manage", label: "Kelola tahun ajaran & semester" },
  { kode: "kurikulum.manage", modul: "kurikulum", aksi: "manage", label: "Kelola kurikulum (CP/TP/ATP)" },
  { kode: "jadwal.view", modul: "jadwal", aksi: "view", label: "Lihat jadwal" },
  { kode: "jadwal.manage", modul: "jadwal", aksi: "manage", label: "Kelola jadwal" },
  { kode: "kalender.manage", modul: "kalender", aksi: "manage", label: "Kelola kalender akademik" },

  { kode: "absensi.view", modul: "absensi", aksi: "view", label: "Lihat absensi" },
  { kode: "absensi.create", modul: "absensi", aksi: "create", label: "Buka sesi absensi" },
  { kode: "absensi.scan", modul: "absensi", aksi: "scan", label: "Scan / catat absensi" },
  { kode: "absensi.koreksi", modul: "absensi", aksi: "koreksi", label: "Koreksi absensi" },

  { kode: "nilai.view", modul: "nilai", aksi: "view", label: "Lihat nilai" },
  { kode: "nilai.input", modul: "nilai", aksi: "input", label: "Input nilai" },
  { kode: "nilai.update", modul: "nilai", aksi: "update", label: "Ubah nilai" },
  { kode: "rapor.view", modul: "rapor", aksi: "view", label: "Lihat rapor" },
  { kode: "rapor.manage", modul: "rapor", aksi: "manage", label: "Kelola rapor" },
  { kode: "rapor.approve", modul: "rapor", aksi: "approve", label: "Setujui rapor" },

  { kode: "cbt.view", modul: "cbt", aksi: "view", label: "Lihat CBT" },
  { kode: "cbt.bank", modul: "cbt", aksi: "bank", label: "Kelola bank soal" },
  { kode: "cbt.paket", modul: "cbt", aksi: "paket", label: "Kelola paket & jadwal ujian" },
  { kode: "cbt.monitor", modul: "cbt", aksi: "monitor", label: "Monitoring & nilai esai" },
  { kode: "cbt.ikuti", modul: "cbt", aksi: "ikuti", label: "Mengikuti ujian" },

  { kode: "tu.view", modul: "tu", aksi: "view", label: "Lihat tata usaha" },
  { kode: "tu.manage", modul: "tu", aksi: "manage", label: "Kelola surat & arsip" },
  { kode: "tu.mutasi", modul: "tu", aksi: "mutasi", label: "Kelola mutasi siswa" },
  { kode: "tu.kartu", modul: "tu", aksi: "kartu", label: "Cetak kartu pelajar & guru" },

  { kode: "keuangan.view", modul: "keuangan", aksi: "view", label: "Lihat keuangan" },
  { kode: "keuangan.tagihan", modul: "keuangan", aksi: "tagihan", label: "Kelola tagihan" },
  { kode: "keuangan.bayar", modul: "keuangan", aksi: "bayar", label: "Catat pembayaran" },
  { kode: "keuangan.pengeluaran", modul: "keuangan", aksi: "pengeluaran", label: "Kelola pengeluaran" },
  { kode: "keuangan.approve", modul: "keuangan", aksi: "approve", label: "Setujui pengeluaran" },
  { kode: "keuangan.laporan", modul: "keuangan", aksi: "laporan", label: "Lihat laporan keuangan" },

  { kode: "website.manage", modul: "website", aksi: "manage", label: "Kelola website & berita" },
  { kode: "pengumuman.manage", modul: "pengumuman", aksi: "manage", label: "Kelola pengumuman" },
  { kode: "ppdb.view", modul: "ppdb", aksi: "view", label: "Lihat pendaftaran PPDB" },
  { kode: "ppdb.manage", modul: "ppdb", aksi: "manage", label: "Kelola PPDB" },

  { kode: "pengaturan.manage", modul: "pengaturan", aksi: "manage", label: "Pengaturan sistem" },
  { kode: "backup.manage", modul: "backup", aksi: "manage", label: "Backup & restore" },
  { kode: "audit.view", modul: "audit", aksi: "view", label: "Lihat audit log" },

  { kode: "laporan.sekolah", modul: "laporan", aksi: "sekolah", label: "Laporan tingkat sekolah" },
  { kode: "laporan.export", modul: "laporan", aksi: "export", label: "Export laporan" },
];

export type RoleDef = { kode: string; nama: string; deskripsi: string; permissions: string[] };

const ALL = PERMISSIONS.map((p) => p.kode);

export const ROLES: RoleDef[] = [
  {
    kode: "admin",
    nama: "Admin Utama",
    deskripsi: "Akses penuh seluruh modul",
    permissions: ALL,
  },
  {
    kode: "kepala_sekolah",
    nama: "Kepala Sekolah",
    deskripsi: "Monitoring, persetujuan, dan laporan sekolah",
    permissions: [
      "dashboard.view",
      "siswa.view", "guru.view", "kelas.view", "mapel.view", "jadwal.view",
      "absensi.view", "nilai.view", "rapor.view", "rapor.approve",
      "cbt.view", "tu.view", "keuangan.view", "keuangan.laporan", "keuangan.approve",
      "ppdb.view", "audit.view", "laporan.sekolah", "laporan.export", "pengumuman.manage",
    ],
  },
  {
    kode: "kurikulum",
    nama: "Staff Kurikulum",
    deskripsi: "Tahun ajaran, kurikulum, jadwal, dan monitoring pembelajaran",
    permissions: [
      "dashboard.view", "tahunajaran.manage", "kurikulum.manage", "mapel.view", "mapel.manage",
      "kelas.view", "kelas.manage", "jadwal.view", "jadwal.manage", "kalender.manage",
      "guru.view", "siswa.view", "nilai.view", "rapor.view", "rapor.manage",
      "absensi.view", "cbt.view", "laporan.export",
    ],
  },
  {
    kode: "tu",
    nama: "Staff Tata Usaha",
    deskripsi: "Data induk, surat, arsip, kartu, mutasi, dan PPDB",
    permissions: [
      "dashboard.view", "siswa.view", "siswa.create", "siswa.update",
      "guru.view", "guru.create", "guru.update", "orangtua.view", "orangtua.manage",
      "kelas.view", "mapel.view", "jadwal.view", "absensi.view",
      "tu.view", "tu.manage", "tu.mutasi", "tu.kartu",
      "ppdb.view", "ppdb.manage", "laporan.export", "pengumuman.manage",
    ],
  },
  {
    kode: "keuangan",
    nama: "Staff Keuangan",
    deskripsi: "Tagihan, pembayaran, pengeluaran, dan laporan keuangan",
    permissions: [
      "dashboard.view", "siswa.view", "kelas.view",
      "keuangan.view", "keuangan.tagihan", "keuangan.bayar", "keuangan.pengeluaran", "keuangan.laporan",
      "laporan.export",
    ],
  },
  {
    kode: "cbt",
    nama: "Admin CBT",
    deskripsi: "Bank soal, paket ujian, pelaksanaan, dan analisis",
    permissions: [
      "dashboard.view", "siswa.view", "kelas.view", "mapel.view",
      "cbt.view", "cbt.bank", "cbt.paket", "cbt.monitor", "laporan.export",
    ],
  },
  {
    kode: "guru",
    nama: "Guru",
    deskripsi: "Pengajaran, absensi, nilai, materi, tugas, dan CBT",
    permissions: [
      "dashboard.view", "jadwal.view", "siswa.view", "kelas.view", "mapel.view",
      "absensi.view", "absensi.create", "absensi.scan", "absensi.koreksi",
      "nilai.view", "nilai.input", "nilai.update",
      "rapor.view", "rapor.manage",
      "cbt.view", "cbt.bank", "cbt.paket", "cbt.monitor",
      "pengumuman.manage", "laporan.export",
    ],
  },
  {
    kode: "siswa",
    nama: "Siswa",
    deskripsi: "Jadwal, absensi, nilai, rapor, tugas, CBT, dan tagihan",
    permissions: [
      "dashboard.view", "jadwal.view", "absensi.view", "absensi.scan",
      "nilai.view", "rapor.view", "cbt.view", "cbt.ikuti", "keuangan.view",
    ],
  },
  {
    kode: "orang_tua",
    nama: "Orang Tua",
    deskripsi: "Monitoring anak: absensi, nilai, rapor, tugas, dan tagihan",
    permissions: [
      "dashboard.view", "jadwal.view", "absensi.view", "nilai.view", "rapor.view", "keuangan.view",
    ],
  },
];

export const ALL_PERMISSION_CODES = ALL;
