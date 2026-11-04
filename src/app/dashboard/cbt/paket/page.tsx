export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Paket Ujian"
      description="Penyusunan paket, jadwal, token, dan peserta ujian."
      icon="FileStack"
      permission="cbt.paket"
    />
  );
}
