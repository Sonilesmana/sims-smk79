export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function MapelPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const rows = await prisma.mataPelajaran.findMany({
    where: { aktif: true },
    orderBy: [{ kelompok: "asc" }, { nama: "asc" }],
  });

  const kelompok = {
    umum: "Kelompok Umum",
    kejuruan: "Kelompok Kejuruan",
    muatan_lokal: "Muatan Lokal",
  } as Record<string, string>;

  return (
    <>
      <PageHeader title="Mata Pelajaran" description={`${rows.length} mata pelajaran aktif`} />
      <Card>
        {rows.length === 0 ? (
          <EmptyState text="Belum ada mata pelajaran." />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Kode</th>
                  <th className="py-2 pr-4 font-medium">Nama Mata Pelajaran</th>
                  <th className="py-2 font-medium">Kelompok</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{m.kode}</td>
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{m.nama}</td>
                    <td className="py-2.5">
                      <Badge tone={m.kelompok === "kejuruan" ? "sky" : "slate"}>
                        {kelompok[m.kelompok] ?? m.kelompok}
                      </Badge>
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
