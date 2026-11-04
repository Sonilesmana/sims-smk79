export const dynamic = "force-dynamic";

import { getSchoolConfig } from "@/lib/school-settings";
import { Target, Eye, Building2 } from "lucide-react";

export default async function ProfilPage() {
  const s = await getSchoolConfig();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-navy-900">Profil Sekolah</h1>
      <p className="mt-2 text-sm text-slate-500">{s.nama}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Building2 className="h-5 w-5 text-sky-500" />
          <p className="mt-3 text-xs text-slate-500">Alamat</p>
          <p className="text-sm font-medium text-navy-900">{s.alamat || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">NPSN</p>
          <p className="text-sm font-medium text-navy-900">{s.npsn || "—"}</p>
          <p className="mt-3 text-xs text-slate-500">Akreditasi</p>
          <p className="text-sm font-medium text-navy-900">{s.akreditasi || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">Kepala Sekolah</p>
          <p className="text-sm font-medium text-navy-900">{s.kepalaSekolah || "—"}</p>
          <p className="mt-3 text-xs text-slate-500">Motto</p>
          <p className="text-sm font-medium text-navy-900">{s.motto || "—"}</p>
        </div>
      </div>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <Eye className="h-5 w-5 text-sky-500" /> Visi
          </h2>
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 p-5 text-sm leading-relaxed text-slate-600">
            Terwujudnya lulusan yang berkarakter, kompeten, dan siap bersaing di dunia kerja serta
            mampu beradaptasi dengan perkembangan teknologi.
          </p>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900">
            <Target className="h-5 w-5 text-sky-500" /> Misi
          </h2>
          <ul className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-5 text-sm leading-relaxed text-slate-600">
            {[
              "Menyelenggarakan pendidikan kejuruan yang bermutu dan relevan dengan kebutuhan industri.",
              "Mengembangkan karakter peserta didik yang religius, disiplin, dan bertanggung jawab.",
              "Menyediakan sarana praktik yang memadai dan up-to-date.",
              "Membangun kemitraan dengan dunia usaha dan dunia industri.",
              "Memanfaatkan teknologi digital dalam pembelajaran dan tata kelola sekolah.",
            ].map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-sky-500">•</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-navy-900">Struktur Organisasi</h2>
          <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
            Bagan struktur organisasi dapat ditambahkan melalui menu Website pada panel admin.
          </div>
        </div>
      </section>
    </div>
  );
}
