export const dynamic = "force-dynamic";

import { Card, PageHeader } from "@/components/ui";
import { getSessionUser, punyaPermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mergeSchoolConfig } from "@/lib/school-config";
import { simpanPengaturan } from "./actions";
import { PengaturanForm } from "./form";

export default async function PengaturanPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const boleh = punyaPermission(user, "pengaturan.manage");

  const rows = await prisma.pengaturan.findMany({
    where: { kategori: { in: ["sekolah", "akademik"] } },
    select: { kunci: true, nilai: true },
  });
  const s = mergeSchoolConfig(rows);

  return (
    <>
      <PageHeader
        title="Pengaturan Sistem"
        description="Identitas sekolah yang tampil di seluruh aplikasi dan website publik"
      />

      <Card title="Identitas Sekolah" icon="Settings">
        {boleh ? (
          <PengaturanForm
            aksi={simpanPengaturan}
            nilai={{
              nama: s.nama,
              singkatan: s.singkatan,
              npsn: s.npsn,
              akreditasi: s.akreditasi,
              alamat: s.alamat,
              telepon: s.telepon,
              email: s.email,
              website: s.website,
              kepalaSekolah: s.kepalaSekolah,
              motto: s.motto,
              logoUrl: s.logoUrl,
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">
            Anda tidak memiliki hak untuk mengubah pengaturan sistem.
          </p>
        )}
      </Card>
    </>
  );
}
