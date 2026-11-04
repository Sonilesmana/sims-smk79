export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Pengeluaran"
      description="Pengajuan dan persetujuan pengeluaran sekolah."
      icon="TrendingDown"
      permission="keuangan.pengeluaran"
    />
  );
}
