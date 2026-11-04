export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Kurikulum"
      description="Capaian pembelajaran (CP), tujuan pembelajaran (TP), dan ATP."
      icon="GraduationCap"
      permission="kurikulum.manage"
    />
  );
}
