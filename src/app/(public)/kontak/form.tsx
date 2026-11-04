"use client";

import { useActionState } from "react";
import { kirimPesan, type KontakState } from "./actions";

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

export function KontakForm() {
  const [state, formAction, pending] = useActionState(kirimPesan, {} as KontakState);

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
          <label htmlFor="nama" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nama
          </label>
          <input id="nama" name="nama" required className={inputCls} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputCls} />
        </div>
        <div>
          <label htmlFor="telepon" className="mb-1.5 block text-sm font-medium text-slate-700">
            Telepon (opsional)
          </label>
          <input id="telepon" name="telepon" className={inputCls} />
        </div>
        <div>
          <label htmlFor="subjek" className="mb-1.5 block text-sm font-medium text-slate-700">
            Subjek
          </label>
          <input id="subjek" name="subjek" required className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="pesan" className="mb-1.5 block text-sm font-medium text-slate-700">
          Pesan
        </label>
        <textarea id="pesan" name="pesan" rows={5} required className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim Pesan"}
      </button>
    </form>
  );
}
