"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser, punyaPermission } from "@/lib/auth";
import { KUNCI_PENGATURAN } from "@/lib/school-config";

const skema = z.object({
  nama: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  singkatan: z.string().min(2),
  npsn: z.string().optional().default(""),
  akreditasi: z.string().optional().default(""),
  alamat: z.string().optional().default(""),
  telepon: z.string().optional().default(""),
  email: z.string().optional().default(""),
  website: z.string().optional().default(""),
  kepalaSekolah: z.string().optional().default(""),
  motto: z.string().optional().default(""),
  logoUrl: z.string().optional().default(""),
});

export type PengaturanState = { error?: string; sukses?: string };

export async function simpanPengaturan(
  _prev: PengaturanState,
  formData: FormData,
): Promise<PengaturanState> {
  const user = await getSessionUser();
  if (!punyaPermission(user, "pengaturan.manage")) {
    return { error: "Anda tidak memiliki hak untuk mengubah pengaturan." };
  }

  const parsed = skema.safeParse({
    nama: String(formData.get("nama") ?? "").trim(),
    singkatan: String(formData.get("singkatan") ?? "").trim(),
    npsn: String(formData.get("npsn") ?? "").trim(),
    akreditasi: String(formData.get("akreditasi") ?? "").trim(),
    alamat: String(formData.get("alamat") ?? "").trim(),
    telepon: String(formData.get("telepon") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    kepalaSekolah: String(formData.get("kepalaSekolah") ?? "").trim(),
    motto: String(formData.get("motto") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const d = parsed.data;
  const pasangan: [string, string][] = [
    [KUNCI_PENGATURAN.nama, d.nama],
    [KUNCI_PENGATURAN.singkatan, d.singkatan],
    [KUNCI_PENGATURAN.npsn, d.npsn],
    [KUNCI_PENGATURAN.akreditasi, d.akreditasi],
    [KUNCI_PENGATURAN.alamat, d.alamat],
    [KUNCI_PENGATURAN.telepon, d.telepon],
    [KUNCI_PENGATURAN.email, d.email],
    [KUNCI_PENGATURAN.website, d.website],
    [KUNCI_PENGATURAN.kepalaSekolah, d.kepalaSekolah],
    [KUNCI_PENGATURAN.motto, d.motto],
    [KUNCI_PENGATURAN.logoUrl, d.logoUrl || "/logo.svg"],
  ];

  await prisma.$transaction([
    ...pasangan.map(([kunci, nilai]) =>
      prisma.pengaturan.upsert({
        where: { kunci },
        update: { nilai, kategori: kunci.startsWith("akademik") ? "akademik" : "sekolah" },
        create: {
          kunci,
          nilai,
          kategori: kunci.startsWith("akademik") ? "akademik" : "sekolah",
        },
      }),
    ),
    prisma.auditLog.create({
      data: {
        userId: user!.id,
        aksi: "update",
        entitas: "pengaturan",
        deskripsi: "Memperbarui identitas sekolah",
      },
    }),
  ]);

  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/dashboard");
  return { sukses: "Pengaturan berhasil disimpan." };
}
