"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, XCircle } from "lucide-react";
import { catatScanKartu, type ScanHasil } from "../actions";

type Item = ScanHasil & { id: number; waktu: string };

export function GuruScanner({ sesiId, diaktifkan }: { sesiId: string; diaktifkan: boolean }) {
  const [status, setStatus] = useState<"idle" | "starting" | "running" | "error">("idle");
  const [pesan, setPesan] = useState("");
  const [riwayat, setRiwayat] = useState<Item[]>([]);
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const mulai = async () => {
    if (!diaktifkan) return;
    setStatus("starting");
    setPesan("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("scanner-kartu");
      scannerRef.current = scanner as never;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          const hasil = await catatScanKartu(sesiId, decoded.trim());
          idRef.current += 1;
          setRiwayat((prev) => [
            { ...hasil, id: idRef.current, waktu: new Date().toLocaleTimeString("id-ID") },
            ...prev.slice(0, 19),
          ]);
        },
        () => {
          /* abaikan frame tanpa QR */
        },
      );
      setStatus("running");
    } catch (e) {
      setStatus("error");
      setPesan(
        e instanceof Error
          ? e.message
          : "Kamera tidak dapat dibuka. Pastikan izin kamera diberikan.",
      );
    }
  };

  const berhenti = async () => {
    try {
      await scannerRef.current?.stop();
      scannerRef.current?.clear();
    } catch {
      // abaikan
    }
    scannerRef.current = null;
    setStatus("idle");
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => undefined);
    };
  }, []);

  if (!diaktifkan) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
        Sesi sudah ditutup atau token kedaluwarsa. Scanner dimatikan demi integritas kehadiran.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div id="scanner-kartu" ref={containerRef} className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-black" />

      {status !== "running" ? (
        <button
          onClick={mulai}
          disabled={status === "starting"}
          className="flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          <Camera className="h-4 w-4" />
          {status === "starting" ? "Membuka kamera…" : "Aktifkan Kamera"}
        </button>
      ) : (
        <button
          onClick={berhenti}
          className="flex items-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <CameraOff className="h-4 w-4" /> Matikan Kamera
        </button>
      )}

      {status === "error" && <p className="max-w-sm text-center text-xs text-red-600">{pesan}</p>}

      {/* Hasil scan terbaru */}
      {riwayat.length > 0 && (
        <div className="w-full">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Hasil Scan Terakhir
          </p>
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {riwayat.map((r) => (
              <li
                key={r.id}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                  r.ok ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                }`}
              >
                {r.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                )}
                <span>
                  <span className="font-medium">{r.waktu}</span> — {r.pesan}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
