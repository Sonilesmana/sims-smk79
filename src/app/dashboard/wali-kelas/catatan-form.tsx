"use client";

import { useActionState } from "react";
import { simpanCatatan, type WaliState } from "./actions";

export function CatatanForm({
  siswaId,
  nama,
}: {
  siswaId: string;
  nama: string;
}) {
  const [state, formAction, pending] = useActionState<WaliState, FormData>(simpanCatatan, {});

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <input type="hidden" name="siswaId" value={siswaId} />
      <textarea
        name="catatan"
        rows={1}
        required
        placeholder={`Catatan untuk ${nama}…`}
        aria-label={`Catatan wali untuk ${nama}`}
        className="min-h-[38px] w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 sm:w-64"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "…" : "Simpan"}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.sukses && <p className="text-xs text-emerald-600">✓ {state.sukses}</p>}
    </form>
  );
}
