export const dynamic = "force-dynamic";

import { PageHeader, Card, EmptyState, Badge } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { formatRupiah, formatTanggalID } from "@/lib/school-config";
import { prisma } from "@/lib/db";

export default async function TagihanPage() {
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
  }

  const rows = await prisma.tagihan.findMany({
    where: filter,
    include: { siswa: true, jenis: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const total = rows.reduce((a, r) => a + r.totalTagihan, 0);
  const dibayar = rows.reduce((a, r) => a + r.dibayar, 0);

  return (
    <>
      <PageHeader title="Tagihan" description={`${rows.length} tagihan`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Total Tagihan</p>
          <p className="mt-2 text-xl font-bold text-navy-900">{formatRupiah(total)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Sudah Dibayar</p>
          <p className="mt-2 text-xl font-bold text-emerald-600">{formatRupiah(dibayar)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Sisa</p>
          <p className="mt-2 text-xl font-bold text-red-600">{formatRupiah(total - dibayar)}</p>
        </div>
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState text="Belum ada tagihan." icon="Receipt" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="text-sm font-medium text-navy-900">
                    {t.jenis.nama}
                    {t.bulan ? ` — ${t.bulan}/${t.tahun}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.siswa.nama} · jatuh tempo {formatTanggalID(t.jatuhTempo)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-navy-900">
                    {formatRupiah(t.totalTagihan)}
                  </span>
                  <Badge
                    tone={t.status === "lunas" ? "emerald" : t.status === "sebagian" ? "amber" : "red"}
                  >
                    {t.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
