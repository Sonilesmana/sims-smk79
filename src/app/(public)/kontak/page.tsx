export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { mergeSchoolConfig } from "@/lib/school-config";
import { KontakForm } from "./form";
import { MapPin, Phone, Mail } from "lucide-react";

export default async function KontakPage() {
  const rows = await prisma.pengaturan.findMany({
    where: { kategori: { in: ["sekolah", "akademik"] } },
    select: { kunci: true, nilai: true },
  });
  const s = mergeSchoolConfig(rows);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-navy-900">Hubungi Kami</h1>
      <p className="mt-2 text-sm text-slate-500">
        Kirim pertanyaan atau pesan kepada {s.nama}.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <MapPin className="h-5 w-5 text-sky-500" />
            <p className="mt-3 text-sm font-medium text-navy-900">Alamat</p>
            <p className="mt-1 text-sm text-slate-500">{s.alamat || "Belum diisi"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Phone className="h-5 w-5 text-sky-500" />
            <p className="mt-3 text-sm font-medium text-navy-900">Telepon</p>
            <p className="mt-1 text-sm text-slate-500">{s.telepon || "Belum diisi"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Mail className="h-5 w-5 text-sky-500" />
            <p className="mt-3 text-sm font-medium text-navy-900">Email</p>
            <p className="mt-1 text-sm text-slate-500">{s.email || "Belum diisi"}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <KontakForm />
        </div>
      </div>
    </div>
  );
}
