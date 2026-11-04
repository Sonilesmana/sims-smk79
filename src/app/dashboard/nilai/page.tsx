export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function NilaiPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const filter: Record<string, unknown> = {};
  if (user.role === "siswa") {
    const siswa = await prisma.siswa.findUnique({ where: { userId: user.id } });
    filter.siswaId = siswa?.id ?? "—";
  } else if (user.role === "orang_tua") {
    const ortu = await prisma.orangTua.findUnique({
      where: { userId: user.id },
      include: { anakanak: true },
    });
    filter.siswaId = { in: (ortu?.anakanak ?? []).map((a) => a.siswaId) };
  } else if (user.role === "guru") {
    const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
    filter.guruId = guru?.id ?? "—";
  }

  const rows = await prisma.nilai.findMany({
    where: filter,
    include: {
      siswa: true,
      mataPelajaran: true,
      semester: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader title="Penilaian" description={`${rows.length} catatan nilai`} />
      <Card>
        {rows.length === 0 ? (
          <EmptyState text="Belum ada data nilai." icon="ClipboardList" />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Siswa</th>
                  <th className="py-2 pr-4 font-medium">Mata Pelajaran</th>
                  <th className="py-2 pr-4 font-medium">Jenis</th>
                  <th className="py-2 pr-4 font-medium">Nilai</th>
                  <th className="py-2 pr-4 font-medium">Semester</th>
                  <th className="py-2 font-medium">Sumber</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((n) => (
                  <tr key={n.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{n.siswa.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{n.mataPelajaran.nama}</td>
                    <td className="py-2.5 pr-4 text-slate-600 capitalize">{n.jenisKode}</td>
                    <td className="py-2.5 pr-4 font-semibold text-navy-900">{n.nilai}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{n.semester.nama}</td>
                    <td className="py-2.5">
                      <Badge tone={n.sumber === "cbt" ? "sky" : "slate"}>{n.sumber}</Badge>
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
