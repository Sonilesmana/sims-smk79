export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function GuruPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const rows = await prisma.guru.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
  });

  return (
    <>
      <PageHeader title="Data Guru" description={`${rows.length} guru & tenaga kependidikan`} />
      <Card>
        {rows.length === 0 ? (
          <EmptyState text="Belum ada data guru." />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">NIP</th>
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">L/P</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{g.nip ?? "-"}</td>
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{g.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{g.jenisKelamin}</td>
                    <td className="py-2.5">
                      <Badge tone="emerald">Aktif</Badge>
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
