"use client";

import { useActionState } from "react";
import type { PengaturanState } from "./actions";

type Nilai = {
  nama: string;
  singkatan: string;
  npsn: string;
  akreditasi: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  motto: string;
  logoUrl: string;
};

const Field = ({
  label,
  name,
  value,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  type?: string;
}) => (
  <div>
    <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
    />
  </div>
);

export function PengaturanForm({
  nilai,
  aksi,
}: {
  nilai: Nilai;
  aksi: (prev: PengaturanState, fd: FormData) => Promise<PengaturanState>;
}) {
  const [state, formAction, pending] = useActionState(aksi, {});

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.sukses && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.sukses}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Sekolah" name="nama" value={nilai.nama} placeholder="SMK YP 79 Majalaya" />
        <Field label="Singkatan" name="singkatan" value={nilai.singkatan} placeholder="SMK YP 79" />
        <Field label="NPSN" name="npsn" value={nilai.npsn} placeholder="20259590" />
        <Field label="Akreditasi" name="akreditasi" value={nilai.akreditasi} placeholder="A" />
        <Field label="Telepon" name="telepon" value={nilai.telepon} placeholder="(022) ..." />
        <Field label="Email" name="email" value={nilai.email} placeholder="info@sekolah.sch.id" />
        <Field label="Website" name="website" value={nilai.website} placeholder="https://..." />
        <Field
          label="Kepala Sekolah"
          name="kepalaSekolah"
          value={nilai.kepalaSekolah}
          placeholder="Nama kepala sekolah"
        />
        <Field label="Motto" name="motto" value={nilai.motto} placeholder="Berkarakter, Kompeten" />
        <Field
          label="URL Logo"
          name="logoUrl"
          value={nilai.logoUrl}
          placeholder="/logo.svg atau https://..."
        />
      </div>

      <div>
        <label htmlFor="alamat" className="mb-1.5 block text-sm font-medium text-slate-700">
          Alamat
        </label>
        <textarea
          id="alamat"
          name="alamat"
          rows={3}
          defaultValue={nilai.alamat}
          placeholder="Alamat lengkap sekolah"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
        <p className="mt-1 text-xs text-slate-400">
          Untuk logo, unggah berkas ke folder <code>public/</code> lalu tuliskan path-nya
          (mis. <code>/logo-sekolah.png</code>) — panduan unggah penuh akan ditambahkan pada tahap
          berikutnya.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
