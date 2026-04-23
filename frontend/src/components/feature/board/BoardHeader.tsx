import React from "react";
import { Bell, GripVertical, MousePointerClick, PencilLine, MessageSquareText, CheckCircle2, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { HelpButton, HelpItem } from "@/components/shared/HelpDrawer";

interface BoardHeaderProps {
  userName: string;
  activeTasksCount: number;
  hasUnreadNotifications?: boolean;
}

export function BoardHeader({ userName, activeTasksCount, hasUnreadNotifications = false }: BoardHeaderProps) {
  return (
    <PageHeader
      title="Board"
      subtitle={`${activeTasksCount} Tugas Aktif`}
      rightAction={
        <>
          <HelpButton title="Panduan Board">
            <div className="divide-y divide-neutral-100">
              <div className="pb-1">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Mengelola Tugas</h3>
                <HelpItem
                  icon={<PencilLine className="w-4 h-4" />}
                  title="Buat Tugas Baru"
                  description="Tekan tombol + di bawah untuk menambahkan tugas. Isi nama tugas, pilih strategi belajar, dan atur deadline jika diperlukan."
                />
                <HelpItem
                  icon={<GripVertical className="w-4 h-4" />}
                  title="Pindahkan dengan Drag & Drop"
                  description="Seret kartu tugas antar kolom untuk mengubah status — dari Planning ke Monitoring, lalu ke Reflection, dan Done."
                />
                <HelpItem
                  icon={<MousePointerClick className="w-4 h-4" />}
                  title="Pindahkan dengan Tombol"
                  description="Buka detail tugas, lalu tekan tombol panah di bawah kolom status untuk memindahkan tanpa drag & drop."
                />
              </div>
              <div className="pt-1">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Stages Belajar</h3>
                <HelpItem
                  icon={<Clock className="w-4 h-4" />}
                  title="Planning"
                  description="Tahap persiapan — tulis rencana belajar dan atur strategi yang tepat untuk tugas ini."
                />
                <HelpItem
                  icon={<Sparkles className="w-4 h-4" />}
                  title="Monitoring"
                  description="Tahap pelaksanaan — mulai sesi belajar dan pantau fokusmu secara real-time."
                />
                <HelpItem
                  icon={<MessageSquareText className="w-4 h-4" />}
                  title="Reflection"
                  description="Tahap evaluasi — isi refleksi belajar setelah selesai. Bagian penting untuk melihat progresmu."
                />
                <HelpItem
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  title="Done"
                  description="Tugas selesai! Kartu akan otomatis terarsip setelah dipindahkan ke sini."
                />
              </div>
              <div className="pt-1">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Tips</h3>
                <HelpItem
                  icon={<Sparkles className="w-4 h-4" />}
                  title="Strategi yang Disarankan"
                  description="Jika ada rekomendasi strategi berdasarkan datamu, akan muncul badge ungu di pemilih strategi."
                />
                <HelpItem
                  icon={<Clock className="w-4 h-4" />}
                  title="Deadline"
                  description="Kamu akan mendapat pengingat 24 jam sebelum deadline. Atau biarkan tanpa deadline untuk belajar kapan saja."
                />
              </div>
            </div>
          </HelpButton>
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {hasUnreadNotifications && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error border-2 border-white"></span>
            )}
          </Link>
        </>
      }
    />
  );
}
