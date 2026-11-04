export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Surat & Arsip"
      description="Surat masuk, surat keluar, dan arsip dokumen digital."
      icon="Mail"
      permission="tu.view"
    />
  );
}
