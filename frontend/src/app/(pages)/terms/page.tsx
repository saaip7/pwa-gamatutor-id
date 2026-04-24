"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Users, Target, AlertTriangle, ClipboardList, GraduationCap } from "lucide-react";

const SECTIONS = [
  {
    icon: FileText,
    title: "Ketentuan Umum",
    items: [
      "Gamatutor-ID adalah aplikasi yang dikembangkan oleh Kelompok Penelitian Intelligent Tutoring System (ITS) untuk keperluan penelitian tentang Self-Regulated Learning (SRL).",
      "Dengan mendaftar dan menggunakan aplikasi ini, kamu menyetujui untuk berpartisipasi sebagai partisipan penelitian.",
      "Penggunaan aplikasi ini sepenuhnya gratis dan tidak memungut biaya apa pun.",
      "Aplikasi ini bukan produk komersial dan dapat mengalami perubahan atau pembaruan sewaktu-waktu sesuai kebutuhan penelitian.",
    ],
  },
  {
    icon: Users,
    title: "Persyaratan Pengguna",
    items: [
      "Pengguna wajib memberikan data yang akurat saat proses registrasi (nama dan email yang valid).",
      "Satu akun hanya boleh digunakan oleh satu orang. Penggunaan akun secara bersama tidak diperkenankan.",
      "Pengguna bertanggung jawab atas keamanan akun masing-masing dan tidak diperkenankan membagikan kredensial login.",
    ],
  },
  {
    icon: Target,
    title: "Tujuan Penggunaan",
    items: [
      "Aplikasi ini dirancang untuk membantu mahasiswa mengelola tugas dan aktivitas belajar melalui Kanban Board.",
      "Fitur yang tersedia (board, focus mode, refleksi, badges, karakter) ditujukan untuk mendukung proses Self-Regulated Learning.",
      "Pengguna diharapkan menggunakan aplikasi secara aktif sesuai aktivitas belajar yang sebenarnya.",
      "Data yang dihasilkan dari penggunaan aplikasi akan menjadi bahan analisis penelitian.",
    ],
  },
  {
    icon: ClipboardList,
    title: "Instrumen Penelitian",
    items: [
      "Selama penelitian berlangsung, kamu akan diminta untuk mengisi kuesioner terkait motivasi dan pengalaman belajar.",
      "Pengisian kuesioner menjadi bagian dari proses penelitian dan hasilnya sangat berarti untuk kelengkapan data.",
      "Jawaban kuesioner diperlakukan secara rahasia dan hanya digunakan untuk keperluan analisis akademis.",
      "Jadwal pengisian kuesioner akan diinformasikan melalui notifikasi di aplikasi.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Batasan & Tanggung Jawab",
    items: [
      "Aplikasi disediakan \"sebagaimana adanya\" tanpa jaminan ketersediaan layanan secara terus-menerus.",
      "Peneliti tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan aplikasi, termasuk kehilangan data aktivitas belajar.",
      "Peneliti berhak melakukan pemeliharaan, pembaruan, atau penghentian layanan dengan pemberitahuan melalui aplikasi.",
      "Kamu disarankan untuk tidak menyimpan data penting yang tidak terkait dengan penelitian di dalam aplikasi ini.",
    ],
  },
  {
    icon: GraduationCap,
    title: "Hak Pengguna",
    items: [
      "Penggunaan aplikasi ini bersifat sukarela. Kamu berhak berhenti menggunakan aplikasi kapan saja tanpa ada paksaan.",
      "Pengguna berhak untuk mengakses data pribadi yang tersimpan di aplikasi dan meminta penghapusan data tersebut.",
      "Keputusan untuk tidak menggunakan atau berhenti menggunakan aplikasi ini tidak akan mempengaruhi nilai akademik atau status pengguna di institusi pendidikan.",
      "Pengguna dapat menghubungi peneliti untuk pertanyaan atau informasi lebih lanjut terkait penelitian ini.",
    ],
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-100 z-10">
        <div className="max-w-md lg:max-w-4xl mx-auto w-full px-5 lg:px-0">
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-800 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors border border-neutral-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-bold text-neutral-900">Syarat & Ketentuan</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto w-full lg:max-w-4xl px-5 lg:px-0">
        <div className="py-6 lg:py-10 space-y-6 lg:space-y-10 pb-[60px] lg:pb-10">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base lg:text-xl font-bold text-neutral-900">Gamatutor-ID</h2>
              <p className="text-[13px] lg:text-sm text-neutral-500 leading-relaxed mt-1 max-w-2xl">
                Dokumen ini berisi syarat dan ketentuan penggunaan aplikasi Gamatutor-ID yang dikembangkan oleh Kelompok Penelitian Intelligent Tutoring System (ITS). Dengan menggunakan aplikasi ini, kamu dianggap telah membaca dan menyetujui seluruh ketentuan yang berlaku.
              </p>
            </div>
          </div>

          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title}>
                <div className="flex items-center gap-3 mb-3 lg:mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm lg:text-lg font-bold text-neutral-800">{section.title}</h3>
                </div>
                <ul className="space-y-2 lg:space-y-3 pl-11 lg:pl-14">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-[13px] lg:text-sm text-neutral-600 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <p className="text-center text-[11px] text-neutral-300 pt-4">
            Dokumen ini berlaku sejak April 2026 dan dapat diperbarui sesuai kebutuhan penelitian.
          </p>
        </div>
      </div>
    </div>
  );
}
