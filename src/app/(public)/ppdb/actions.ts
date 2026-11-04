"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

const skema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  nisn: z.string().optional().default(""),
  jenisKelamin: z.enum(["L", "P"]),
  tempatLahir: z.string().optional().default(""),
  tanggalLahir: z.string().optional().default(""),
  alamat: z.string().min(3, "Alamat wajib diisi"),
  telepon: z.string().min(6, "Nomor telepon tidak valid"),
  email: z.string().email("Email tidak valid").or(z.literal("")).optional(),
  asalSekolah: z.string().optional().default(""),
  jurusanPilihanId: z.string().optional().default(""),
  namaOrangTua: z.string().optional().default(""),
  teleponOrangTua: z.string().optional().default(""),
});

export type PpdbState = { error?: string; sukses?: string; nomor?: string };

function nomorPendaftaran() {
  const tahun = new Date().getFullYear();
  const acak = randomBytes(3).toString("hex").toUpperCase();
  return `PPDB-${tahun}-${acak}`;
}

export async function daftarPpdb(
  _prev: PpdbState,
  formData: FormData,
): Promise<PpdbState> {
  const parsed = skema.safeParse({
    nama: String(formData.get("nama") ?? "").trim(),
    nisn: String(formData.get("nisn") ?? "").trim(),
    jenisKelamin: String(formData.get("jenisKelamin") ?? "L"),
    tempatLahir: String(formData.get("tempatLahir") ?? "").trim(),
    tanggalLahir: String(formData.get("tanggalLahir") ?? "").trim(),
    alamat: String(formData.get("alamat") ?? "").trim(),
    telepon: String(formData.get("telepon") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    asalSekolah: String(formData.get("asalSekolah") ?? "").trim(),
    jurusanPilihanId: String(formData.get("jurusanPilihanId") ?? "").trim(),
    namaOrangTua: String(formData.get("namaOrangTua") ?? "").trim(),
    teleponOrangTua: String(formData.get("teleponOrangTua") ?? "").trim(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const d = parsed.data;
  const nomor = nomorPendaftaran();

  await prisma.ppdbPendaftaran.create({
    data: {
      nomorPendaftaran: nomor,
      nama: d.nama,
      nisn: d.nisn || null,
      jenisKelamin: d.jenisKelamin,
      tempatLahir: d.tempatLahir || null,
      tanggalLahir: d.tanggalLahir ? new Date(d.tanggalLahir) : null,
      alamat: d.alamat,
      telepon: d.telepon,
      email: d.email || null,
      asalSekolah: d.asalSekolah || null,
      jurusanPilihanId: d.jurusanPilihanId || null,
      namaOrangTua: d.namaOrangTua || null,
      teleponOrangTua: d.teleponOrangTua || null,
      status: "baru",
    },
  });

  return {
    sukses: "Pendaftaran berhasil dikirim.",
    nomor,
  };
}

export async function cekStatusPpdb(nomor: string) {
  const row = await prisma.ppdbPendaftaran.findUnique({
    where: { nomorPendaftaran: nomor.trim().toUpperCase() },
  });
  return row;
}
