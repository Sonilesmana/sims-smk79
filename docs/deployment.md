# Deployment SIMS SMK YP 79 Majalaya

Arsitektur: **GitHub → Vercel (Next.js) → Neon PostgreSQL (via Vercel Integration)**

## Status Komponen

| Komponen | Detail |
| --- | --- |
| Repository | https://github.com/Sonilesmana/sims-smk79 (publik) |
| Hosting | Vercel (scope `slp-roject1`, project `sims-smk79`) |
| Database | Neon PostgreSQL, region `ap-southeast-1`, database `neondb` |
| CI/CD | Setiap push ke branch `main` → Vercel build & deploy otomatis |

## Alur Deploy

1. Push ke `main`:
   ```bash
   git push origin main
   ```
2. Vercel menjalankan `npm run build`.
   `postinstall` menjalankan `prisma generate` agar tipe Prisma tersedia saat build.
3. Environment variables production (`DATABASE_URL`, dll.) di-inject otomatis oleh
   integrasi Neon — tidak perlu diatur manual.
4. Setelah build sukses, URL production otomatis tersedia
   (`https://sims-smk79.vercel.app` atau domain preview).

## Perubahan Skema Database

```bash
# lokal
npx prisma db push     # terapkan skema ke database
npx prisma db seed     # isi data awal / master
```

Untuk migrasi yang terkontrol di produksi, gunakan:

```bash
npx prisma migrate dev --name <nama-migrasi>   # buat migrasi
npx prisma migrate deploy                       # terapkan di produksi (dengan DATABASE_URL produksi)
```

## Konfigurasi Lokal

```bash
cp .env.example .env
# isi DATABASE_URL (ambil dari Vercel → Project → Settings → Environment Variables)
# atau gunakan database Neon development branch
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

## Environment Variables

| Nama | Sumber | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Neon integration | Koneksi PostgreSQL (pooled) |
| `AUTH_SECRET` | manual | Rahasia session; belum dipakai penuh pada M1 |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | seed | Kredensial seed |

> **Jangan pernah commit file `.env`.** `.gitignore` sudah mengecualikannya.

## Akun Demo (password: `Admin#12345`)

`admin`, `kepsek`, `kurikulum`, `tu`, `keuangan`, `cbt`, `guru`, `siswa` (NIS 2425001),
`orangtua` (lihat README).

## Checklist Setelah Deploy Pertama

- [ ] Buka URL production, pastikan beranda tampil
- [ ] Login dengan `admin`
- [ ] Ubah identitas sekolah di **Dashboard → Pengaturan** (nama, NPSN, alamat, logo)
- [ ] Verifikasi RBAC: login sebagai `siswa`, pastikan menu administrasi tidak tampil
- [ ] Cek `npx vercel logs` jika ada error runtime
