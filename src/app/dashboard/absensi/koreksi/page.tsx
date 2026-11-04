export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card, PageHeader, TableWrap, Badge, EmptyState } from "@/components/ui";
import { getSessionUser, punyaPermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/school-config";
import { KoreksiRow, ProsesKoreksiForm } from "./koreksi-row";

export default async function KoreksiPage({
  searchParams,
}: {
  searchParams: Promise<{ sesi?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { sesi: sesiId } = await searchParams;
  const bisaAjukan = punyaPermission(user, "absensi.koreksi");
  const bisaProses = punyaPermission(user, "kesiswaan.manage");

  const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
  const sesi7Hari = guru
    ? await prisma.sesiAbsen.findMany({
        where: {
          guruId: guru.id,
          tanggal: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        include: {
          kelas: true,
          jadwal: { include: { mataPelajaran: true } },
        },
        orderBy: { tanggal: "desc" },
        take: 20,
      })
    : [];

  const sesiDipilih = sesiId
    ? await prisma.sesiAbsen.findUnique({
        where: { id: sesiId },
        include: { kelas: true, jadwal: { include: { mataPelajaran: true } }, absensi: true },
      })
    : null;

  const siswaKelas = sesiDipilih
    ? await prisma.siswa.findMany({
        where: { kelasId: sesiDipilih.kelasId, status: "aktif" },
        orderBy: { nama: "asc" },
      })
    : [];
  const statusSaatMap = new Map((sesiDipilih?.absensi ?? []).map((a) => [a.siswaId, a.status]));

  const antrean = bisaProses
    ? await prisma.koreksiAbsensi.findMany({
        where: { status: "menunggu" },
        include: { siswa: { include: { kelas: true } } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <>
      <PageHeader
        title="Koreksi Absensi"
        description="Ajukan koreksi (Guru) → persetujuan Kesiswaan"
      />

      {/* Antrean koreksi untuk Kesiswaan */}
      {bisaProses && (
        <Card
          className="mb-6"
          title="Antrean Koreksi — Menunggu Persetujuan"
          icon="Inbox"
          action={<Badge tone="amber">{antrean.length} menunggu</Badge>}
        >
          {antrean.length === 0 ? (
            <EmptyState text="Tidak ada pengajuan koreksi." icon="CheckCircle2" />
          ) : (
            <TableWrap>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="py-2 pr-4 font-medium">Siswa</th>
                    <th className="py-2 pr-4 font-medium">Koreksi</th>
                    <th className="py-2 pr-4 font-medium">Alasan</th>
                    <th className="py-2 font-medium">Keputusan</th>
                  </tr>
                </thead>
                <tbody>
                  {antrean.map((k) => (
                    <tr key={k.id} className="border-b border-slate-50 align-middle hover:bg-slate-50/60">
                      <td className="py-2.5 pr-4">
                        <p className="font-medium text-navy-900">{k.siswa.nama}</p>
                        <p className="text-xs text-slate-500">{k.siswa.kelas?.nama}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600">
                        {k.statusLama ?? "—"} → <strong>{k.statusBaru}</strong>
                      </td>
                      <td className="py-2.5 pr-4 max-w-xs text-xs italic text-slate-600">“{k.alasan}”</td>
                      <td className="py-2.5">
                        <ProsesKoreksiForm id={k.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      )}

      {/* Form ajukan koreksi untuk Guru */}
      {bisaAjukan && (
        <>
          <Card className="mb-6" title="1) Pilih Sesi (7 hari terakhir)" icon="CalendarDays">
            {sesi7Hari.length === 0 ? (
              <EmptyState text="Belum ada sesi absensi dalam 7 hari terakhir." icon="CalendarDays" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {sesi7Hari.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <span className="text-sm text-navy-900">
                      <strong>{s.jadwal?.mataPelajaran?.nama ?? "Sesi"}</strong> · {s.kelas.nama} ·{" "}
                      {formatTanggalID(s.tanggal)}{" "}
                      {new Date(s.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Link
                      href={`/dashboard/absensi/koreksi?sesi=${s.id}`}
                      className="rounded-lg border border-navy-900 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-navy-50"
                    >
                      Pilih
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {sesiDipilih && (
            <Card
              title={`2) Koreksi Kehadiran — ${sesiDipilih.kelas.nama} · ${sesiDipilih.jadwal?.mataPelajaran?.nama ?? ""}`}
              icon="PenLine"
            >
              <TableWrap>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                      <th className="py-2 pr-4 font-medium">Nama</th>
                      <th className="py-2 pr-4 font-medium">Status Tercatat</th>
                      <th className="py-2 font-medium">Koreksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaKelas.map((s) => (
                      <tr key={s.id} className="border-b border-slate-50 align-middle hover:bg-slate-50/60">
                        <td className="py-2.5 pr-4 font-medium text-navy-900">{s.nama}</td>
                        <td className="py-2.5 pr-4">
                          {statusSaatMap.get(s.id) ? (
                            <Badge tone="slate">{statusSaatMap.get(s.id)}</Badge>
                          ) : (
                            <span className="text-xs text-slate-400">belum tercatat</span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <KoreksiRow
                            sesiId={sesiDipilih.id}
                            siswaId={s.id}
                            nama={s.nama.split(" ")[0]}
                            statusSaat={statusSaatMap.get(s.id) ?? null}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </Card>
          )}
        </>
      )}

      {!bisaAjukan && !bisaProses && (
        <Card>
          <EmptyState text="Anda tidak memiliki akses ke modul koreksi." icon="ShieldAlert" />
        </Card>
      )}
    </>
  );
}
