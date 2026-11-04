export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Pengumuman"
      description="Pengumuman untuk guru, siswa, dan orang tua."
      icon="Megaphone"
      permission="pengumuman.manage"
    />
  );
}
