export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Backup & Restore"
      description="Ekspor dan pemulihan data sistem."
      icon="DatabaseBackup"
      permission="backup.manage"
    />
  );
}
