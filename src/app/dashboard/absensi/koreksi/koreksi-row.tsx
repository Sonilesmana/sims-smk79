"use client";

import { useActionState } from "react";
import { ajukanKoreksi, prosesKoreksi, type KoreksiState } from "../actions";

export function KoreksiRow({
  sesiId,
  siswaId,
  nama,
  statusSaat,
}: {
  sesiId: string;
  siswaId: string;
  nama: string;
  statusSaat: string | null;
}) {
  const [state, formAction, pending] = useActionState<KoreksiState, FormData>(ajukanKoreksi, {});

  if (state?.sukses) {
    return <p className="text-xs font-medium text-emerald-600">{state.sukses}</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="sesiId" value={sesiId} />
      <input type="hidden" name="siswaId" value={siswaId} />
      <select
        name="statusBaru"
        aria-label={`Status baru untuk ${nama}`}
        defaultValue={statusSaat ?? "hadir"}
        className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-500"
      >
        <option value="hadir">Hadir</option>
        <option value="izin">Izin</option>
        <option value="sakit">Sakit</option>
        <option value="alpa">Alpa</option>
        <option value="terlambat">Terlambat</option>
      </select>
      <input
        name="alasan"
        placeholder="Alasan koreksi (wajib)"
        required
        aria-label="Alasan koreksi"
        className="w-44 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "…" : "Ajukan"}
      </button>
      {state?.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export function ProsesKoreksiForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<KoreksiState, FormData>(prosesKoreksi, {});

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          name="keputusan"
          value="disetujui"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          ✓ Setujui
        </button>
        <button
          type="submit"
          name="keputusan"
          value="ditolak"
          disabled={pending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          ✕ Tolak
        </button>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.sukses && <p className="text-xs font-medium text-emerald-600">✓ {state.sukses}</p>}
    </form>
  );
}
