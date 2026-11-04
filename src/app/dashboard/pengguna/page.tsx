export const dynamic = "force-dynamic";

import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggalJamID } from "@/lib/school-config";

export default async function PenggunaPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const rows = await prisma.user.findMany({
    include: { role: true },
    orderBy: [{ role: { nama: "asc" } }, { nama: "asc" }],
    take: 200,
  });

  return (
    <>
      <PageHeader title="Pengguna & Role" description={`${rows.length} akun terdaftar`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(
          await prisma.role.findMany({
            include: { _count: { select: { users: true, permissions: true } } },
            orderBy: { nama: "asc" },
          })
        ).map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-navy-900">{r.nama}</p>
              <Badge tone="sky">{r._count.users} akun</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">{r.deskripsi}</p>
            <p className="mt-2 text-[11px] text-slate-400">
              {r._count.permissions} permission
            </p>
          </div>
        ))}
      </div>

      <Card title="Daftar Akun">
        <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="py-2 pr-4 font-medium">Username</th>
                <th className="py-2 pr-4 font-medium">Nama</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Login Terakhir</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{u.username}</td>
                  <td className="py-2.5 pr-4 font-medium text-navy-900">{u.nama}</td>
                  <td className="py-2.5 pr-4">
                    <Badge tone="slate">{u.role.nama}</Badge>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500">
                    {u.lastLoginAt ? formatTanggalJamID(u.lastLoginAt) : "Belum pernah"}
                  </td>
                  <td className="py-2.5">
                    <Badge tone={u.aktif ? "emerald" : "red"}>
                      {u.aktif ? "aktif" : "nonaktif"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}
