# Panduan Arsitektur & Pengembangan Backend Gamatutor v2

Dokumen ini adalah panduan komprehensif untuk mengembangkan Backend Gamatutor ID. Kita melakukan **migrasi dan refactoring total** dari *codebase* milik kating (versi sebelumnya) menjadi arsitektur yang lebih modern, *scalable*, dan mudah di-*maintain*.

## 1. Perubahan Paradigma Arsitektur

### Dari MVC (Legacy Kating) ❌
*Codebase* kating menggunakan pola MVC (Model-View-Controller) klasik yang dikelompokkan berdasarkan **jenis file**.
```text
/backend (Legacy)
├── /controllers  (Semua logic campur aduk: auth, board, course)
├── /models       (Semua skema DB)
├── /routes       (Semua definisi API endpoint)
└── app.py
```
**Kelemahan:** Saat fitur bertambah banyak (kita punya 26 fitur baru), mencari bug di `board_controller.py` yang isinya ribuan baris akan sangat menyiksa.

### Menjadi Feature-Based Modular (Gamatutor v2) ✅
Kita menggunakan pendekatan **Categorical by Function**. Semua kode yang berkaitan dengan satu fitur akan berada di dalam satu folder yang sama.

```text
/backend (V2)
├── /features
│   ├── /auth           # Login, Register, JWT, Profile
│   │   ├── __init__.py
│   │   ├── auth_routes.py     # Hanya mendefinisikan endpoint (Blueprints)
│   │   ├── auth_controller.py # Validasi request/response
│   │   ├── auth_service.py    # Business logic (perhitungan JWT, dll)
│   │   └── auth_model.py      # Definisi schema MongoDB & helper query
│   │
│   ├── /kanban         # Task Card, Columns, Swipe Logic
│   ├── /goals          # Hierarchy (General -> Course -> Task)
│   ├── /gamification   # Badges, Streaks, Experience
│   ├── /reflection     # Emoji sliders, Strategy effectiveness
│   └── /analytics      # Perhitungan progress untuk dashboard
│
├── /core               # Logic inti yang dipakai semua fitur
│   ├── database.py     # Koneksi PyMongo
│   ├── config.py       # Environment variables
│   └── middlewares.py  # Custom decorators (auth_required, dll)
│
├── app.py              # Entry point (Register semua Blueprint)
└── requirements.txt
```

## 2. Standar Penulisan per Layer

Dalam setiap folder fitur (misal: `/features/kanban/`), alur datanya HARUS searah:
**Route -> Controller -> Service -> Model -> Database**

1. **`_routes.py`**: Ujung tombak API. Tugasnya HANYA menerima request HTTP (GET, POST), mengecek otorisasi JWT, dan melempar data ke Controller. Menggunakan Flask Blueprint.
2. **`_controller.py`**: Tukang sortir. Memvalidasi input dari user (apakah email valid? apakah judul task kosong?). Jika valid, panggil Service. Jika tidak, kembalikan Error 400.
3. **`_service.py`**: **OTAK APLIKASI**. Semua *business logic* ada di sini. (Contoh: Menghitung apakah task ini pantas dapat badge? Mengubah status task dari Todo ke Done).
4. **`_model.py`**: Berkomunikasi langsung dengan `core/database.py`. Berisi fungsi-fungsi spesifik MongoDB seperti `db.tasks.find_one()`, `db.tasks.insert_one()`. JANGAN taruh *business logic* di sini.

## 3. Strategi Migrasi dari Kode Kating

Jangan menulis ulang dari nol jika logika kating masih valid. Kita akan melakukan **Copy, Refactor, and Enhance**.

**Contoh Migrasi Fitur Auth:**
1. Buka `docs/backend-ref/routes/auth_routes.py` (milik kating).
2. Copy endpoint `/login` dan `/register` ke `features/auth/auth_routes.py` kita.
3. Lihat fungsi yang dipanggil di `auth_controller.py` milik kating. Copy fungsi tersebut.
4. **Pecah fungsinya!** Bagian validasi taruh di `auth_controller.py` v2, sedangkan logika *hashing password* dan *generate JWT* taruh di `auth_service.py` v2.
5. Perbarui koneksi database-nya mengikuti skema model v2.

## 4. Evolusi Skema Database (MongoDB)

Aplikasi kating berfokus pada Kanban standar. Aplikasi kita berfokus pada **Self-Determination Theory (SDT)**. Kita harus menyesuaikan struktur datanya. Merujuk pada `database-schema.md`:

- **Users**: Tambahkan field untuk tracking *Forgiving Streak*, *Total Focus Time*, dan referensi ke *Equipped Badges*.
- **Tasks (Dirombak Total)**: 
  - Harus memiliki *Foreign Key* ke `Course` dan `Goal`.
  - Harus mendukung *Subtasks* di dalam dokumen task itu sendiri (nested array).
  - Tambahkan field *Reflection* (emoji slider) yang wajib diisi saat task selesai.
- **Goals (Koleksi Baru)**: Hierarki tujuan (Main Goal -> Course Goal -> Task). Ini tidak ada di kode kating.

## 5. Rencana Pengembangan (Step-by-Step)

Gunakan urutan ini saat *coding* di VPS nanti agar sistematis:

- [ ] **Fase 1: Core Setup** 
  - Inisialisasi `app.py`, koneksi MongoDB URI di `core/database.py`, dan setup Flask-JWT-Extended.
  - *Goal: Endpoint `GET /health` berjalan.*
- [ ] **Fase 2: Auth Module** 
  - Migrasi sistem Login/Register kating ke arsitektur *Feature-based* kita.
  - *Goal: Bisa generate JWT Token via Postman/cURL.*
- [ ] **Fase 3: Goals Module** 
  - Membuat CRUD untuk Hierarki Tujuan (Main Goal & Course Goal). Ini krusial karena Task tidak bisa dibuat tanpa Goal.
- [ ] **Fase 4: Kanban & Tasks Module** 
  - Mengubah struktur board kating. Implementasi drag/drop state dan subtask array.
- [ ] **Fase 5: Reflection Module (SDT Core)** 
  - API untuk menyimpan hasil refleksi (slider emoji) setelah task diubah statusnya menjadi Done.
- [ ] **Fase 6: Gamification Module (SDT Core)** 
  - Engine kalkulasi *Forgiving Streaks* dan pemberian Badges tanpa leaderboard.

## Catatan Khusus untuk AI (Gemini)
Saat user meminta untuk "Kerjakan fitur X di backend":
1. Buka folder `docs/backend-ref/` untuk melihat apakah kating punya *logic* dasar yang bisa di-reuse.
2. Buat/buka folder di `src/features/[nama_fitur]/`.
3. Terapkan pemisahan logika Route -> Controller -> Service -> Model secara ketat. Jangan mencampur query database di dalam file Route!