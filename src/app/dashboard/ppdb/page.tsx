export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="PPDB Online"
      description="Pendaftaran peserta didik baru dan verifikasi dokumen."
      icon="ClipboardCheck"
      permission="ppdb.view"
    />
  );
}
