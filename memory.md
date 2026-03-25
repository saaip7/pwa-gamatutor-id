# Gamatutor Development Memory Ledger

*This file tracks the exact state of the project, recent decisions, and the immediate context from the last session. Read this before starting any new task.*

## Current Project State (As of March 25, 2026)
Kita telah menyelesaikan seluruh alur utama aplikasi (Core Loop) dari pembuatan tugas, pelaksanaan (Focus Mode), hingga refleksi diri, serta fitur kustomisasi karakter.

### Recent Progress:
1. **Focus Mode & Reflection Cycle (Core Loop)**
   - **Focus Mode (`/task/[id]/focus`):** Implementasi zona kerja mendalam dengan live count-up timer, progres ring SVG, tips strategi, dan fitur "Parkir Pikiran" untuk distraksi.
   - **Guided Reflection (`/task/[id]/reflection`):** Fitur evaluasi diri pasca-belajar menggunakan interactive emoji rating (efektivitas & keyakinan) dan penyelarasan tujuan.
   - **Celebration Dialog:** Implementasi pop-up apresiasi premium dengan sistem konfeti yang dioptimalkan untuk mobile (GPU-accelerated transforms) agar tetap lancar di HP.

2. **Mastery & Gamification**
   - **Mastery Gallery (`/mastery`):** Implementasi galeri badge milestone dengan 4 bentuk SVG kustom (Diamond, Hexagon, Circle, Shield) dan animasi *staggered fade-up*.
   - **Achievement Banner:** Standarisasi kartu pencapaian sebagai entry point konsisten di Dashboard dan Progress Page.
   - **Mastery Wardrobe (`/account/wardrobe`):** Fitur kustomisasi karakter dengan *Live Preview* warna pakaian secara real-time.

3. **Task Management Improvements**
   - **Edit Task (`/task/[id]/edit`):** Implementasi halaman edit dengan data terisi otomatis (*pre-filled*) dan komponen `TaskStatusStepper` untuk melacak posisi di 4 pilar SRL.
   - **Dynamic Mock Data:** Detail dan Edit page kini cerdas, menampilkan data berbeda tergantung ID (misal: task-1 untuk Monitoring, task-2 untuk Planning) untuk keperluan testing navigasi.
   - **Interactive Pickers:** Upgrade pemilihan tanggal (Kalender interaktif) dan jam (native-styled picker) di seluruh form tugas.

4. **UI/UX & Routing Refinement**
   - **Notification Center:** Implementasi pusat notifikasi (`/notifications`) dan preferensi notifikasi (`/account/notifications`) dengan toggle fungsional dan Jadwal Hening.
   - **Routing Consolidation:** Merapikan struktur sub-halaman akun di bawah `/account/*` dan memastikan semua link (Header, Button, SettingItem) sinkron.
   - **Bug Fixes:** Perbaikan alignment ikon di `SettingItem`, masalah overflow pada layar kecil, dan optimasi performa animasi.

### Completed Screens & Components:
- **Screens:** Login, Onboarding, Dashboard, Board, Goals, Progress, Account, New Task, Edit Task, Task Detail, Focus Mode, Guided Reflection, Mastery Gallery, Wardrobe, Notification Center, Notification Preferences, Strategy Effectiveness.
- **Components:** `TaskStatusStepper`, `AchievementBanner`, `ConfettiSystem`, `CharacterAvatar`, `MasteryBadgeIcon`, `EmojiRating`, `StrategyInsightBanner`, `Calendar`, `TimePicker`.

## Technical Debt & Active Constraints
- **Animation Performance:** Selalu gunakan `x/y` (transforms) daripada `top/left` untuk animasi partikel agar tidak lag di perangkat mobile.
- **State Management:** Saat ini masih menggunakan Local State (`useState`). Perlu mulai dipertimbangkan penggunaan **Zustand** jika interaksi antar halaman (misal: update warna karakter secara global) semakin kompleks.
- **Form Abstraction:** Halaman New Task dan Edit Task memiliki banyak kemiripan. Potensi refactor menjadi satu komponen `TaskForm` untuk kemudahan maintenance di masa depan.

## Immediate Next Steps (To-Do)
- **Fase Integrasi Backend:** Inisiasi koneksi ke Flask API (Fase 1: Authentication & User Profile).
- **Global State:** Setup Zustand untuk menyimpan preferensi karakter dan status notifikasi agar persisten saat berpindah halaman.
- **Slicing Fitur Jeda:** Implementasi modal "Jeda & Sesuaikan" di dalam Focus Mode.
