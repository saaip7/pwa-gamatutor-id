# Gamatutor Development Memory Ledger

*This file tracks the exact state of the project, recent decisions, and the immediate context from the last session. Read this before starting any new task.*

## Current Project State (As of Last Session)
Kita baru saja menyelesaikan fase **"Initial Frontend Slicing"** untuk 6 halaman krusial berbasis desain SuperDesign. Seluruh UI saat ini menggunakan Mock Data (`// TODO: Fetch from API`).

### Completed Screens & Components:
1. **Login (`/login`)**
   - Menggunakan logo custom SVG (`logo-only.svg`).
   - Animasi ring dan floating elements menggunakan `framer-motion`.
2. **Onboarding (`/onboarding`)**
   - 3-step flow menggunakan `AnimatePresence` untuk transisi mulus tanpa ganti URL.
   - Menggunakan state management lokal yang tersentralisasi di `OnboardingFlow.tsx`.
3. **Dashboard / Home (`/dashboard`)**
   - Menerapkan `BottomNavigation` global via `src/app/(main)/layout.tsx`.
   - Modifikasi `TaskCard.tsx` untuk menampilkan *course metadata* dan *description*.
4. **Kanban Board (`/board`)**
   - Layout horizontal scrollable (`snap-x`).
   - Pembuatan komponen spesifik `BoardTaskCard.tsx`.
   - Warna kolom (Planning, Monitoring, Controlling, Reflection) telah diikat menggunakan **CSS Variables** di `globals.css` (Tailwind v4 `@theme inline`).
   - Penyesuaian visual untuk status "Medium" yang bentrok antara Priority (Solid Amber) dan Difficulty (Light Blue).
5. **Goals (`/goals`)**
   - Pembuatan `CourseGoalCard` yang sangat *reusable* dengan prop `theme` (blue, teal, purple).
   - Memperbaiki bug "Server to Client Component Serialization" dengan mengubah passing komponen Lucide Icon menjadi *string name* dinamis.
6. **Account / Settings (`/account`)**
   - Komponen `SettingItem.tsx` yang sangat dinamis (mendukung tipe *link*, *toggle*, dan *select*).
   - Implementasi **Custom Animated Accordion Dropdown** menggunakan Framer Motion untuk opsi pilihan bahasa, menggantikan elemen `<select>` bawaan browser agar UI terasa seperti aplikasi *native*.

## Technical Debt & Active Constraints
- **Tailwind v4**: Kita menggunakan Tailwind v4. Ingat bahwa mendaftarkan custom class utilitas menggunakan `@utility` (contoh: `@utility no-scrollbar { ... }` di `globals.css`).
- **Turbopack vs Serwist**: Service Worker (`sw.js` via `serwist`) dinonaktifkan di environment `development` agar tidak bentrok dengan Turbopack Next.js 15.
- **PWA Feel**: Semua halaman utama berada di dalam pembungkus `<div className="max-w-md mx-auto w-full min-h-full">` agar tampil proporsional layaknya aplikasi mobile meskipun dibuka di desktop.

## Immediate Next Steps (To-Do)
*Tunggu instruksi spesifik dari user, kemungkinan:*
- Melanjutkan slicing halaman fitur spesifik (contoh: Task Detail, Create Task, Wardrobe/Customize Character).
- Setup koneksi ke Backend / Integrasi API.
- Inisiasi global state management (misal: Zustand) jika data mulai kompleks.
