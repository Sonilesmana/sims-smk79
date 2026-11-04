import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Satu instance PrismaClient (PostgreSQL / Neon) untuk seluruh aplikasi.
// Prisma 7 memakai driver adapter (pg) alih-alih url di schema.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buatClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diatur. Lihat .env.example.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? buatClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
