"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser, punyaPermission } from "@/lib/auth";

const skema = z.object({
  siswaId: z.string().min(1),
  catatan: z.string().trim().min(3, "Catatan minimal 3 karakter").max(1000, "Catatan terlalu panjang"),
});

export type WaliState = { error?: string; sukses?: string };

export async function simpanCatatan(
  _prev: WaliState,
  formData: FormData,
): Promise<WaliState> {
  const user = await getSessionUser();
  if (!punyaPermission(user, "wali.catatan")) {
    return { error: "Anda tidak memiliki hak untuk mengisi catatan wali." };
  }

  const parsed = skema.safeParse({
    siswaId: String(formData.get("siswaId") ?? ""),
    catatan: String(formData.get("catatan") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { siswaId, catatan } = parsed.data;
  const guru = await prisma.guru.findUnique({ where: { userId: user!.id } });
  if (!guru) return { error: "Akun ini bukan akun guru." };

  // Validasi kepemilikan: guru hanya boleh mencatat siswa di kelas yang diwalikan
  const siswa = await prisma.siswa.findFirst({
    where: { id: siswaId, kelas: { waliKelasId: guru.id } },
    include: { kelas: true },
  });
  if (!siswa) {
    return { error: "Siswa ini bukan bagian dari kelas yang Anda walikan." };
  }

  await prisma.$transaction([
    prisma.catatanWali.create({ data: { siswaId, guruId: guru.id, catatan } }),
    prisma.auditLog.create({
      data: {
        userId: user!.id,
        aksi: "create",
        entitas: "catatan_wali",
        entitasId: siswaId,
        deskripsi: `Catatan wali untuk ${siswa.nama}`,
      },
    }),
  ]);

  revalidatePath("/dashboard/wali-kelas");
  return { sukses: `Catatan untuk ${siswa.nama} tersimpan.` };
}
