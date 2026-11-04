export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Rapor Digital"
      description="Rapor hasil belajar per semester beserta persetujuan."
      icon="FileText"
      permission="rapor.view"
    />
  );
}
