export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mergeSchoolConfig } from "@/lib/school-config";
import { PanelShell } from "@/components/panel-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const rows = await prisma.pengaturan.findMany({
    where: { kategori: { in: ["sekolah", "akademik"] } },
    select: { kunci: true, nilai: true },
  });
  const sekolah = mergeSchoolConfig(rows);

  return (
    <PanelShell user={user} sekolah={{ nama: sekolah.nama, singkatan: sekolah.singkatan, logoUrl: sekolah.logoUrl }}>
      {children}
    </PanelShell>
  );
}
