export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getSchoolConfig } from "@/lib/school-settings";
import { PanelShell } from "@/components/panel-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sekolah = await getSchoolConfig();

  return (
    <PanelShell user={user} sekolah={{ nama: sekolah.nama, singkatan: sekolah.singkatan, logoUrl: sekolah.logoUrl }}>
      {children}
    </PanelShell>
  );
}
