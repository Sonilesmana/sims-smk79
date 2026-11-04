export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Bank Soal"
      description="Kumpulan soal pilihan ganda dan esai per mata pelajaran."
      icon="Database"
      permission="cbt.bank"
    />
  );
}
