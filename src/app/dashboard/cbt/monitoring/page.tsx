export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Monitoring CBT"
      description="Pemantauan ujian berlangsung dan penilaian esai."
      icon="Activity"
      permission="cbt.monitor"
    />
  );
}
