# ERD SIMS SMK YP 79 Majalaya

Database: PostgreSQL (Neon). Satu database terpusat untuk seluruh modul.
Skema lengkap ada di `prisma/schema.prisma`; ringkasan relasi utama di bawah.

## Gambaran Umum

```mermaid
erDiagram
  ROLE ||--o{ USER : ""
  USER ||--o{ SESSION : ""
  USER ||--o{ AUDIT_LOG : ""
  ROLE ||--o{ ROLE_PERMISSION : ""
  PERMISSION ||--o{ ROLE_PERMISSION : ""

  TAHUN_AJARAN ||--o{ SEMESTER : ""
  TAHUN_AJARAN ||--o{ KELAS : ""
  JURUSAN ||--o{ KELAS : ""
  JURUSAN ||--o{ MATA_PELAJARAN : ""

  USER ||--o| GURU : ""
  USER ||--o| SISWA : ""
  USER ||--o| ORANG_TUA : ""
  SISWA }o--|| KELAS : ""
  ORANG_TUA ||--o{ SISWA_ORANG_TUA : ""
  SISWA ||--o{ SISWA_ORANG_TUA : ""

  GURU ||--o{ TUGAS_MENGAJAR : ""
  MATA_PELAJARAN ||--o{ TUGAS_MENGAJAR : ""
  KELAS ||--o{ JADWAL : ""
  MATA_PELAJARAN ||--o{ JADWAL : ""
  GURU ||--o{ JADWAL : ""

  KELAS ||--o{ SESI_ABSEN : ""
  GURU ||--o{ SESI_ABSEN : ""
  SESI_ABSEN ||--o{ ABSENSI : ""
  SISWA ||--o{ ABSENSI : ""

  SEMESTER ||--o{ NILAI : ""
  SISWA ||--o{ NILAI : ""
  MATA_PELAJARAN ||--o{ NILAI : ""

  SISWA ||--o{ RAPOR : ""
  RAPOR ||--o{ RAPOR_DETAIL : ""

  GURU ||--o{ BANK_SOAL : ""
  MATA_PELAJARAN ||--o{ BANK_SOAL : ""
  PAKET_UJIAN ||--o{ PAKET_SOAL : ""
  BANK_SOAL ||--o{ PAKET_SOAL : ""
  PAKET_UJIAN ||--o{ PESERTA_UJIAN : ""
  SISWA ||--o{ PESERTA_UJIAN : ""

  SISWA ||--o{ TAGIHAN : ""
  TAGIHAN ||--o{ PEMBAYARAN : ""
  JENIS_PEMBAYARAN ||--o{ TAGIHAN : ""
```

## Kelompok Tabel

### 1. Autentikasi & RBAC
`users`, `roles`, `permissions`, `role_permissions`, `sessions`, `login_attempts`, `audit_logs`

### 2. Master Data
`pengaturan` (key-value), `tahun_ajaran`, `semester`, `jurusan`, `kelas`, `mata_pelajaran`,
`guru`, `siswa`, `orang_tua`, `siswa_orang_tua`, `kelas_diampu`

### 3. Kurikulum
`capaian_pembelajaran` (CP/TP/ATP), `tugas_mengajar`, `jadwal`, `kalender_akademik`,
`kktp`, `bobot_penilaian`

### 4. Absensi QR Code
`sesi_absen` (token QR di-hash, berlaku 15 menit, terikat jadwal+kelas),
`absensi` (unique `sesiId+siswaId` → cegah scan ganda), `pengajuan_izin`, `koreksi_absensi`

### 5. Penilaian & Rapor
`jenis_penilaian`, `nilai`, `rapor`, `rapor_detail`

### 6. CBT
`bank_soal`, `paket_ujian`, `paket_soal`, `peserta_ujian`, `jawaban`, `hasil_ujian`

### 7. Tata Usaha
`surat` (masuk/keluar), `arsip_dokumen`, `mutasi_siswa`, `kartu_pelajar`, `alumni`,
`ppdb_pendaftaran`, `ppdb_dokumen`

### 8. Keuangan
`jenis_pembayaran`, `diskon`, `tagihan`, `pembayaran`, `pengeluaran`

### 9. Website Publik
`berita`, `galeri`, `pengumuman`, `pesan_kontak`

### 10. Notifikasi & LMS Ringan
`notifikasi`, `materi`, `tugas`, `tugas_pengumpulan`

## Aturan Integritas

- Seluruh `id` menggunakan `cuid()` (string, tidak dapat ditebak).
- Foreign key dengan `onDelete: Cascade` pada data anak milik induk; `SetNull` pada relasi opsional.
- Unique constraint penting: `absensi(sesiId, siswaId)`, `nilai` diindeks per siswa+semester,
  `siswa.nis`, `siswa.qrCode`, `users.username`, `tagihan.kode`.
- Operasi yang mengubah saldo/status (pembayaran, persetujuan rapor, submit CBT) dijalankan
  dalam transaksi Prisma (`prisma.$transaction`).
- Semua aksi yang mengubah data dicatat ke `audit_logs`.
