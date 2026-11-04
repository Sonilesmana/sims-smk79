export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Alumni"
      description="Data alumni sekolah."
      icon="UserCheck"
      permission="tu.view"
    />
  );
}
