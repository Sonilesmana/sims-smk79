export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Ikuti Ujian"
      description="Daftar ujian yang tersedia untuk dikerjakan."
      icon="MonitorPlay"
      permission="cbt.ikuti"
    />
  );
}
