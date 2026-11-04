"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser, punyaPermission } from "@/lib/auth";

export type KesiswaanState = { error?: string; sukses?: string };

export async function prosesIzin(
  _prev: KesiswaanState,
  formData: FormData,
): Promise<KesiswaanState> {
  const user = await getSessionUser();
  if (!punyaPermission(user, "kesiswaan.manage")) {
    return { error: "Anda tidak memiliki hak untuk memproses izin." };
  }

  const id = String(formData.get("id") ?? "");
  const keputusan = String(formData.get("keputusan") ?? "");
  if (!id || !["disetujui", "ditolak"].includes(keputusan)) {
    return { error: "Permintaan tidak valid." };
  }

  const pengajuan = await prisma.pengajuanIzin.findUnique({
    where: { id },
    include: { siswa: { include: { user: true } } },
  });
  if (!pengajuan) return { error: "Pengajuan tidak ditemukan." };
  if (pengajuan.status !== "menunggu") {
    return { error: "Pengajuan ini sudah diproses sebelumnya." };
  }

  await prisma.$transaction([
    prisma.pengajuanIzin.update({
      where: { id },
      data: {
        status: keputusan,
        diprosesOleh: user!.id,
        catatan: keputusan === "disetujui" ? "Disetujui oleh Kesiswaan" : "Ditolak oleh Kesiswaan",
      },
    }),
    prisma.notifikasi.create({
      data: {
        userId: pengajuan.siswa.userId,
        judul: keputusan === "disetujui" ? "Izin disetujui" : "Izin ditolak",
        pesan: `Pengajuan ${pengajuan.jenis} (${pengajuan.tanggalMulai.toISOString().slice(0, 10)} s/d ${pengajuan.tanggalAkhir.toISOString().slice(0, 10)}) ${keputusan === "disetujui" ? "disetujui" : "ditolak"} oleh Kesiswaan.`,
        tipe: "absensi",
        tautan: "/dashboard/absensi",
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: user!.id,
        aksi: "approve",
        entitas: "pengajuan_izin",
        entitasId: id,
        deskripsi: `Pengajuan ${pengajuan.jenis} siswa ${pengajuan.siswa.nama} → ${keputusan}`,
      },
    }),
  ]);

  revalidatePath("/dashboard/kesiswaan");
  return { sukses: `Pengajuan ${pengajuan.siswa.nama} ${keputusan === "disetujui" ? "disetujui" : "ditolak"}.` };
}
