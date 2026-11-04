"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser, punyaPermission } from "@/lib/auth";

const now = () => new Date();
const slugKode = () =>
  "ABS" + randomBytes(3).toString("hex").toUpperCase();

async function sesiMilikGuru(user: { id: string; role: string }, jadwalGuruId: string) {
  if (user.role === "guru") {
    const guru = await prisma.guru.findUnique({ where: { userId: user.id } });
    return guru?.id === jadwalGuruId;
  }
  return true; // admin/kurikulum/kesiswaan boleh mengelola
}

// ============ Buka sesi absensi (Guru) ============
export async function bukaSesi(jadwalId: string, metode: "qr_guru" | "qr_siswa" = "qr_guru") {
  const user = await getSessionUser();
  if (!user || !punyaPermission(user, "absensi.create")) {
    throw new Error("Anda tidak memiliki hak untuk membuka sesi absensi.");
  }

  const jadwal = await prisma.jadwal.findUnique({
    where: { id: jadwalId },
    include: { kelas: true, mataPelajaran: true, guru: true },
  });
  if (!jadwal) throw new Error("Jadwal tidak ditemukan.");
  if (!(await sesiMilikGuru(user, jadwal.guruId))) {
    throw new Error("Anda bukan pengampu jadwal ini.");
  }

  const awal = new Date();
  awal.setHours(0, 0, 0, 0);
  const sesiAda = await prisma.sesiAbsen.findFirst({
    where: { jadwalId, status: "buka", tanggal: { gte: awal } },
  });
  if (sesiAda) redirect(`/dashboard/absensi/sesi/${sesiAda.id}`);

  const sesi = await prisma.sesiAbsen.create({
    data: {
      kode: slugKode(),
      jadwalId: jadwal.id,
      kelasId: jadwal.kelasId,
      guruId: jadwal.guruId,
      token: randomBytes(20).toString("hex"),
      metode,
      jamTutup: new Date(Date.now() + 15 * 60 * 1000), // 15 menit
      status: "buka",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      aksi: "create",
      entitas: "sesi_absen",
      entitasId: sesi.id,
      deskripsi: `Membuka sesi absensi ${jadwal.mataPelajaran.nama} — ${jadwal.kelas.nama}`,
    },
  });

  redirect(`/dashboard/absensi/sesi/${sesi.id}`);
}

// ============ Tutup sesi ============
export async function tutupSesi(sesiId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Sesi tidak valid.");
  const sesi = await prisma.sesiAbsen.findUnique({ where: { id: sesiId } });
  if (!sesi) throw new Error("Sesi tidak ditemukan.");
  if (!(await sesiMilikGuru(user, sesi.guruId))) {
    throw new Error("Anda tidak mengelola sesi ini.");
  }
  await prisma.sesiAbsen.update({ where: { id: sesiId }, data: { status: "tutup" } });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      aksi: "update",
      entitas: "sesi_absen",
      entitasId: sesiId,
      deskripsi: "Menutup sesi absensi",
    },
  });
  revalidatePath("/dashboard/absensi");
}

// ============ Scan oleh Siswa (QR ditampilkan guru) ============
export type ScanHasil = {
  ok: boolean;
  pesan: string;
  nama?: string;
  mapel?: string;
  kelas?: string;
  waktu?: string;
};

export async function lakukanScan(token: string): Promise<ScanHasil> {
  const user = await getSessionUser();
  if (!user) return { ok: false, pesan: "Anda harus login sebagai siswa terlebih dahulu." };

  const siswa = await prisma.siswa.findUnique({
    where: { userId: user.id },
    include: { kelas: true },
  });
  if (!siswa) return { ok: false, pesan: "Akun ini bukan akun siswa." };
  if (siswa.status !== "aktif") return { ok: false, pesan: "Status siswa Anda tidak aktif." };

  const sesi = await prisma.sesiAbsen.findUnique({
    where: { token },
    include: { jadwal: { include: { mataPelajaran: true } }, kelas: true },
  });
  if (!sesi) return { ok: false, pesan: "QR Code tidak valid atau bukan dari sesi resmi sekolah." };
  if (sesi.status !== "buka") return { ok: false, pesan: "Sesi absensi sudah ditutup oleh guru." };
  if (now() > sesi.jamTutup)
    return { ok: false, pesan: "QR Code sudah kedaluwarsa (berlaku 15 menit)." };
  if (siswa.kelasId !== sesi.kelasId) {
    return {
      ok: false,
      pesan: `Sesi ini untuk kelas ${sesi.kelas.nama}; Anda terdaftar di ${siswa.kelas?.nama ?? "-"}.`,
    };
  }

  const sudah = await prisma.absensi.findUnique({
    where: { sesiId_siswaId: { sesiId: sesi.id, siswaId: siswa.id } },
  });
  if (sudah) return { ok: false, pesan: "Anda sudah tercatat di sesi ini. Tidak dapat scan ganda." };

  const waktu = now();
  await prisma.$transaction([
    prisma.absensi.create({
      data: {
        sesiId: sesi.id,
        siswaId: siswa.id,
        status: "hadir",
        metode: "qr",
        waktuScan: waktu,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        aksi: "create",
        entitas: "absensi",
        entitasId: sesi.id,
        deskripsi: `Scan QR absensi ${sesi.jadwal?.mataPelajaran?.nama ?? ""}`,
      },
    }),
  ]);

  return {
    ok: true,
    pesan: "Kehadiran Anda tercatat.",
    nama: siswa.nama,
    mapel: sesi.jadwal?.mataPelajaran?.nama,
    kelas: sesi.kelas.nama,
    waktu: waktu.toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

// ============ Scan kartu pelajar oleh Guru (Metode 2) ============
export async function catatScanKartu(sesiId: string, qrCode: string): Promise<ScanHasil> {
  const user = await getSessionUser();
  if (!user || !punyaPermission(user, "absensi.create")) {
    return { ok: false, pesan: "Anda tidak memiliki hak scan kartu." };
  }

  const sesi = await prisma.sesiAbsen.findUnique({
    where: { id: sesiId },
    include: { kelas: true, jadwal: { include: { mataPelajaran: true } } },
  });
  if (!sesi) return { ok: false, pesan: "Sesi tidak ditemukan." };
  if (!(await sesiMilikGuru(user, sesi.guruId))) {
    return { ok: false, pesan: "Anda bukan pengampu sesi ini." };
  }
  if (sesi.status !== "buka") return { ok: false, pesan: "Sesi sudah ditutup." };
  if (now() > sesi.jamTutup) return { ok: false, pesan: "Token sesi kedaluwarsa." };

  const siswa = await prisma.siswa.findUnique({ where: { qrCode } });
  if (!siswa) return { ok: false, pesan: "Kartu pelajar tidak dikenali." };
  if (siswa.status !== "aktif") return { ok: false, pesan: "Status siswa tidak aktif." };
  if (siswa.kelasId !== sesi.kelasId) {
    return { ok: false, pesan: `${siswa.nama} bukan anggota kelas ${sesi.kelas.nama}.` };
  }

  const sudah = await prisma.absensi.findUnique({
    where: { sesiId_siswaId: { sesiId: sesi.id, siswaId: siswa.id } },
  });
  if (sudah) return { ok: false, pesan: `${siswa.nama} sudah tercatat hadir.` };

  await prisma.$transaction([
    prisma.absensi.create({
      data: { sesiId: sesi.id, siswaId: siswa.id, status: "hadir", metode: "qr", waktuScan: now() },
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        aksi: "create",
        entitas: "absensi",
        entitasId: sesi.id,
        deskripsi: `Scan kartu pelajar: ${siswa.nama}`,
      },
    }),
  ]);

  return {
    ok: true,
    pesan: `${siswa.nama} tercatat hadir.`,
    nama: siswa.nama,
    mapel: sesi.jadwal?.mataPelajaran?.nama,
    kelas: sesi.kelas.nama,
  };
}

// ============ Input absensi manual (Guru) ============
export type ManualState = { error?: string; sukses?: string };

export async function simpanManual(
  _prev: ManualState,
  formData: FormData,
): Promise<ManualState> {
  const user = await getSessionUser();
  if (!user || !punyaPermission(user, "absensi.create")) {
    return { error: "Anda tidak memiliki hak input manual." };
  }

  const sesiId = String(formData.get("sesiId") ?? "");
  const siswaId = String(formData.get("siswaId") ?? "");
  const status = String(formData.get("status") ?? "");
  const keterangan = String(formData.get("keterangan") ?? "").trim();

  if (!["hadir", "izin", "sakit", "alpa", "terlambat"].includes(status)) {
    return { error: "Status absensi tidak valid." };
  }
  if (!keterangan) return { error: "Alasan/keterangan wajib diisi." };

  const sesi = await prisma.sesiAbsen.findUnique({ where: { id: sesiId } });
  if (!sesi) return { error: "Sesi tidak ditemukan." };
  if (!(await sesiMilikGuru(user, sesi.guruId))) {
    return { error: "Anda tidak mengelola sesi ini." };
  }

  const sudah = await prisma.absensi.findUnique({
    where: { sesiId_siswaId: { sesiId, siswaId } },
  });
  if (sudah) return { error: "Siswa ini sudah tercatat di sesi ini." };

  const siswa = await prisma.siswa.findFirst({
    where: { id: siswaId, kelasId: sesi.kelasId },
  });
  if (!siswa) return { error: "Siswa tidak ditemukan di kelas sesi ini." };

  await prisma.$transaction([
    prisma.absensi.create({
      data: { sesiId, siswaId, status, metode: "manual", keterangan },
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        aksi: "create",
        entitas: "absensi",
        entitasId: sesiId,
        deskripsi: `Input manual ${siswa.nama} → ${status} (${keterangan})`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/absensi/manual?sesi=${sesiId}`);
  return { sukses: `${siswa.nama} tersimpan sebagai ${status}.` };
}

// ============ Pengajuan izin / sakit (Siswa) ============
export type IzinState = { error?: string; sukses?: string };

const skemaIzin = z.object({
  jenis: z.enum(["izin", "sakit"]),
  tanggalMulai: z.string().min(10, "Tanggal mulai wajib diisi"),
  tanggalAkhir: z.string().min(10, "Tanggal akhir wajib diisi"),
  alasan: z.string().trim().min(5, "Alasan minimal 5 karakter"),
});

export async function ajukanIzin(
  _prev: IzinState,
  formData: FormData,
): Promise<IzinState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sesi tidak valid." };

  const siswa = await prisma.siswa.findUnique({ where: { userId: user.id } });
  if (!siswa) return { error: "Akun ini bukan akun siswa." };

  const parsed = skemaIzin.safeParse({
    jenis: String(formData.get("jenis") ?? "izin"),
    tanggalMulai: String(formData.get("tanggalMulai") ?? ""),
    tanggalAkhir: String(formData.get("tanggalAkhir") ?? ""),
    alasan: String(formData.get("alasan") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const d = parsed.data;
  const mulai = new Date(d.tanggalMulai);
  const akhir = new Date(d.tanggalAkhir);
  if (akhir < mulai) return { error: "Tanggal akhir tidak boleh sebelum tanggal mulai." };

  await prisma.pengajuanIzin.create({
    data: {
      siswaId: siswa.id,
      jenis: d.jenis,
      tanggalMulai: mulai,
      tanggalAkhir: akhir,
      alasan: d.alasan,
      status: "menunggu",
    },
  });

  revalidatePath("/dashboard/absensi");
  return { sukses: "Pengajuan Anda terkirim. Menunggu persetujuan Kesiswaan." };
}

// ============ Koreksi absensi (Guru ajukan → Kesiswaan setujui) ============
export type KoreksiState = { error?: string; sukses?: string };

export async function ajukanKoreksi(
  _prev: KoreksiState,
  formData: FormData,
): Promise<KoreksiState> {
  const user = await getSessionUser();
  if (!user || !punyaPermission(user, "absensi.koreksi")) {
    return { error: "Anda tidak memiliki hak mengajukan koreksi." };
  }

  const sesiId = String(formData.get("sesiId") ?? "");
  const siswaId = String(formData.get("siswaId") ?? "");
  const statusBaru = String(formData.get("statusBaru") ?? "");
  const alasan = String(formData.get("alasan") ?? "").trim();

  if (!["hadir", "izin", "sakit", "alpa", "terlambat"].includes(statusBaru)) {
    return { error: "Status tujuan tidak valid." };
  }
  if (alasan.length < 5) return { error: "Alasan koreksi minimal 5 karakter." };

  const sesi = await prisma.sesiAbsen.findUnique({ where: { id: sesiId } });
  if (!sesi) return { error: "Sesi tidak ditemukan." };
  if (user.role === "guru" && !(await sesiMilikGuru(user, sesi.guruId))) {
    return { error: "Anda tidak mengelola sesi ini." };
  }

  const siswa = await prisma.siswa.findFirst({ where: { id: siswaId, kelasId: sesi.kelasId } });
  if (!siswa) return { error: "Siswa tidak ditemukan di kelas sesi ini." };

  const sekarang = await prisma.absensi.findUnique({
    where: { sesiId_siswaId: { sesiId, siswaId } },
  });

  await prisma.$transaction([
    prisma.koreksiAbsensi.create({
      data: {
        absensiId: sekarang?.id ?? null,
        siswaId,
        sesiId,
        statusLama: sekarang?.status ?? null,
        statusBaru,
        alasan,
        diajukanOleh: user.id,
        status: "menunggu",
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        aksi: "create",
        entitas: "koreksi_absensi",
        entitasId: sesiId,
        deskripsi: `Pengajuan koreksi ${siswa.nama} → ${statusBaru}`,
      },
    }),
  ]);

  revalidatePath("/dashboard/absensi/koreksi");
  return { sukses: "Pengajuan koreksi terkirim ke Kesiswaan." };
}

export async function prosesKoreksi(
  _prev: KoreksiState,
  formData: FormData,
): Promise<KoreksiState> {
  const user = await getSessionUser();
  if (!user || !punyaPermission(user, "kesiswaan.manage")) {
    return { error: "Anda tidak memiliki hak memproses koreksi." };
  }

  const id = String(formData.get("id") ?? "");
  const keputusan = String(formData.get("keputusan") ?? "");
  if (!["disetujui", "ditolak"].includes(keputusan)) return { error: "Keputusan tidak valid." };

  const koreksi = await prisma.koreksiAbsensi.findUnique({
    where: { id },
    include: { siswa: { include: { user: true } } },
  });
  if (!koreksi) return { error: "Pengajuan tidak ditemukan." };
  if (koreksi.status !== "menunggu") return { error: "Pengajuan sudah diproses." };

  const ops: any[] = [
    prisma.koreksiAbsensi.update({
      where: { id },
      data: { status: keputusan, disetujuiOleh: user.id },
    }),
  ];

  if (keputusan === "disetujui") {
    ops.push(
      prisma.absensi.upsert({
        where: { sesiId_siswaId: { sesiId: koreksi.sesiId!, siswaId: koreksi.siswaId } },
        update: { status: koreksi.statusBaru, keterangan: `Koreksi: ${koreksi.alasan}` },
        create: {
          sesiId: koreksi.sesiId!,
          siswaId: koreksi.siswaId,
          status: koreksi.statusBaru,
          metode: "koreksi",
          keterangan: `Koreksi: ${koreksi.alasan}`,
        },
      }),
    );
  }

  ops.push(
    prisma.notifikasi.create({
      data: {
        userId: koreksi.siswa.userId,
        judul: keputusan === "disetujui" ? "Koreksi absensi disetujui" : "Koreksi absensi ditolak",
        pesan: `Koreksi absensi Anda menjadi “${koreksi.statusBaru}” telah ${keputusan === "disetujui" ? "disetujui" : "ditolak"} Kesiswaan.`,
        tipe: "absensi",
        tautan: "/dashboard/absensi",
      },
    }),
  );
  ops.push(
    prisma.auditLog.create({
      data: {
        userId: user.id,
        aksi: "approve",
        entitas: "koreksi_absensi",
        entitasId: id,
        deskripsi: `Koreksi ${koreksi.siswa.nama} → ${koreksi.statusBaru} (${keputusan})`,
      },
    }),
  );

  await prisma.$transaction(ops);

  revalidatePath("/dashboard/absensi/koreksi");
  return { sukses: "Koreksi berhasil diproses." };
}
