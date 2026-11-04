"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const skema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  telepon: z.string().optional().default(""),
  subjek: z.string().min(3, "Subjek minimal 3 karakter"),
  pesan: z.string().min(5, "Pesan minimal 5 karakter"),
});

export type KontakState = { error?: string; sukses?: string };

export async function kirimPesan(
  _prev: KontakState,
  formData: FormData,
): Promise<KontakState> {
  const parsed = skema.safeParse({
    nama: String(formData.get("nama") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telepon: String(formData.get("telepon") ?? "").trim(),
    subjek: String(formData.get("subjek") ?? "").trim(),
    pesan: String(formData.get("pesan") ?? "").trim(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  await prisma.pesanKontak.create({ data: parsed.data });
  return { sukses: "Pesan Anda telah terkirim. Terima kasih!" };
}
