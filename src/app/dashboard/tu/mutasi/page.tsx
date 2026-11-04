export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Mutasi Siswa"
      description="Siswa masuk, keluar, dan pindah sekolah."
      icon="ArrowLeftRight"
      permission="tu.mutasi"
    />
  );
}
