export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatTanggalID } from "@/lib/school-config";
import { Badge } from "@/components/ui";

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const b = await prisma.berita.findUnique({ where: { slug } });
  if (!b || b.status !== "publish") notFound();

  await prisma.berita.update({ where: { id: b.id }, data: { dilihat: { increment: 1 } } });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/berita" className="text-sm text-sky-600 hover:underline">
        ← Kembali ke berita
      </Link>
      <div className="mt-4">
        <Badge tone="sky">{b.kategori}</Badge>
      </div>
      <h1 className="mt-4 text-3xl font-bold leading-tight text-navy-900">{b.judul}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {formatTanggalID(b.publishedAt)} · {b.penulis ?? "Admin"} · {b.dilihat + 1} kali dibaca
      </p>
      <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {b.konten}
      </div>
    </article>
  );
}
