import React from "react";
import { PencilLine, BookOpen, Target, Zap, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { HelpButton, HelpItem } from "@/components/shared/HelpDrawer";

export function GoalsHeader() {
  return (
    <PageHeader
      title="Goals"
      subtitle="Pantau progres menuju target belajarmu"
      rightAction={
        <HelpButton title="Panduan Goals">
          <div className="divide-y divide-neutral-100">
            <div className="pb-1">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tujuan Utama</h3>
              <HelpItem
                icon={<Target className="w-4 h-4" />}
                title="Edit Target Utama"
                description="Tekan ikon pensil di kartu Tujuan Utama untuk mengubah tujuan belajarmu. Bagian awal dan target utama bisa disesuaikan kapan saja."
              />
              <HelpItem
                icon={<Zap className="w-4 h-4" />}
                title="Langkah Selanjutnya"
                description="Kartu rekomendasi otomatis menyarankan langkah terbaik berdasar progresmu — mulai tugas pertama, lanjutkan mata kuliah, atau kembali ke board."
              />
            </div>
            <div className="pt-1">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Progres Mata Kuliah</h3>
              <HelpItem
                icon={<BookOpen className="w-4 h-4" />}
                title="Progres Per Mata Kuliah"
                description="Setiap mata kuliah menampilkan jumlah tugas yang selesai dari total tugas. Progres akan terupdate otomatis saat kamu menyelesaikan tugas di board."
              />

            </div>
            <div className="pt-1">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tips</h3>
              <HelpItem
                icon={<PencilLine className="w-4 h-4" />}
                title="Tujuan Per Tugas"
                description="Selain tujuan utama, kamu juga bisa menambahkan alasan personal di setiap tugas — kenapa tugas ini penting untukmu."
              />
            </div>
          </div>
        </HelpButton>
      }
    />
  );
}
