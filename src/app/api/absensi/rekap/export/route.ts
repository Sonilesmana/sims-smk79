import { NextResponse } from "next/server";
import { getSessionUser, punyaPermission } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUS = ["hadir", "izin", "sakit", "alpa", "terlambat"] as const;

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || !punyaPermission(user, "absensi.view")) {
    return new NextResponse("Akses ditolak", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const kelasId = searchParams.get("kelas");

  const siswa = await prisma.siswa.findMany({
    where: { status: "aktif", ...(kelasId ? { kelasId } : {}) },
    include: {
      kelas: true,
      absensi: true,
    },
    orderBy: { nama: "asc" },
  });

  const baris = siswa.map((s) => {
    const hitung: Record<string, number> = {};
    for (const st of STATUS) hitung[st] = 0;
    for (const a of s.absensi) hitung[a.status] = (hitung[a.status] ?? 0) + 1;
    const total = STATUS.reduce((a2, st) => a2 + hitung[st], 0);
    const pct = total > 0 ? Math.round((hitung.hadir / total) * 100) : 0;
    return {
      NIS: s.nis,
      Nama: s.nama,
      Kelas: s.kelas?.nama ?? "-",
      Hadir: hitung.hadir,
      Izin: hitung.izin,
      Sakit: hitung.sakit,
      Alpa: hitung.alpa,
      Terlambat: hitung.terlambat,
      "% Kehadiran": total > 0 ? `${pct}%` : "0%",
    };
  });

  const kolom = ["NIS", "Nama", "Kelas", "Hadir", "Izin", "Sakit", "Alpa", "Terlambat", "% Kehadiran"];
  const csv = [
    kolom.join(";"),
    ...baris.map((r) => kolom.map((k) => String((r as Record<string, string | number>)[k])).join(";")),
  ].join("\r\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rekap-absensi.csv"`,
    },
  });
}
