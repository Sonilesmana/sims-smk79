export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ManualForm } from "./manual-form";

export default async function ManualPage({
  searchParams,
}: {
  searchParams: Promise<{ sesi?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  const { sesi: sesiId } = await searchParams;

  if (!sesiId) {
    return (
      <>
        <PageHeader title="Input Absensi Manual" />
        <Card>
          <EmptyState
            text="Pilih sesi dari halaman detail sesi terlebih dahulu."
            icon="ClipboardList"
            action={
              <Link href="/dashboard/absensi" className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white">
                Ke Halaman Absensi
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  const sesi = await prisma.sesiAbsen.findUnique({
    where: { id: sesiId },
    include: {
      kelas: true,
      jadwal: { include: { mataPelajaran: true } },
      absensi: true,
    },
  });
  if (!sesi) notFound();

  const siswa = await prisma.siswa.findMany({
    where: { kelasId: sesi.kelasId, status: "aktif" },
    orderBy: { nama: "asc" },
  });

  const catatanMap = new Map(sesi.absensi.map((a) => [a.siswaId, a.status]));

  return (
    <>
      <PageHeader
        title="Input Absensi Manual"
        description={`${sesi.jadwal?.mataPelajaran?.nama ?? "Sesi"} · Kelas ${sesi.kelas.nama} — wajib isi alasan`}
        action={
          <Link
            href={`/dashboard/absensi/sesi/${sesi.id}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            ← Kembali ke Sesi
          </Link>
        }
      />
      <Card>
        {siswa.length === 0 ? (
          <EmptyState text="Belum ada siswa di kelas ini." icon="Users" />
        ) : (
          <TableWrap>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">NIS</th>
                  <th className="py-2 pr-4 font-medium">Nama</th>
                  <th className="py-2 pr-4 font-medium">Status Saat Ini</th>
                  <th className="py-2 font-medium">Input Manual</th>
                </tr>
              </thead>
              <tbody>
                {siswa.map((s) => {
                  const status = catatanMap.get(s.id);
                  return (
                    <tr key={s.id} className="border-b border-slate-50 align-middle hover:bg-slate-50/60">
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{s.nis}</td>
                      <td className="py-2.5 pr-4 font-medium text-navy-900">{s.nama}</td>
                      <td className="py-2.5 pr-4">
                        {status ? (
                          <Badge tone={status === "hadir" ? "emerald" : status === "alpa" ? "red" : "amber"}>
                            {status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">belum tercatat</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {status ? (
                          <span className="text-xs text-slate-400">tercatat — gunakan Koreksi bila perlu</span>
                        ) : (
                          <ManualForm sesiId={sesi.id} siswaId={s.id} nama={s.nama.split(" ")[0]} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
