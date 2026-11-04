export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Laporan Keuangan"
      description="Rekap pemasukan, pengeluaran, dan tunggakan."
      icon="BarChart3"
      permission="keuangan.laporan"
    />
  );
}
