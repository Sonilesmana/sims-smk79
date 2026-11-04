# SIMS — Sistem Informasi Manajemen Sekolah Terintegrasi
## SMK YP 79 Majalaya

Aplikasi web terintegrasi yang menggabungkan website sekolah, absensi QR Code, akademik,
kurikulum, tata usaha, keuangan, CBT, penilaian, dan rapor digital dalam satu aplikasi
dengan satu database terpusat.

> **Status:** pengembangan tahap M1 — arsitektur, database, autentikasi multi-role, RBAC,
> panel per peran, dan website publik.

---

## Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS v4 (navy · putih · aksen biru muda) |
| Database | PostgreSQL (Neon) — satu database terpusat |
| ORM | Prisma 7 + driver adapter `pg` |
| Autentikasi | Session cookie httpOnly + bcrypt + rate limiting |
| Hosting | Vercel + GitHub |

---

## Menjalankan Secara Lokal

```bash
npm install
cp .env.example .env      # isi DATABASE_URL & AUTH_SECRET
npx prisma migrate deploy # atau: npx prisma db push
npx prisma db seed
npm run dev
```

Buka <http://localhost:3000>.

### Akun Demo

Semua akun demo memakai satu password yang **tidak dipublikasikan di repositori ini**
(disampaikan secara pribadi oleh pengelola; diatur lewat `SEED_ADMIN_PASSWORD` saat seed).
Untuk penggunaan produksi, ganti password setiap akun setelah login pertama.

| Peran | Username | Keterangan |
| --- | --- | --- |
| Admin Utama | `admin` | Akses penuh seluruh modul |
| Kepala Sekolah | `kepsek` | Monitoring & persetujuan |
| Staff Kurikulum | `kurikulum` | Tahun ajaran, jadwal, kurikulum |
| Staff Tata Usaha | `tu` | Data induk, surat, arsip, PPDB |
| Staff Keuangan | `keuangan` | Tagihan, pembayaran, laporan |
| Admin CBT | `cbt` | Bank soal, paket ujian |
| Guru | `guru` | Absensi, nilai, materi, CBT (juga menjadi Wali Kelas X TKJ 1) |
| Kaprog (TKJ) | `kaprog` | Monitoring jurusan TKJ |
| Kesiswaan | `kesiswaan` | Izin/sakit, kedisiplinan siswa |
| Siswa | `siswa` | Jadwal, absensi, nilai, tagihan |
| Orang Tua | `orangtua` | Monitoring anak |

Login juga dapat memakai **NIS** siswa (mis. `2425001`) atau **NIP** guru.

---

## Struktur Folder

```
prisma/            schema.prisma (ERD), seed.ts
src/
  app/
    (public)/      website publik sekolah
    (auth)/        halaman login
    dashboard/     panel sesuai peran
    api/           endpoint (export, QR, upload)
  components/      komponen UI
  lib/             db, auth, rbac, school-config, helper
  middleware.ts    guard route panel
docs/              ERD & dokumentasi
```

---

## Peran & Hak Akses

RBAC didefinisikan pada `src/lib/rbac.ts` — 9 peran dan ±65 permission. Setiap aksi
divalidasi di sisi server (bukan hanya menyembunyikan menu).

---

## Mengganti Identitas Sekolah

Nama, logo, alamat, kontak, dan tahun ajaran aktif disimpan pada tabel `Pengaturan`
(seed awal: lihat `src/lib/school-config.ts`). Setelah masuk sebagai **Admin**, buka
menu **Pengaturan Sistem** untuk mengubahnya tanpa menyentuh kode.

---

## Deploy (Vercel + Neon)

1. Push repositori ke GitHub.
2. Import project di Vercel.
3. Tambahkan integrasi **Neon** (PostgreSQL) melalui Vercel Marketplace — variabel
   `DATABASE_URL` terisi otomatis.
4. Tambahkan environment variable `AUTH_SECRET` (string acak ≥ 32 karakter).
5. Jalankan migrasi & seed terhadap database produksi:
   ```bash
   DATABASE_URL="..." npx prisma db push
   DATABASE_URL="..." npx prisma db seed
   ```
6. Deploy.
