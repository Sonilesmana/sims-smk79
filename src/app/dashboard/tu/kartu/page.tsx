export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Kartu Pelajar"
      description="Cetak kartu pelajar dan kartu identitas guru dengan QR Code."
      icon="IdCard"
      permission="tu.kartu"
    />
  );
}
