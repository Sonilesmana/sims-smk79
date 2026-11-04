export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Pembayaran"
      description="Pencatatan pembayaran tunai, transfer, dan angsuran."
      icon="Wallet"
      permission="keuangan.view"
    />
  );
}
