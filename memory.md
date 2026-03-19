# Gamatutor Development Memory Ledger

*This file tracks the exact state of the project, recent decisions, and the immediate context from the last session. Read this before starting any new task.*

## Current Project State (As of Last Session)
Kita telah menyelesaikan 7 halaman utama dan memperbaiki sistem deployment di VPS.

### Recent Progress:
1. **New Task Page (`/task/new`)**
   - Implementasi form kompleks dengan state management untuk: Mata Kuliah, Nama Tugas, Strategi Belajar, Prioritas, dan Opsi Lanjutan.
   - Menggunakan komponen UI baru `Drawer.tsx` (Bottom Sheet) untuk pemilihan tanggal dan jam.
   - Validasi tombol "Simpan" (aktif jika field wajib terisi).
   - Penyesuaian warna chip rekomendasi menjadi abu-abu netral.
2. **Infrastructure & Deployment**
   - Berhasil deploy ke `https://skripsi.saaip.dev/` menggunakan Nginx + PM2.
   - Memperbaiki error 502 dengan menyelaraskan konfigurasi Nginx (membuang header WebSocket yang bentrok dengan mode production).
   - Memperbaiki build error Next.js 16 dengan menambahkan flag `--webpack` pada script build karena Serwist belum mendukung penuh Turbopack untuk injeksi Service Worker.
   - Fix TypeScript error pada `sw.ts` dengan menambahkan `webworker` lib di `tsconfig.json`.

### Completed Screens & Components:
- Login, Onboarding (3 steps), Dashboard, Board, Goals, Progress, Account, New Task.
- Reusable UI: `Button`, `Input`, `PasswordInput`, `TaskCard`, `BoardTaskCard`, `Drawer`, `BottomNavigation`.

## Technical Debt & Active Constraints
- **Date/Time Picker**: Saat ini masih berupa list statis di dalam Drawer. Perlu di-upgrade menjadi kalender/picker yang fleksibel.
- **Tailwind v4**: Gunakan `@utility` untuk custom classes di `globals.css`.
- **Isolated Context**: Project PWA ini memiliki `GEMINI.md`, `soul.md`, dan `memory.md` mandiri untuk pengerjaan via VPS/Mobile.

## Immediate Next Steps (To-Do)
- Upgrade **Date & Time Picker** di halaman New Task agar lebih profesional (Kalender & Jam fleksibel).
- Melanjutkan slicing: **Task Detail** atau **Customize Character/Wardrobe**.
- Inisiasi integrasi API Backend (Fase 1: Auth & Health Check).
