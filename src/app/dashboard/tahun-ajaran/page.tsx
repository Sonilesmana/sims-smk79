export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Tahun Ajaran & Semester"
      description="Pengelolaan periode akademik aktif."
      icon="CalendarRange"
      permission="tahunajaran.manage"
    />
  );
}
