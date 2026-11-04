import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SIMS — SMK YP 79 Majalaya",
    template: "%s | SIMS SMK YP 79 Majalaya",
  },
  description:
    "Sistem Informasi Manajemen Sekolah Terintegrasi SMK YP 79 Majalaya: akademik, absensi QR Code, CBT, tata usaha, keuangan, dan rapor digital.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
