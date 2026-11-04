import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "tidak terautentikasi" }, { status: 401 });

  const { id } = await params;
  const sesi = await prisma.sesiAbsen.findUnique({
    where: { id },
    include: {
      absensi: { include: { siswa: true }, orderBy: { waktuScan: "asc" } },
      kelas: true,
    },
  });
  if (!sesi) return NextResponse.json({ error: "tidak ditemukan" }, { status: 404 });

  // Akses: pemilik sesi atau peran pengawas
  let boleh = ["admin", "kurikulum", "kesiswaan", "kepsek", "wali_kelas"].includes(user.role);
  if (!boleh && user.role === "guru") {
    const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
    boleh = guru?.id === sesi.guruId;
  }
  if (!boleh) return NextResponse.json({ error: "akses ditolak" }, { status: 403 });

  const totalSiswa = await prisma.siswa.count({
    where: { kelasId: sesi.kelasId, status: "aktif" },
  });

  const now = new Date();
  const kedaluwarsa = now > sesi.jamTutup;

  return NextResponse.json({
    status: sesi.status,
    kedaluwarsa,
    totalSiswa,
    waktu: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    hadir: sesi.absensi.map((a) => ({
      siswaId: a.siswaId,
      nama: a.siswa.nama,
      pukul: new Date(a.waktuScan).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      metode: a.metode,
    })),
  });
}
