# Gamatutor ID (PWA Development Context)

**PENTING:** Codebase ini adalah sub-direktori dari project skripsi yang lebih besar. File ini berfungsi sebagai jangkar konteks agar AI agent memahami tujuan, arsitektur, dan batasan project ketika berjalan secara terisolasi (misal: di VPS).

## 1. Project Identity
- **Goal:** Membangun aplikasi PWA *Self-Regulated Learning* (SRL) bergaya Kanban untuk mahasiswa, bertujuan meningkatkan *engagement* dari 20% menjadi >50%.
- **Framework Teori:** Self-Determination Theory (SDT) & Meaningful Gamification (Fokus pada Autonomy, Competence, Relatedness tanpa PBL/Leaderboard yang toxic).
- **Metaphor:** "Learning Journey" & "Forgiving Streaks".

## 2. Tech Stack & Architecture
**Frontend (`/frontend`)**
- Next.js 15 (App Router)
- React 19 (TypeScript)
- Styling: Tailwind CSS v4 (menggunakan `@theme inline` dan CSS Variables di `globals.css`).
- State: Local State & Zustand (nantinya).
- PWA: Serwist (pengganti next-pwa).
- Animasi: Framer Motion.

**Backend (`/backend`)**
- Flask 3.x (Python)
- Database: MongoDB Atlas (PyMongo)
- Auth: Flask-JWT-Extended
- Arsitektur: **Feature-based/Categorical Modular** (contoh: `features/auth/`, `features/kanban/`).

## 3. UI/UX Conventions (Strict Rules)
1. **Mobile-First:** Semua page layout dibungkus dalam kontainer `<div className="max-w-md mx-auto w-full min-h-full relative">`.
2. **Design Tokens:** WAJIB menggunakan variabel CSS yang sudah didefinisikan di `globals.css` (misal: `text-primary`, `bg-neutral-50`, `text-error`). JANGAN gunakan hardcoded HEX.
3. **Scrollbar:** Gunakan *utility* class `no-scrollbar` untuk elemen yang bisa di-scroll tapi scrollbarnya ingin disembunyikan.
4. **Kanban Colors:**
   - Planning: `--color-planning` (Light Blue)
   - Monitoring: `--color-monitoring` (Vibrant Blue/Purple)
   - Controlling: `--color-controlling` (Amber)
   - Reflection: `--color-reflection` (Emerald)

## 4. Current Progress & Reference
Saat ini kita sudah menyelesaikan *slicing* 5 halaman utama: Login, Onboarding, Dashboard, Board, Goals, Progress, dan Account.

*Untuk melihat requirement spesifik 26 fitur dan skema database, lihat folder `docs/` di dalam root project ini.*