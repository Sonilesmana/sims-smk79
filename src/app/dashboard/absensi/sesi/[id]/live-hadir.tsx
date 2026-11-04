"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

type Hadir = { siswaId: string; nama: string; pukul: string; metode: string };

export function LiveHadir({
  sesiId,
  totalSiswa,
  aktifAwal,
}: {
  sesiId: string;
  totalSiswa: number;
  aktifAwal: Hadir[];
}) {
  const [hadir, setHadir] = useState<Hadir[]>(aktifAwal);
  const [waktu, setWaktu] = useState<string>("");
  const [berjalan, setBerjalan] = useState(true);

  useEffect(() => {
    let batal = false;
    const muat = async () => {
      try {
        const res = await fetch(`/api/absensi/sesi/${sesiId}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (batal) return;
        setHadir(data.hadir);
        setWaktu(data.waktu);
        if (data.status !== "buka" || data.kedaluwarsa) setBerjalan(false);
      } catch {
        // abaikan error polling
      }
    };
    muat();
    const t = setInterval(muat, 4000);
    return () => {
      batal = true;
      clearInterval(t);
    };
  }, [sesiId]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy-900">
          <Users className="h-4 w-4 text-sky-500" />
          Siswa Hadir: {hadir.length} / {totalSiswa}
          {waktu && <span className="ml-2 font-normal text-slate-400">({waktu})</span>}
        </div>
        {berjalan ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            LIVE
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">Sesi ditutup / kedaluwarsa</span>
        )}
      </div>

      <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
        {hadir.map((h) => (
          <div
            key={h.siswaId}
            className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2"
          >
            <span className="text-xs font-medium text-emerald-900">{h.nama}</span>
            <span className="font-mono text-[11px] text-emerald-700">{h.pukul}</span>
          </div>
        ))}
        {hadir.length === 0 && (
          <p className="col-span-2 py-8 text-center text-xs text-slate-400">
            Menunggu siswa melakukan scan…
          </p>
        )}
      </div>
    </div>
  );
}
