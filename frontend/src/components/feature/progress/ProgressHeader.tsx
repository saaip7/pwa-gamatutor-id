import React from "react";
import { BarChart3, Trophy, Brain, BookOpen, MessageSquareText, Zap, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { HelpButton, HelpItem } from "@/components/shared/HelpDrawer";

export function ProgressHeader() {
  return (
    <PageHeader
      title="Progress"
      subtitle="Pantau perjalanan belajarmu"
      rightAction={
        <HelpButton title="Panduan Progress">
          <div className="divide-y divide-neutral-100">
            <div className="pb-1">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Ringkasan</h3>
              <HelpItem
                icon={<BarChart3 className="w-4 h-4" />}
                title="Insight Belajar"
                description="Menampilkan waktu dan hari paling produktifmu dalam 30 hari terakhir. Gunakan insight ini untuk jadwalkan belajar di waktu terbaik."
              />
              <HelpItem
                icon={<Trophy className="w-4 h-4" />}
                title="Pencapaian & Rekor"
                description="Lihat jumlah badge yang sudah terbuka dan rekor pribadi (streak terpanjang). Tekan untuk melihat detail semua achievement di halaman Mastery."
              />
            </div>
            <div className="pt-1">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Analisis</h3>
              <HelpItem
                icon={<TrendingUp className="w-4 h-4" />}
                title="Tren Penguasaan"
                description="Grafik keyakinan diri dan peningkatan belajar per mata kuliah. Garis biru menunjukkan tingkat keyakinan (1-5), garis hijau menunjukkan peningkatan nilai."
              />
              <HelpItem
                icon={<Brain className="w-4 h-4" />}
                title="Strategi Belajar"
                description="Peringkat strategi belajar berdasarkan efektivitas. Tekan 'Lihat detail' untuk analisis lengkap — termasuk rekomendasi strategi terbaik untukmu."
              />
              <HelpItem
                icon={<MessageSquareText className="w-4 h-4" />}
                title="Catatan Refleksi"
                description="Ringkasan refleksi belajar dari tugas-tugas yang sudah selesai. Bisa dilihat semua di halaman Catatan Refleksi."
              />
            </div>
            <div className="pt-1">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tips</h3>
              <HelpItem
                icon={<Zap className="w-4 h-4" />}
                title="Data Akan Bertambah"
                description="Semakin sering kamu menyelesaikan tugas dan mengisi refleksi, semakin akurat insight dan rekomendasi yang ditampilkan."
              />
              <HelpItem
                icon={<BookOpen className="w-4 h-4" />}
                title="Distribusi Tugas"
                description="Diagram donat menunjukkan sebaran tugas di setiap tahap — Planning, Monitoring, Reflection, dan Done."
              />
            </div>
          </div>
        </HelpButton>
      }
    />
  );
}
