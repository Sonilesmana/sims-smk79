"use client";

import { useActionState } from "react";
import { prosesIzin, type KesiswaanState } from "./actions";

export function ProsesIzinForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<KesiswaanState, FormData>(prosesIzin, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        name="keputusan"
        value="disetujui"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        ✓ Setujui
      </button>
      <button
        type="submit"
        name="keputusan"
        value="ditolak"
        disabled={pending}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        ✕ Tolak
      </button>
      {state?.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
      {state?.sukses && <p className="w-full text-xs text-emerald-600">✓ {state.sukses}</p>}
    </form>
  );
}
