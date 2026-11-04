"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  catatLogin,
  cekRateLimit,
  createSession,
  destroySession,
  verifyPassword,
} from "@/lib/auth";

const skemaLogin = z.object({
  identifier: z.string().min(3, "Masukkan username, NIS, atau NIP"),
  password: z.string().min(1, "Password wajib diisi"),
  next: z.string().optional(),
});

export type LoginState = { error?: string; ok?: boolean };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = skemaLogin.safeParse({
    identifier: String(formData.get("identifier") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { identifier, password, next } = parsed.data;
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;
  const userAgent = hdrs.get("user-agent");

  const limit = await cekRateLimit(identifier);
  if (!limit.boleh) {
    await catatLogin(identifier, false, ip);
    return {
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${limit.sisaMenit} menit.`,
    };
  }

  // Cari user berdasarkan username, email, NIS (siswa), atau NIP (guru)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
        { siswa: { nis: identifier } },
        { siswa: { nisn: identifier } },
        { guru: { nip: identifier } },
      ],
    },
  });

  if (!user) {
    await catatLogin(identifier, false, ip);
    return { error: "Akun tidak ditemukan. Periksa kembali." };
  }

  if (!user.aktif) {
    await catatLogin(identifier, false, ip);
    return { error: "Akun Anda tidak aktif. Hubungi administrator." };
  }

  const cocok = await verifyPassword(password, user.passwordHash);
  if (!cocok) {
    await catatLogin(identifier, false, ip);
    return { error: "Password salah." };
  }

  await prisma.$transaction([
    prisma.loginAttempt.create({ data: { identifier, sukses: true, ip: ip ?? null } }),
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        aksi: "login",
        entitas: "user",
        entitasId: user.id,
        deskripsi: `Login berhasil (${user.username})`,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
      },
    }),
  ]);

  await createSession(user.id, { userAgent, ip });
  redirect(next && next.startsWith("/dashboard") ? next : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
