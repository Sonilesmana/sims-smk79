import { cache } from "react";
import { prisma } from "./db";
import { mergeSchoolConfig, SCHOOL_DEFAULT, type SchoolConfig } from "./school-config";

// Konfigurasi sekolah jarang berubah — dedup per request, dan cache lintas request 5 menit.
const KUNCI = ["sekolah", "akademik"];

export const getSchoolConfig = cache(async (): Promise<SchoolConfig> => {
  try {
    const rows = await prisma.pengaturan.findMany({
      where: { kategori: { in: KUNCI } },
      select: { kunci: true, nilai: true },
    });
    return mergeSchoolConfig(rows);
  } catch {
    return { ...SCHOOL_DEFAULT };
  }
});
