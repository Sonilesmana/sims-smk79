import { Card, PageHeader, EmptyState, Badge } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Halaman modul yang belum diimplementasikan penuh pada M1.
// Menampilkan ringkasan nyata dari database + keterangan modul.
export async function ModulPlaceholder({
  title,
  description,
  icon,
  permission,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  permission: string;
  children?: React.ReactNode;
}) {
  const user = await getSessionUser();
  const boleh = !!user && (user.role === "admin" || user.permissions.includes(permission));

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <Badge tone={boleh ? "emerald" : "red"}>
            {boleh ? "Akses diizinkan" : "Akses ditolak"}
          </Badge>
        }
      />
      {boleh ? (
        children ?? (
          <Card title="Modul dalam pengembangan" icon={icon}>
            <EmptyState
              text="Struktur data dan halaman modul ini sudah terhubung ke database terpusat. Fungsi lengkap dibangun pada tahap berikutnya."
              icon={icon}
            />
          </Card>
        )
      ) : (
        <Card>
          <EmptyState
            text="Peran Anda tidak memiliki hak akses ke modul ini."
            icon="ShieldAlert"
          />
        </Card>
      )}
    </>
  );
}

export async function hitungModul() {
  const [siswa, guru, kelas, mapel, absensi, nilai, ujian, tagihan, ppdb, surat] =
    await Promise.all([
      prisma.siswa.count(),
      prisma.guru.count(),
      prisma.kelas.count(),
      prisma.mataPelajaran.count(),
      prisma.absensi.count(),
      prisma.nilai.count(),
      prisma.paketUjian.count(),
      prisma.tagihan.count(),
      prisma.ppdbPendaftaran.count(),
      prisma.surat.count(),
    ]);
  return { siswa, guru, kelas, mapel, absensi, nilai, ujian, tagihan, ppdb, surat };
}
