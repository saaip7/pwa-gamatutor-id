"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Lock, Database, Eye, Bell, Trash2, Server } from "lucide-react";

const SECTIONS = [
  {
    icon: Database,
    title: "Data yang Dikumpulkan",
    items: [
      "Data identitas: nama dan email yang kamu berikan saat registrasi.",
      "Data aktivitas belajar: tugas yang dibuat, progres kanban board, durasi sesi belajar, refleksi, strategi belajar yang dipilih, dan streak harian.",
      "Data preferensi: pengaturan notifikasi, karakter yang digunakan, dan preferensi tampilan.",
    ],
  },
  {
    icon: Eye,
    title: "Penggunaan Data",
    items: [
      "Seluruh data yang dikumpulkan digunakan secara eksklusif untuk kepentingan penelitian akademis oleh Kelompok Penelitian Intelligent Tutoring System (ITS) tentang Self-Regulated Learning (SRL) pada mahasiswa.",
      "Data aktivitas belajar dianalisis untuk memahami pola penggunaan, tingkat keterlibatan, dan efektivitas fitur aplikasi dalam mendukung regulasi diri mahasiswa dalam belajar.",
      "Hasil penelitian dilaporkan dalam bentuk agregat — data individu tidak akan dipublikasikan atau dibagikan kepada pihak ketiga dalam bentuk apa pun.",
      "Data tidak digunakan untuk keperluan komersial, periklanan, maupun penjualan kepada pihak mana pun.",
    ],
  },
  {
    icon: Lock,
    title: "Keamanan Data",
    items: [
      "Data disimpan di MongoDB Atlas dengan standar enkripsi at-rest. Seluruh komunikasi data menggunakan protokol HTTPS/TLS.",
      "Autentikasi pengguna menggunakan token JWT dengan masa berlaku terbatas (24 jam) dan disimpan secara lokal di perangkat.",
      "Server backend berjalan di lingkungan terisolasi dengan akses dibatasi hanya untuk peneliti yang bertanggung jawab.",
      "Notifikasi push dikelola melalui Firebase Cloud Messaging — token perangkat disimpan secara aman dan tidak dibagikan.",
    ],
  },
  {
    icon: Bell,
    title: "Notifikasi",
    items: [
      "Notifikasi push dikirim berdasarkan preferensi yang kamu atur, seperti pengingat deadline, reminder belajar, dan streak nudge.",
      "Kamu dapat mematikan notifikasi kapan saja melalui halaman Pengaturan > Notifikasi di aplikasi.",
      "Notifikasi hanya berisi informasi terkait aktivitas belajar dan tidak mengandung konten promosi atau iklan.",
    ],
  },
  {
    icon: Trash2,
    title: "Penghapusan Data",
    items: [
      "Kamu dapat meminta penghapusan seluruh data pribadimu dengan menghubungi peneliti melalui kontak yang tersedia.",
      "Permintaan penghapusan akan diproses dalam waktu maksimal 14 hari kerja dan data yang telah dihapus tidak dapat dikembalikan.",
      "Setelah penelitian selesai, seluruh data pribadi akan dianonimkan atau dihapus sesuai ketentuan etika penelitian yang berlaku.",
    ],
  },
  {
    icon: Server,
    title: "Penyimpanan & Akses",
    items: [
      "Data disimpan di server cloud (MongoDB Atlas) dengan standar keamanan internasional.",
      "Akses ke database dibatasi hanya untuk peneliti yang bertanggung jawab atas penelitian ini.",
      "Tidak ada pihak ketiga yang memiliki akses langsung ke data mentah pengguna.",
    ],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800 relative">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-100 z-10">
          <div className="flex items-center gap-3 px-5 py-4">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-800 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors border border-neutral-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-bold text-neutral-900">Kebijakan Privasi</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-6 pb-[60px]">
          {/* Intro */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeInUp}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-neutral-100 p-4"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-neutral-800">Gamatutor-ID</span>
            </div>
            <p className="text-[13px] text-neutral-500 leading-relaxed">
              Gamatutor-ID adalah aplikasi yang dikembangkan oleh Kelompok Penelitian Intelligent Tutoring System (ITS) dalam rangka penelitian tentang Self-Regulated Learning (SRL) pada mahasiswa. Dokumen ini menjelaskan bagaimana data kamu dikumpulkan, digunakan, dan dilindungi.
            </p>
          </motion.div>

          {/* Sections */}
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial="hidden"
                animate="show"
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-50">
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-bold text-neutral-800">{section.title}</h2>
                </div>
                <ul className="px-4 py-3 space-y-2.5">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-[13px] text-neutral-600 leading-relaxed flex gap-2">
                      <span className="text-neutral-300 mt-1.5 shrink-0">&#8226;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}

          {/* Footer */}
          <p className="text-center text-[11px] text-neutral-300 pt-2">
            Dokumen ini berlaku sejak April 2026 dan dapat diperbarui sesuai kebutuhan penelitian.
          </p>
        </div>
      </div>
    </div>
  );
}
