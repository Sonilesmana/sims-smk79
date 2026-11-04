"use client";

import { useActionState } from "react";
import { simpanManual, type ManualState } from "../actions";

export function ManualForm({ sesiId, siswaId, nama }: { sesiId: string; siswaId: string; nama: string }) {
  const [state, formAction, pending] = useActionState<ManualState, FormData>(simpanManual, {});

  if (state?.sukses) {
    return <p className="text-xs font-medium text-emerald-600">{state.sukses}</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="sesiId" value={sesiId} />
      <input type="hidden" name="siswaId" value={siswaId} />
      <select
        name="status"
        aria-label={`Status untuk ${nama}`}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-500"
        defaultValue="hadir"
      >
        <option value="hadir">Hadir</option>
        <option value="izin">Izin</option>
        <option value="sakit">Sakit</option>
        <option value="alpa">Alpa</option>
        <option value="terlambat">Terlambat</option>
      </select>
      <input
        name="keterangan"
        placeholder="Alasan (wajib)"
        aria-label="Alasan"
        required
        className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "…" : "Simpan"}
      </button>
      {state?.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
