export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Materi & Tugas"
      description="Materi pembelajaran, penugasan, dan pengumpulan tugas siswa."
      icon="BookOpen"
      permission="jadwal.view"
    />
  );
}
