"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const awal: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, awal);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900">Masuk ke Akun Anda</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gunakan <span className="font-medium">username</span>, <span className="font-medium">NIS</span> siswa,
          atau <span className="font-medium">NIP</span> guru.
        </p>
      </div>

      {state?.error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-slate-700">
            Username / NIS / NIP
          </label>
          <input
            id="identifier"
            name="identifier"
            autoComplete="username"
            required
            placeholder="mis. admin atau 2425001"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Akun demo (password: Admin#12345)</p>
        <p className="mt-1 leading-relaxed">
          admin · kepsek · kurikulum · tu · keuangan · cbt · guru · siswa · orangtua
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SMK YP 79 Majalaya ·{" "}
        <Link href="/" className="text-sky-600 hover:underline">
          Kembali ke website
        </Link>
      </p>
    </>
  );
}
