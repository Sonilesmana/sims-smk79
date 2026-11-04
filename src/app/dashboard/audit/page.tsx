export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggalJamID } from "@/lib/school-config";

export default async function AuditPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const rows = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader title="Audit Log" description="Jejak aktivitas penting pada sistem" />
      <Card>
        {rows.length === 0 ? (
          <EmptyState text="Belum ada catatan audit." icon="ScrollText" />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Waktu</th>
                  <th className="py-2 pr-4 font-medium">Pengguna</th>
                  <th className="py-2 pr-4 font-medium">Aksi</th>
                  <th className="py-2 pr-4 font-medium">Entitas</th>
                  <th className="py-2 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-4 text-xs text-slate-500">
                      {formatTanggalJamID(l.createdAt)}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-navy-900">
                      {l.user?.nama ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge tone="sky">{l.aksi}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{l.entitas}</td>
                    <td className="py-2.5 text-slate-600">{l.deskripsi ?? "-"}</td>
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
