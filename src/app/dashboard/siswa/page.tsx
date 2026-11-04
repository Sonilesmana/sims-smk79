export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/school-config";

export default async function SiswaPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const rows = await prisma.siswa.findMany({
    where: { status: "aktif" },
    include: { kelas: { include: { jurusan: true } } },
    orderBy: { nama: "asc" },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Data Siswa"
        description={`${rows.length} siswa aktif terdaftar`}
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState text="Belum ada data siswa." />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">NIS</th>
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">Kelas</th>
                  <th className="py-2 pr-4 font-medium">Jurusan</th>
                  <th className="py-2 pr-4 font-medium">L/P</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{s.nis}</td>
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{s.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{s.kelas?.nama ?? "-"}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{s.kelas?.jurusan?.nama ?? "-"}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{s.jenisKelamin}</td>
                    <td className="py-2.5">
                      <Badge tone="emerald">{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
