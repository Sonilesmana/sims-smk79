"use client";

import { useActionState, useState } from "react";
import { daftarPpdb, cekStatusPpdb, type PpdbState } from "./actions";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

type Jurusan = { id: string; kode: string; nama: string };

export function PpdbForm({ jurusan }: { jurusan: Jurusan[] }) {
  const [state, formAction, pending] = useActionState(daftarPpdb, {} as PpdbState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.sukses && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <p className="font-semibold">{state.sukses}</p>
          <p className="mt-1">
            Nomor pendaftaran Anda:{" "}
            <span className="font-mono font-bold">{state.nomor}</span>
          </p>
          <p className="mt-1 text-xs">
            Simpan nomor ini untuk memeriksa status pendaftaran.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Lengkap *</label>
          <input name="nama" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">NISN</label>
          <input name="nisn" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Jenis Kelamin *</label>
          <select name="jenisKelamin" required className={inputCls} defaultValue="L">
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Jurusan Pilihan</label>
          <select name="jurusanPilihanId" className={inputCls} defaultValue="">
            <option value="">— Pilih jurusan —</option>
            {jurusan.map((j) => (
              <option key={j.id} value={j.id}>
                {j.kode} — {j.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tempat Lahir</label>
          <input name="tempatLahir" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Lahir</label>
          <input name="tanggalLahir" type="date" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Telepon/WA *</label>
          <input name="telepon" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input name="email" type="email" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Alamat *</label>
          <textarea name="alamat" rows={3} required className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Asal Sekolah</label>
          <input name="asalSekolah" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Orang Tua/Wali</label>
          <input name="namaOrangTua" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Telepon Orang Tua/Wali
          </label>
          <input name="teleponOrangTua" className={inputCls} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim Pendaftaran"}
      </button>
    </form>
  );
}

export function CekStatusForm() {
  const [nomor, setNomor] = useState("");
  const [hasil, setHasil] = useState<
    | { ditemukan: false }
    | { ditemukan: true; nama: string; jurusan: string; status: string; tanggal: string }
    | null
  >(null);
  const [pending, setPending] = useState(false);

  async function cek() {
    if (!nomor.trim()) return;
    setPending(true);
    try {
      const row = await cekStatusPpdb(nomor);
      if (!row) {
        setHasil({ ditemukan: false });
      } else {
        setHasil({
          ditemukan: true,
          nama: row.nama,
          jurusan: row.jurusanPilihanId ?? "-",
          status: row.status,
          tanggal: row.createdAt.toLocaleDateString("id-ID"),
        });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Nomor Pendaftaran
        </label>
        <input
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          placeholder="PPDB-2026-XXXXXX"
          className={inputCls}
        />
      </div>
      <button
        type="button"
        onClick={cek}
        disabled={pending}
        className="rounded-lg border border-navy-900 px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-navy-50 disabled:opacity-60"
      >
        {pending ? "Memeriksa…" : "Periksa Status"}
      </button>

      {hasil && !hasil.ditemukan && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Nomor pendaftaran tidak ditemukan.
        </div>
      )}
      {hasil && hasil.ditemukan && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p><span className="font-medium">Nama:</span> {hasil.nama}</p>
          <p><span className="font-medium">Status:</span> {hasil.status}</p>
          <p className="text-xs mt-1">Didaftarkan {hasil.tanggal}</p>
        </div>
      )}
    </div>
  );
}
