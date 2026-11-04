export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Absensi & Rekap"
      description="Sesi absensi QR Code, riwayat, izin/sakit, dan rekap kehadiran."
      icon="ScanLine"
      permission="absensi.view"
    />
  );
}
