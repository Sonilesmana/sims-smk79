export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Profil Saya"
      description="Informasi akun dan data pribadi Anda."
      icon="UserRound"
      permission="dashboard.view"
    />
  );
}
