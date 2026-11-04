export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Data Orang Tua"
      description="Data orang tua/wali dan keterkaitannya dengan siswa."
      icon="HeartHandshake"
      permission="orangtua.view"
    />
  );
}
