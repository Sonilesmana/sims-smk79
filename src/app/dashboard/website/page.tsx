export const dynamic = "force-dynamic";

import { ModulPlaceholder } from "@/components/modul-placeholder";

export default function Page() {
  return (
    <ModulPlaceholder
      title="Website & Berita"
      description="Konten website publik: berita, galeri, dan halaman statis."
      icon="Globe"
      permission="website.manage"
    />
  );
}
