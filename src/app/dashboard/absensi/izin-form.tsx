"use client";

import { useActionState } from "react";
import { ajukanIzin, type IzinState } from "./actions";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

export function IzinForm() {
  const [state, formAction, pending] = useActionState<IzinState, FormData>(ajukanIzin, {});

  return (
    <form action={formAction} className="space-y-4">
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Jenis</label>
          <select name="jenis" className={inputCls} defaultValue="izin">
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Mulai</label>
            <input name="tanggalMulai" type="date" required className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Sampai</label>
            <input name="tanggalAkhir" type="date" required className={inputCls} />
          </div>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Keterangan / Alasan *</label>
        <textarea name="alasan" rows={3} required placeholder="mis. Sakit demam, disertai surat dokter" className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim Pengajuan"}
      </button>
    </form>
  );
}
