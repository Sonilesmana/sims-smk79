import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "./db";

export const SESSION_COOKIE = "sims_session";
const SESSION_TTL_HARI = 7;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export type SessionUser = {
  id: string;
  username: string;
  nama: string;
  role: string;
  roleNama: string;
  permissions: string[];
  avatar?: string | null;
};

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ip?: string | null } = {},
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HARI * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      token: hashToken(token),
      userId,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = await prisma.session.findUnique({
    where: { token: hashToken(raw) },
    include: {
      user: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          guru: true,
          siswa: true,
          orangTua: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (!session.user.aktif) return null;

  const u = session.user;
  return {
    id: u.id,
    username: u.username,
    nama: u.nama,
    role: u.role.kode,
    roleNama: u.role.nama,
    permissions: u.role.permissions.map((rp) => rp.permission.kode),
    avatar: u.guru?.foto ?? u.siswa?.foto ?? null,
  };
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw) {
    await prisma.session
      .updateMany({ where: { token: hashToken(raw) }, data: { revokedAt: new Date() } })
      .catch(() => null);
  }
  store.delete(SESSION_COOKIE);
}

// ------- Rate limiting login (brute force protection) -------
const MAX_GAGAL = 5;
const JEDA_MENIT = 15;

export async function cekRateLimit(identifier: string): Promise<{ boleh: boolean; sisaMenit?: number }> {
  const sejak = new Date(Date.now() - JEDA_MENIT * 60 * 1000);
  const gagal = await prisma.loginAttempt.count({
    where: { identifier, sukses: false, createdAt: { gte: sejak } },
  });
  if (gagal >= MAX_GAGAL) return { boleh: false, sisaMenit: JEDA_MENIT };
  return { boleh: true };
}

export async function catatLogin(identifier: string, sukses: boolean, ip?: string | null) {
  await prisma.loginAttempt.create({ data: { identifier, sukses, ip: ip ?? null } });
}

export function punyaPermission(user: SessionUser | null, ...kode: string[]): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return kode.some((k) => user.permissions.includes(k));
}
