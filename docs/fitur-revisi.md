# Analisis & Rencana Fitur: Kanban Learning Board

## 1. Overview & Framework

**Tujuan Dokumen:** Mendokumentasikan fitur existing, gap yang teridentifikasi, dan rencana enhancement dengan justifikasi dari literature.

**Framework Penelitian:**
```
SDT (Pondasi Teori)
    │
    ▼
3 Research Gap → 3 Metode Solusi
    │
    ├─ Gap 1: Behavioral Triggers (fitur pasif)
    ├─ Gap 2: Meaningful Gamification (engagement 30%)
    └─ Gap 3: Enhanced Competence + OIT Integration (THE GOLDEN GAP)
    │
    ▼
WRAPPER: Learning Journey Metaphor
    │
    ▼
Enhanced Kanban Learning Board (PWA)
```

**Prinsip Utama:**
- Setiap fitur harus punya **justifikasi dari literature**
- Tidak menggunakan PBL tradisional (Points, Leaderboards, Levels)
- Fokus pada **Autonomous Motivation** (bukan Controlled Motivation)
- Balance antara **CET** (enjoyment) dan **OIT** (value internalization)

**The Golden Gap:**
```
┌─────────────────────────────────────────────────────────────┐
│  BUREAU et al. (2022) - Meta-analysis 144 studi            │
│  "Competence = PREDIKTOR TERKUAT motivasi (43% variansi)"   │
├─────────────────────────────────────────────────────────────┤
│  LI et al. (2024) - Meta-analysis 35 studi                 │
│  "Gamifikasi LEMAH di Competence (g=0.277)"                 │
├─────────────────────────────────────────────────────────────┤
│  GAP EMAS:                                                  │
│  "Gamifikasi lemah di area yang PALING penting!"           │
└─────────────────────────────────────────────────────────────┘
```

**OIT Orientation (Cross-Cutting):**

OIT (Organismic Integration Theory) features tidak exclusive to one SDT need. OIT adalah **orientation** untuk support SDT needs dengan fokus pada **value internalization**, bukan sekadar enjoyment.

- **Alberts et al. (2024) hal 1:** "Focus on membantu internalisasi nilai (OIT), NOT hanya membuat app enjoyable (CET)"
- OIT features di Gap 3 (Section 5.4): Explain Value, Guided Reflection, Goal Connection

**Evidence-Based Prioritization:**

Lüking et al. (2023) menemukan **Relatedness tidak signifikan di digital individual apps** - hanya Autonomy dan Competence yang significant.

**Strategy:**
- **Primary Focus:** Autonomy (100%) + Competence (90%) - evidence strong
- **Minimal Relatedness (30%):** Untuk theoretical completeness via dual-purpose features

**Dual-Purpose Framing:**
> "Berdasarkan Bureau et al. (2022), Competence memfasilitasi internalisasi. Fitur Goal Connection dan Reflection dirancang sebagai Enhanced Competence untuk membangun efficacy, agar mahasiswa menginternalisasi nilai belajar secara mandiri, tanpa bergantung pada dorongan sosial (Relatedness) yang terbukti kurang efektif di digital individual apps (Lüking et al., 2023)."

---

## 2. Baseline Assessment

### 2.1 Existing Features Overview

**Platform Kakak Tingkat (Azmi, 2024):** Web-based Kanban Board untuk Self-Regulated Learning

| **Kategori** | **Fitur** | **Status** | **SDT** | **Analisis Singkat** |
| --- | --- | --- | --- | --- |
| **Kanban Board** | 4 kolom SRL | ✅ | Competence | Konsep bagus, tidak ada visual feedback |
|  | Drag & drop cards | ✅ | Autonomy | Desktop OK, problematic di mobile |
|  | Add/Edit/Delete/Archive | ✅ | Autonomy | ✅ Tidak perlu perubahan |
| **Task Properties** | Title, description | ✅ | Autonomy | ✅ Tidak perlu perubahan |
|  | Difficulty, priority | ✅ | Competence | ✅ Self-assessment tools |
|  | Course selection (from list) | ✅ | ❌ | Kurang Autonomy - tergantung admin |
|  | Learning strategy | ✅ | Autonomy | Bisa enhance dengan effectiveness feedback |
|  | Checklists (sub-tasks) | ✅ | Competence | Perlu immediate feedback saat complete |
|  | Links | ✅ | Autonomy | Jarang dipake |
| **Assessment** | Pre-test grade input | ✅ | Competence | Data ada, tapi cuman ditampilin doang |
|  | Post-test grade input | ✅ | Competence | Improvement tidak ditampilkan |
|  | Star rating (1-5) | ✅ | ❓ | Purpose tidak jelas - perlu evaluasi |
|  | Notes (free-form) | ✅ | ❓ | Tidak guided - tidak efektif untuk metacognition |
| **Timer** | Start/stop session | ✅ | Competence | Fungsional, tidak ada context feedback |
|  | Total study time | ✅ | Competence | Angka ada, tidak ada comparison |
|  | Session history | ✅ | Competence | History ada, tidak ada insights |
| **Analytics** | Progress summary | ✅ | Competence | Basic, tidak ada trend |
|  | Task distribution | ✅ | Competence | ✅ Cukup informatif |
|  | Course performance | ✅ | Competence | Ada, tidak ada trend over time |
| **Auth & Admin** | JWT, user management | ✅ | - | Technical, tidak direct ke SDT |

### 2.2 SDT Coverage Assessment

**Baseline Coverage:**
```
AUTONOMY     [████████░░] 80%  ← Sudah cukup baik
COMPETENCE   [████░░░░░░] 40%  ← Data ada, feedback lemah (GOLDEN GAP!)
RELATEDNESS  [░░░░░░░░░░]  0%  ← Tidak ada fitur sosial
```

**Analisis:**
- ✅ **Autonomy (80%):** User punya kontrol untuk create, edit, delete, customize workflow
- ⚠️ **Competence (40%):** Data tersimpan (pre/post grade, timer, session history) TAPI feedback minimal - user tidak melihat progress/improvement
- ❌ **Relatedness (0%):** Tidak ada fitur sosial atau goal connection

**Evidence-Based Prioritization:**
- **Lüking et al. (2023):** Relatedness **tidak signifikan** di digital individual apps
- **Bureau et al. (2022):** Competence = strongest predictor (43% variance)
- **Decision:** Focus on Autonomy + Competence, minimal Relatedness untuk completeness

**Target setelah enhancement:**
- Autonomy: **100%** (+ free input, customization)
- Competence: **90%** (+ visualization, feedback, celebration, OIT integration)
- Relatedness: **30%** (+ dual-purpose features, subtle social element)

**Total Target:** 220/300 = **73% SDT coverage** (evidence-based prioritization)

---

## 3. Gap 1: Behavioral Triggers

### 3.1 Problem Statement

**Baseline:** Aplikasi bersifat **pasif** - tidak ada mekanisme untuk mengaktifkan user yang jarang membuka app.

**Data:** Dari pengujian awal tahun ini, hanya **~20% mahasiswa** yang aktif menggunakan kanban web app (dari activity logs).

**Root Cause:** Tidak ada trigger external untuk mengingatkan user - app menunggu user membuka sendiri.

### 3.2 Proposed Features

#### A. Push Notification

**Alberts et al. Mapping:** `Reminders from Digital Assistant`

**Deskripsi:** Notifikasi untuk mengingatkan user tentang deadline task, pending task, atau waktu belajar.

**Enhancement Rationale:**
- Baseline tidak punya mekanisme reminder → user lupa membuka app
- Push notification = behavioral trigger untuk re-engagement

**Implementation:**
```
┌─────────────────────────────────────────┐
│ 🔔 Kanban Learning                      │
│                                         │
│ 📚 Reminder: UTS Algoritma besok!       │
│                                         │
│ Task pending:                           │
│ • Review materi sorting                 │
│ • Latihan soal                          │
│                                         │
│ [Buka App]                              │
└─────────────────────────────────────────┘
```

**Evidence:**
- **Karaali et al. (2025):** "Push notification meningkatkan student engagement, terutama behavioral dan cognitive engagement"
- **SDT Link:** Trigger (bukan direct SDT need, tapi precondition untuk engagement)

**Warning dari Literature:**
> "Risk: notification overload dapat menyebabkan stress dan information overload" - Karaali et al. (2025)

**Mitigasi:** Max 2 notifikasi/hari, quiet hours setting

---

#### B. Smart Reminder

**Alberts et al. Mapping:** `Manual Reminders`

**Deskripsi:** Notifikasi yang dijadwalkan di waktu user biasa aktif (berdasarkan usage pattern).

**Enhancement Rationale:**
- Push notification standar = satu waktu untuk semua user
- Smart reminder = personalized timing → lebih efektif
- Contoh: User A biasa belajar jam 9 pagi, User B jam 8 malam → reminder berbeda

**Implementation:**
```javascript
// Simplified personalization logic
const productiveHour = MODE(user.completionTimes.map(t => t.hour))
// Kirim reminder 30 menit sebelum productive hour
const reminderTime = productiveHour - 0.5
```

**Evidence:**
- **Karaali et al. (2025):** "Notifikasi yang dijadwalkan (pagi dan sore) lebih efektif dari notifikasi random"
- **Plak et al. (2023):** "Siswa yang menerima nudge sesuai profil motivasinya menunjukkan engagement signifikan lebih tinggi"

**SDT Link:** Autonomy support (reminder di waktu yang user preferensi)

---

#### C. Notification Preferences

**Alberts et al. Mapping:** `Customisation`

**Deskripsi:** User dapat mengatur waktu, frekuensi, dan tipe notifikasi yang diterima.

**Enhancement Rationale:**
- Notifikasi tanpa kontrol user = potential annoyance → thwarting autonomy
- Dengan control = user merasa autonomous → supporting autonomy

**Implementation:**
```
┌─────────────────────────────────────────┐
│ ⚙️ Notification Settings                │
│                                         │
│ Enable Notifications                    │
│ [✓]                                     │
│                                         │
│ Types:                                  │
│ [✓] Task deadlines                      │
│ [✓] Study reminders                     │
│ [✓] Social presence updates             │
│ [ ] Weekly summary                      │
│                                         │
│ Timing:                                 │
│ Morning: [09:00]                        │
│ Evening: [20:00]                        │
│                                         │
│ Quiet Hours:                            │
│ [22:00] - [07:00]                       │
│                                         │
│ [Save Preferences]                      │
└─────────────────────────────────────────┘
```

**Evidence:**
- **Ryan & Deci (2020):** "Autonomy = rasa kontrol dan pilihan"
- **SDT Link:** Autonomy (user punya kontrol penuh)

---

#### D. Social Presence Notification ← **NEW! (Subtle Social Element)**

**Alberts et al. Mapping:** *Social Support / Peer Context* (implied)

**Deskripsi:** Notifikasi informational bahwa peers sedang belajar di waktu yang sama (subtle social presence).

**Enhancement Rationale:**
- Baseline: individual app tanpa social element → feeling isolated
- Social presence = subtle peer connection tanpa competitive element
- "You're not alone" feeling → minimal relatedness support

**Implementation:**
```
┌─────────────────────────────────────────┐
│ 🔔 Kanban Learning                      │
│                                         │
│ 📚 5 temanmu sedang belajar sekarang    │
│                                         │
│ Materi populer saat ini:                │
│ • Algoritma Sorting (3 orang)           │
│ • Basis Data Normalisasi (2 orang)      │
│                                         │
│ [Lihat Detail]        [Mulai Belajar]   │
└─────────────────────────────────────────┘
```

**Design Principles:**
- ✅ **Informational:** Descriptive norm (what peers are doing)
- ✅ **Non-competitive:** BUKAN ranking/leaderboard
- ✅ **Autonomy-supportive:** User tetap punya choice untuk ignore
- ✅ **Privacy:** Anonymized - tidak show nama, hanya count + materi

**Framing Examples:**
- ✅ GOOD: "5 temanmu sedang belajar sekarang" (informational)
- ❌ BAD: "Kamu tertinggal dari 10 teman!" (pressure/guilt)
- ✅ GOOD: "Materi populer: Algoritma Sorting" (descriptive)
- ❌ BAD: "Ranking: kamu posisi #15 dari 20" (competitive)

**Evidence:**
- **Cialdini (2009) Social Proof Theory:** Descriptive norms influence behavior
- **Plak et al. (2023):** Personalized nudges based on peer context meningkatkan engagement significantly
- **Ryan & Deci (2017):** Relatedness = feeling connected to something larger

**SDT Link:** **Relatedness** (social connection - minimal, non-competitive)

**Risk Mitigation:**
- BUKAN leaderboard (avoid Controlled Motivation - Gao 2024)
- BUKAN "kamu tertinggal" (avoid guilt/pressure)
- Informational only, no comparison to individual performance
- User bisa toggle off di notification preferences

**Privacy Implementation:**
```javascript
// Backend logic (anonymized)
const activeUsers = await getActiveUsersNow() // count only, no names
const popularTopics = await getTrendingTopics(timeWindow: '1hour')

// Notification payload
{
  type: 'social_presence',
  count: activeUsers.length,
  topics: popularTopics.slice(0, 3) // top 3 only
}
```

**Priority:** High (LOW complexity, HIGH impact untuk Relatedness minimal)

---

### 3.3 Gap 1 Summary

| Fitur | Alberts et al. | SDT Target | Evidence Strength |
|-------|----------------|------------|-------------------|
| Push Notification | *Reminders from Digital Assistant* | Trigger | ✅ Strong (Karaali 2025) |
| Smart Reminder | *Manual Reminders* | Trigger + Autonomy | ✅ Strong (Karaali 2025, Plak 2023) |
| Notification Preferences | *Customisation* | Autonomy | ✅ Strong (Ryan & Deci 2020) |
| **Social Presence Notification** | *Social Support (implied)* | **Relatedness** | ✅ Strong (Cialdini 2009, Plak 2023) |

**Implementasi Principle:** Max 2-3 notifikasi/hari, quiet hours, toggle per tipe → menghindari notification fatigue

---

## 4. Gap 2: Meaningful Gamification

### 4.1 Wrapper: Learning Journey Metaphor

**Problem:** Kanban metaphor (industrial/manufacturing) tidak inspiring untuk learning context.

**Solution:** Membungkus pengalaman app dalam **"Learning Journey"** metaphor.

| Aspek | Kanban (Old) | Learning Journey (New) |
|-------|--------------|------------------------|
| Metaphor | Industrial/manufacturing | Educational journey |
| Interaction | Drag & drop (desktop) | Swipe to progress (mobile) |
| Gamification | Add-on features | Integrated into core |
| Feedback | End of session | Immediate, every action |

**Design Principles:**
- **Visual:** Clean modern (bukan illustrated seperti Duolingo)
- **Navigation:** Swipe-based (mobile-first)
- **Metaphor depth:** Medium (journey/path, NO RPG elements like avatar/items)
- **Integration:** Gamifikasi bukan add-on, tapi woven into workflow

**Justifikasi:**
- **Duolingo case study:** "The entire experience IS the game" - gamifikasi sukses bukan add-on
- **Forest case study:** "Picking the right metaphor is crucial" - metaphor must align with app's purpose
- **Habitica warning:** Over-gamification (RPG) dapat mengalihkan fokus dari tujuan

**Catatan:** Case studies bukan peer-reviewed, tapi memberikan **design inspiration** untuk implementasi prinsip dari paper.

---

### 4.2 Proposed Features

#### A. Progress Bar per Kolom

**Alberts et al. Mapping:** `Progress Tracking` (implied in Self-Monitoring cluster)

**Deskripsi:** Visual progress bar di setiap kolom SRL (To Do, In Progress, Review, Done).

**Baseline:** 4 kolom ada, TAPI tidak ada visual feedback berapa % task di setiap kolom.

**Enhancement:**
```
┌─────────────────────────────────────────┐
│ 📋 To Do              [████░░░░░░] 40%  │
│ ⚙️ In Progress        [██████░░░░] 60%  │
│ 🔍 Review             [███████░░░] 70%  │
│ ✅ Done               [██████████] 100% │
└─────────────────────────────────────────┘
```

**Kenapa perlu enhancement:**
- User tidak melihat distribusi task → sulit assess apakah workflow balanced
- Visual feedback = informasi immediate untuk competence

**Evidence:**
- **Sailer et al. (2017):** "Performance graphs meningkatkan Competence need satisfaction"
- **SDT Link:** Competence (visual feedback → sense of progress)

---

#### B. Badges (Milestone Only)

**Alberts et al. Mapping:** `Rewards / Celebration`

**Deskripsi:** Badge untuk milestone bermakna (bukan koleksi).

**Enhancement Rationale:**
- Baseline tidak ada recognition untuk achievement
- Badges = acknowledgment of meaningful milestones

**Design Principle (Nicholson 2015):** Badge harus terhubung dengan tujuan, bukan sekadar koleksi.

**Examples - Meaningful Badges:**

| Badge | Trigger | Makna (Why it matters) | Alberts Alignment |
|-------|---------|------------------------|-------------------|
| 🎯 First Step | Complete 1st task | "Perjalanan dimulai" - milestone awal | Celebration |
| 🔥 Consistent Learner | 7-day streak | "Konsistensi adalah kunci keberhasilan" | Self-Monitoring |
| 📚 Deep Learner | 1hr+ single session | "Focus mendalam = pemahaman dalam" | Self-Monitoring |
| 📈 Growth Mindset | +20% improvement | "Bukti nyata pertumbuhan" | Celebration |
| 💭 Reflective Thinker | 5 reflections completed | "Self-awareness = self-improvement" | Prompt Reflection |

**Examples - AVOID (Collection-based):**
- ❌ "Task Collector" (kumpulkan 10 task) - koleksi tanpa makna
- ❌ "Speed Demon" (selesaikan dalam 5 menit) - mendorong rushing

**Evidence:**
- **Sailer et al. (2017):** "Badges meningkatkan Competence need satisfaction"
- **Nicholson (2015):** "Badges harus meaningful, bukan koleksi"
- **Alberts et al. (2024) hal 18:** "Badges harus meaningful, bukan koleksi"

**SDT Link:** Competence (achievement recognition)

---

#### C. Streaks (Forgiving Design)

**Alberts et al. Mapping:** `Self-Monitoring`

**Deskripsi:** Counter hari berturut-turut user aktif di app.

**Enhancement Rationale:**
- Baseline tidak ada tracking konsistensi
- Streaks = visual feedback untuk consistency (habit formation)

**CRITICAL DESIGN DECISION - Forgiving, Not Punishing:**

**❌ OLD STANCE (Terlalu OIT-Strict):** "Drop total karena hacking risk"

**✅ NEW STANCE (Balanced):** "Forgiving design" approach

**Risk dari Alberts et al. (2024) hal 24-25:**
> "Users may hack the game for rewards, not care about behavior correctness"

**Risk dari Gao (2024):** Streaks bisa jadi **Introjected Regulation** (belajar karena takut putus streak)

**Solution - Forgiving Streak Design:**
1. **Freeze Option:** User bisa freeze streak 1x/week (sakit, sibuk)
2. **Weekend Skip:** Weekend tidak menghitung (avoid weekend pressure)
3. **Framing:** "Konsistensi kamu luar biasa! 7 hari berturut-turut" (kompetensi), BUKAN "Jangan sampai putus!" (pressure)
4. **Functional Significance:** Informational feedback, bukan controlling pressure

**Implementation:**
```
┌─────────────────────────────────────────┐
│ 🔥 Konsistensi Kamu                     │
│                                         │
│    7 hari berturut-turut! Luar biasa!   │
│                                         │
│ ▓▓▓▓▓▓▓░░░ (7 days)                     │
│                                         │
│ 💡 Tip: Kamu bisa freeze 1x/minggu      │
│    jika ada keperluan mendesak          │
│                                         │
│ [Freeze Streak]         [Continue]      │
└─────────────────────────────────────────┘
```

**Evidence:**
- **Agrawal et al. (2023):** Digital intervention + tracking efektif untuk habit formation (75% higher engagement)
- **Duolingo case study:** Streak system sebagai motivasi daily usage
- **Gao (2024):** Risk of Introjected Regulation jika design terlalu punishing

**SDT Link:** Autonomy (dengan forgiving design, user tidak merasa pressured)

**Conclusion:** Bisa dipertahankan dengan design yang tepat (forgiving, informational, bukan controlling)

---

#### D. Theme Customization

**Alberts et al. Mapping:** `Customisation`

**Deskripsi:** User dapat memilih tema warna/visual untuk interface.

**Enhancement Rationale:**
- Baseline hanya 1 theme (standard)
- Customization = rasa ownership dan kontrol

**Implementation:**
```
Themes:
- Light Mode (default)
- Dark Mode
- Sepia (eye comfort)
- Colorful (accent color choice)
```

**Evidence:**
- **Ryan & Deci (2020):** "Autonomy = rasa kontrol dan pilihan"
- **Nicholson (2015) RECIPE:** "C = Choice - pilihan bermakna yang memberikan rasa kontrol"

**SDT Link:** Autonomy (personalization)

**Priority:** Medium (enhances experience, tapi tidak core untuk SDT)

---

### 4.3 Gap 2 Summary

| Fitur | Alberts et al. | SDT Target | Evidence Strength | Priority |
|-------|----------------|------------|-------------------|----------|
| Progress Bar per Kolom | *Progress Tracking* | Competence | ✅ Strong (Sailer 2017) | High |
| Badges (Milestone) | *Rewards / Celebration* | Competence | ✅ Strong (Sailer 2017, Nicholson 2015) | High |
| Streaks (Forgiving) | *Self-Monitoring* | Autonomy | ⚠️ Moderate (Agrawal 2023) + Design Mitigation | Medium |
| Theme Customization | *Customisation* | Autonomy | ✅ Strong (Ryan & Deci 2020) | Medium |

**Wrapper Principle:** Learning Journey metaphor membungkus semua fitur ini menjadi cohesive experience.

---

## 5. Gap 3: Enhanced Competence + OIT Integration

### 5.1 Context: The Golden Gap

**Problem:** Li et al. (2024) menemukan gamifikasi standar **LEMAH** di Competence (g=0.277), padahal Bureau et al. (2022) menemukan Competence = **PREDIKTOR TERKUAT** motivasi (43% variansi).

**Implication:** Area yang PALING PENTING justru yang paling lemah di gamifikasi standar → butuh desain khusus.

**Baseline Gap:** Data ada (pre/post grade, timer, session history) TAPI feedback minimal.

**OIT Integration:** Section 5.4 akan integrate OIT features (Explain Value, Guided Reflection) sebagai **cross-cutting approach** untuk support competence dengan value internalization.

---

### 5.2 Baseline Features yang Di-enhance

#### A. Pre-test & Post-test Grade → + Improvement Visualization

**Alberts et al. Mapping:** `Self-Monitoring`

**Baseline Status:**
- ✅ Pre-test grade input ada
- ✅ Post-test grade input ada
- ✅ Di dashboard: Pre-Test Average & Post-Test Average per course (agregat)

**Baseline Problem:**
- ❌ Visualisasi improvement per task: "Pre: 60% → Post: 85% (+25%!)" → TIDAK ADA
- ❌ Feedback langsung ke user saat improve → TIDAK ADA
- ❌ Trend improvement over time → TIDAK ADA
- ❌ Celebration saat post > pre → TIDAK ADA

**Enhancement:**
```
┌─────────────────────────────────────────┐
│ 📊 Progress Materi: Algoritma Sorting   │
│                                         │
│ Pre-Test:  60% ──────────┐              │
│                          │ +25%!        │
│ Post-Test: 85% ──────────┘              │
│                                         │
│ ✨ Improvement luar biasa!               │
│                                         │
│ [Lihat Trend]          [Task Berikutnya]│
└─────────────────────────────────────────┘
```

**Trend Over Time:**
```
┌─────────────────────────────────────────┐
│ 📈 Improvement Trend: Algoritma         │
│                                         │
│  100% ┤              ●                  │
│   80% ┤        ●                        │
│   60% ┤  ●                              │
│   40% ┤                                 │
│       └──────────────────               │
│       Task1  Task2  Task3               │
│                                         │
│ 💡 Kamu konsisten improve! Keep going!  │
└─────────────────────────────────────────┘
```

**Kenapa perlu enhancement:**
- Data pre/post ada tapi "mati" → tidak memberikan feedback yang actionable
- Visualisasi improvement = concrete evidence of growth → supporting competence

**Evidence:**
- **Sailer et al. (2017):** "Performance graphs meningkatkan Competence need satisfaction"
- **Ryan & Deci (2020):** "Competence = rasa mampu dan melihat progress"

**SDT Link:** Competence (visualisasi progress konkret)

---

#### B. Timer → + Personal Best Tracking

**Alberts et al. Mapping:** `Self-Monitoring` (Design suggestion #23)

**Baseline Status:**
- ✅ Start/stop timer ada
- ✅ Total study time tercatat

**Baseline Problem:**
- ❌ Tidak ada comparison (user tidak tahu apakah ini sesi panjang/pendek)
- ❌ Tidak ada tracking "personal best"
- ❌ Context feedback tidak ada

**Enhancement:**
```
┌─────────────────────────────────────────┐
│ ⏱️ Sesi Belajar                          │
│                                         │
│ Current: 1h 23m                         │
│                                         │
│ 🏆 Personal Best: 2h 15m                │
│    (Algoritma - 3 hari lalu)            │
│                                         │
│ 💡 Kamu 67% menuju record barumu!       │
│                                         │
│ [Stop]              [Continue]          │
└─────────────────────────────────────────┘
```

**Kenapa perlu enhancement:**
- Baseline hanya show angka total → tidak ada context apakah ini bagus/tidak
- Personal best = self-referential comparison (bukan competitive) → supporting competence tanpa pressure

**Evidence:**
- **Alberts et al. (2024):** "Self-Monitoring: displays information about past achievements and goals already reached" - Design suggestion #23
- **Ryan & Deci (2020):** Competence = rasa mampu dan melihat progress

**SDT Link:** Competence (self-comparison, not social comparison)

---

#### C. Session History → + Productive Time Detection

**Alberts et al. Mapping:** `Self-Monitoring` + `Informed Decision Making`

**Baseline Status:**
- ✅ Session history tersimpan (timestamp, duration)

**Baseline Problem:**
- ❌ Hanya list history, tidak ada insights
- ❌ User tidak tahu pola produktivitasnya

**Enhancement:**
```
┌─────────────────────────────────────────┐
│ 📊 Study Insights                       │
│                                         │
│ 🕐 Waktu Produktif Kamu:                │
│    Jam 9-11 pagi (avg 1.2hr/sesi)       │
│                                         │
│ 📅 Hari Paling Produktif:               │
│    Senin & Kamis                        │
│                                         │
│ 💡 Saran:                                │
│    Schedule task penting di jam 9 pagi  │
│                                         │
│ [Lihat Detail History]                  │
└─────────────────────────────────────────┘
```

**Simplified Logic:**
```javascript
// Pattern detection (lightweight, no AI)
const productiveHour = MODE(sessions.map(s => s.hour))
const productiveDay = MODE(sessions.map(s => s.dayOfWeek))
const avgDuration = AVG(sessions.map(s => s.duration))
```

**Kenapa perlu enhancement:**
- Baseline data ada tapi tidak digunakan untuk insights
- Pattern detection = actionable information untuk optimize learning

**Evidence:**
- **Li et al. (2024) FLoRA:** Personalized feedback efektif untuk SRL (kami pakai simplified version)
- **Alberts et al. (2024):** "Informed Decision Making: provides information to help users make informed decisions about their behavior"

**SDT Link:** Competence (self-awareness → better planning)

**Positioning:** Alternatif praktis untuk FLoRA (AI-based, kompleks) - kita pakai lightweight personalization

---

#### D. Checklists → + Immediate Feedback Animation

**Alberts et al. Mapping:** `Task Options / Optimal Challenge` + `CET` + `Positive Feedback`

**Baseline Status:**
- ✅ Checklists (sub-tasks) ada
- ✅ User bisa check/uncheck

**Baseline Problem:**
- ❌ Tidak ada visual feedback saat check item → terasa "flat"

**Enhancement:**
```
When user checks a checklist item:
1. ✅ Checkmark animation (smooth)
2. Progress bar update (immediate)
3. Micro-celebration jika semua items complete
```

**Kenapa perlu enhancement:**
- Immediate feedback = reinforce behavior → supporting competence
- Micro-interaction membuat experience lebih engaging (CET)

**Evidence:**
- **Ryan & Deci (2020):** Competence = rasa mampu dan melihat progress (immediate)
- **Sailer et al. (2017):** Performance feedback meningkatkan Competence

**SDT Link:** Competence (immediate feedback)

**Priority:** Medium (UX polish, tapi impact untuk competence feeling)

---

#### E. Learning Strategy → + Effectiveness Feedback (Hybrid Approach)

**Alberts et al. Mapping:** `Informed Decision Making`

**Baseline Status:**
- ✅ User bisa pilih learning strategy (e.g., "Video", "Reading", "Practice")

**Baseline Problem:**
- ❌ User tidak tahu strategi mana yang paling efektif untuk mereka

**Critical Design Challenge: Data Quality Risk**

```
┌──────────────────────────────────────────────────────────────┐
│                    DATA QUALITY RISK                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  OLD APPROACH (Objective Only):                             │
│  Effectiveness = f(pre_grade, post_grade)                   │
│                    ↑          ↑                              │
│              USER INPUT  USER INPUT                          │
│                                                              │
│  Risk: "Garbage In, Garbage Out"                            │
│  ├─ User skip pre/post → No data → Empty dashboard          │
│  ├─ User input asal → Wrong data → Misleading insights      │
│  └─ Incomplete data → Low confidence recommendations         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Solution: Hybrid Approach (Subjective + Objective)**

**Enhancement Strategy:**
- **Primary:** Subjective effectiveness rating (MANDATORY - always present)
- **Secondary:** Objective improvement calculation (OPTIONAL - when data available)
- **Fallback Hierarchy:** Use best available data with transparency

---

**Implementation: Enhanced Reflection Questions**

**Reflection saat Task Complete:**

```
┌─────────────────────────────────────────┐
│ ✨ Task Selesai!                        │
│                                         │
│ 📊 Progress                             │
│ Pre: 60% → Post: 85% (+25%!)            │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ Refleksi Singkat (unlock insights)      │
│                                         │
│ 1. Apa yang paling membantu? (WAJIB)   │
│    ○ Video/penjelasan                   │
│    ○ Latihan soal                       │
│    ○ Membaca materi                     │
│    ○ Diskusi/bertanya                   │
│                                         │
│ 2. Seberapa efektif strategi ini?       │
│    (WAJIB - quick rating)               │
│    [😔] [😐] [🙂] [😊] [🎉]            │
│    Tidak efektif ←────→ Sangat efektif  │
│                                         │
│ 3. Seberapa yakin dengan materi ini?    │
│    [1] [2] [3] [4] [5]                  │
│    Tidak yakin ←────→ Sangat yakin      │
│                                         │
│ 4. Apa yang akan kamu lakukan berbeda?  │
│    (optional)                           │
│    ┌─────────────────────────────────┐  │
│    │                                 │  │
│    └─────────────────────────────────┘  │
│                                         │
│ [Submit]                                │
└─────────────────────────────────────────┘
```

**Changes from Previous Design:**
- Q1: DESCRIPTIVE (apa yang dipakai) - existing
- **Q2: EVALUATIVE (seberapa efektif) - NEW! MANDATORY, emoji (low friction <2 sec)**
- Q3: CONFIDENCE (confidence level) - existing
- Q4: ADAPTIVE (what next) - existing (optional)

---

**Strategy Dashboard: Hybrid Display**

```
┌─────────────────────────────────────────┐
│ 📊 Strategy Effectiveness               │
│                                         │
│ Video Tutorial:                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Your Rating (30 tasks)           │ │
│ │ [😊] 4.5/5 - Sangat efektif         │ │
│ │ ▓▓▓▓▓▓▓▓▓░ 90% positive             │ │
│ │                                     │ │
│ │ 📊 Actual Improvement (12 tasks)    │ │
│ │ +25% avg (Pre→Post)                 │ │
│ │ ⚠️ Data: 12/30 (40%) - Low confidence│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💡 Recommendation: Video (rating HIGH,  │
│    objective data confirms)             │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ Latihan Soal:                           │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Your Rating (25 tasks)           │ │
│ │ [🙂] 3.8/5 - Cukup efektif          │ │
│ │ ▓▓▓▓▓▓▓░░░ 76% positive             │ │
│ │                                     │ │
│ │ 📊 Actual Improvement (8 tasks)     │ │
│ │ +15% avg (Pre→Post)                 │ │
│ │ ⚠️ Data: 8/25 (32%) - Low confidence│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💡 Recommendation: Try more practice   │
│    (rating OK, objective weak)         │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ Membaca Materi:                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Your Rating (28 tasks)           │ │
│ │ [😐] 3.2/5 - Kurang efektif         │ │
│ │ ▓▓▓▓░░░░░░ 45% positive             │ │
│ │                                     │ │
│ │ 📊 Actual Improvement (No data)     │ │
│ │ ⚠️ Input pre/post grades to see     │ │
│ │    objective analysis               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💡 Consider alternative strategy        │
│    (rating low, objective unavailable)  │
└─────────────────────────────────────────┘
```

**Display Logic:**
1. **Subjective rating:** ALWAYS shown (mandatory data)
2. **Objective improvement:** Shown if data available (>30% completeness)
3. **Confidence indicator:** Transparent about data quality
4. **Recommendation:** Based on best available data

---

**Calculation Logic: Fallback Hierarchy**

```javascript
async function calculateStrategyEffectiveness(userId) {
  const data = await db.query(`
    SELECT 
      r.strategy_helpful,
      AVG(r.strategy_effectiveness_rating) as avg_rating,
      COUNT(*) as total_tasks,
      COUNT(t.post_grade) as tasks_with_grades,
      AVG(CASE 
        WHEN t.post_grade IS NOT NULL AND t.pre_grade IS NOT NULL
        THEN t.post_grade - t.pre_grade
        ELSE NULL
      END) as avg_improvement
    FROM task_reflections r
    JOIN tasks t ON r.task_id = t.id
    WHERE r.user_id = $1
    GROUP BY r.strategy_helpful
  `, [userId])
  
  const effectiveness = data.map(row => {
    // Subjective score (ALWAYS available)
    const subjectiveScore = row.avg_rating  // 1-5
    const subjectiveCount = row.total_tasks
    
    // Objective score (may be incomplete/null)
    const objectiveScore = row.avg_improvement
    const objectiveCount = row.tasks_with_grades
    const dataCompleteness = objectiveCount / subjectiveCount
    
    // Decision logic: Fallback hierarchy
    let primaryScore, primarySource, confidence
    
    if (dataCompleteness >= 0.7) {
      // High completeness (≥70%) → use objective
      primaryScore = objectiveScore
      primarySource = 'objective'
      confidence = 'high'
    } else if (dataCompleteness >= 0.3) {
      // Medium completeness (30-70%) → use hybrid (weighted)
      primaryScore = (objectiveScore * 0.6) + (normalizeToPercent(subjectiveScore) * 0.4)
      primarySource = 'hybrid'
      confidence = 'medium'
    } else {
      // Low completeness (<30%) → use subjective only
      primaryScore = normalizeToPercent(subjectiveScore)
      primarySource = 'subjective'
      confidence = 'low'
    }
    
    return {
      strategy: row.strategy_helpful,
      primaryScore: primaryScore,
      primarySource: primarySource,
      confidence: confidence,
      
      // Details for display
      subjective: {
        score: subjectiveScore,  // 1-5
        count: subjectiveCount,
        percentage: (subjectiveScore / 5) * 100  // for bar chart
      },
      objective: {
        score: objectiveScore,  // percentage
        count: objectiveCount,
        completeness: dataCompleteness * 100  // for transparency
      }
    }
  })
  
  return effectiveness.sort((a, b) => b.primaryScore - a.primaryScore)
}

function normalizeToPercent(rating) {
  // Convert 1-5 rating to percentage
  return (rating / 5) * 100
}
```

---

**Benefits of Hybrid Approach:**

| Aspect | OLD (Objective Only) | NEW (Hybrid) |
|--------|---------------------|--------------|
| **Data Availability** | ❌ Missing if user skip grades | ✅ Always present (subjective mandatory) |
| **Data Quality Risk** | ❌ High (GIGO) | ⚠️ Medium (subjective bias < no data) |
| **User Friction** | ✅ Low (no extra input) | ⚠️ Slightly higher (+1 emoji, <2 sec) |
| **Insight Accuracy** | ⚠️ High when complete, useless when incomplete | ✅ Medium-to-high (graceful degradation) |
| **Transparency** | ❌ User tidak tahu data quality | ✅ User see confidence level |
| **Research Value** | ⚠️ Can validate correlation | ✅ Can validate + study perception bias |

---

**Kenapa perlu enhancement:**
- Baseline: user pilih strategy tapi tidak dapat feedback → tidak bisa optimize
- OLD approach: 100% bergantung pre/post grades → high GIGO risk
- NEW approach: Hybrid with fallback → robust, always actionable

**Evidence:**
- **Alberts et al. (2024):** "Informed Decision Making: provides information to help users make informed decisions"
- **Li et al. (2024) FLoRA:** Personalized feedback efektif (simplified version)
- **Bandura (1997):** Self-efficacy ratings correlate with actual performance (validates subjective as proxy)

**SDT Link:** Competence (informed decision → better outcomes)

**Research Validation Opportunity:**
> "We can analyze correlation between subjective effectiveness ratings and objective improvement scores (when both available) to validate: apakah user perception accurate? Expected r > 0.6 suggests user self-awareness reasonably reliable."

**Priority:** High (critical for data-driven strategy optimization + mitigates GIGO risk)

---

#### F. Course Selection → Free Input + Suggestion

**Alberts et al. Mapping:** `Choice in Task`

**Baseline Status:**
- ✅ User pilih course dari dropdown (list dari admin)

**Baseline Problem:**
- ❌ User tergantung admin untuk add course → **thwarting autonomy**
- ❌ Tidak flexible untuk konteks di luar list (e.g., "Online Course", "Personal Project")

**Enhancement:**
```
┌─────────────────────────────────────────┐
│ 📚 Course / Context                     │
│                                         │
│ [Algoritma & Pemrograman___________]    │
│                                         │
│ 💡 Suggestions:                         │
│ • Algoritma & Pemrograman               │
│ • Basis Data                            │
│ • Struktur Data                         │
│                                         │
│ atau ketik course lain                  │
└─────────────────────────────────────────┘
```

**Kenapa perlu enhancement:**
- Baseline: restricted choice → user tidak punya kontrol penuh
- Free input = full autonomy (user define konteks sendiri)

**Evidence:**
- **Ryan & Deci (2020):** "Autonomy = rasa kontrol dan pilihan"
- **Alberts et al. (2024):** "Choice in Task: allows users to choose tasks or activities"

**SDT Link:** Autonomy (choice & control)

---

### 5.3 New Features untuk Enhanced Competence

#### A. Completion Celebration

**Alberts et al. Mapping:** `Positive Feedback` (suggestion #16) + `Celebration of Milestones` (suggestion #48)

**Deskripsi:** Animasi/feedback celebratory saat user complete task.

**Enhancement Rationale:**
- Baseline: complete task → hanya pindah kolom, no feedback
- Celebration = acknowledgment of achievement → reinforcing competence

**Implementation:**
```
When task moved to "Done":
┌─────────────────────────────────────────┐
│         ✨🎉 TASK SELESAI! 🎉✨          │
│                                         │
│ [Animation: confetti burst]             │
│                                         │
│ 📊 Progress                             │
│ Pre: 60% → Post: 85% (+25%!)            │
│                                         │
│ 💪 Improvement luar biasa!               │
│                                         │
│ [Refleksi Singkat]       [Lanjut]       │
└─────────────────────────────────────────┘
```

**Celebration Hierarchy (context-aware):**
- **Small win:** Checklist item done → checkmark animation
- **Medium win:** Task done → confetti + encouraging message
- **Big win:** Significant improvement (+20%) → badge unlock + enthusiastic message

**Evidence:**
- **Alberts et al. (2024):** "Positive Feedback: provides constructive feedback on success/failure" (suggestion #16)
- **Alberts et al. (2024):** "Celebration of Milestones: recognizes achievements with enthusiastic response" (suggestion #48)
- **Duolingo case study:** Celebration design setiap completion

**SDT Link:** Competence (positive reinforcement)

---

#### B. Encouragement Messages

**Alberts et al. Mapping:** `Encouragement` (Design suggestion #17)

**Deskripsi:** Pesan supportive ketika user mengalami kesulitan (misal: post-test < pre-test).

**Enhancement Rationale:**
- Baseline: jika post < pre, user hanya lihat angka negatif → potentially demotivating
- Encouragement = reframe failure as learning opportunity

**Implementation:**
```
When post-test < pre-test:
┌─────────────────────────────────────────┐
│ 📊 Progress                             │
│ Pre: 75% → Post: 60% (-15%)             │
│                                         │
│ 💪 Tidak apa-apa! Belajar adalah proses.│
│    Materi ini memang challenging.       │
│                                         │
│ 💡 Saran:                                │
│ • Review bagian yang masih sulit        │
│ • Coba strategi belajar berbeda         │
│ • Jangan menyerah - kamu bisa!          │
│                                         │
│ [Lihat Materi Lagi]    [Lanjut]         │
└─────────────────────────────────────────┘
```

**Evidence:**
- **Alberts et al. (2024):** "Encouragement: offers supportive messages when users struggle. Example: 'It seems like the answer is wrong, but I know you can do it'" (suggestion #17)

**SDT Link:** Competence (supportive feedback, bukan judgmental) + prevent Need Thwarting

**Kenapa penting:** Mencegah "fear of failure" yang bisa menurunkan motivation

---

#### C. Actionable Insights (Simplified Personalization)

**Alberts et al. Mapping:** `Informed Decision Making`

**Deskripsi:** Insights berbasis data user untuk help decision making.

**Enhancement Rationale:**
- Baseline: data banyak, insights minimal
- Actionable insights = data → information → action

**Implementation Examples:**

**1. Productive Time Detection:**
```
💡 "Kamu paling produktif jam 9-11 pagi (avg 1.2hr/sesi)"
   Saran: Schedule task penting di jam 9 pagi
```

**2. Strategy Effectiveness:**
```
💡 "Video tutorial gives you +25% avg improvement"
   Saran: Prioritaskan video untuk materi baru
```

**Lightweight Logic (No AI):**
```javascript
// Hanya perhitungan statistik sederhana
const productiveHour = MODE(sessions.map(s => s.hour))
const avgImprovement = AVG(tasks.map(t => t.postGrade - t.preGrade))
```

**Evidence:**
- **Li et al. (2024) FLoRA:** Personalized feedback efektif untuk SRL (kami pakai simplified version tanpa AI)
- **Alberts et al. (2024):** "Informed Decision Making: provides information to help users make informed decisions"

**SDT Link:** Competence (self-awareness + actionable info)

**Positioning:** Alternatif praktis untuk AI-based personalization (FLoRA) - suitable untuk standalone app/skripsi scope

---

#### D. Scaffolding & Onboarding Tour

**Alberts et al. Mapping:** `Tutorials` + `Structure`

**Deskripsi:** Progressive onboarding system untuk mencegah cognitive overload dan membangun user competence secara bertahap.

**Problem Statement:**
- Aplikasi punya banyak fitur baru yang kognitif-nya berat (Goal Hierarchy, Reflection, Strategy tracking)
- Risk: Mahasiswa yang belum terbiasa dengan SRL akan **kewalahan** (Cognitive Overload)
- **Validation Evidence:** Pakar evaluator di baseline research (Skripsi Azmi) stated: *"Fitur sudah baik, namun kurang efektif tanpa tutorial"*

**Theoretical Foundation:**
- **Ryan & Deci (2020):** Competence membutuhkan **Structure** dan **Scaffolding** (bantuan bertahap)
- **Bureau et al. (2022):** "Competence facilitates internalization" → tanpa scaffolding, user tidak akan mencapai competence → value internalization gagal
- **Cognitive Load Theory (Sweller):** Gradual introduction of complex features mencegah cognitive overload

**Enhancement Rationale:**
- Baseline: semua fitur ditampilkan sekaligus → overwhelming untuk first-time user
- Scaffolding: introduce fitur secara bertahap dengan context → membangun competence step-by-step

**Implementation:**

**1. First-Time Onboarding Flow (Progressive):**
```
Step 1: Welcome
┌─────────────────────────────────────────┐
│ 👋 Selamat datang di Kanban SRL!        │
│                                         │
│ Ini adalah tool untuk membantu kamu     │
│ belajar lebih efektif dengan sistem     │
│ self-regulated learning.                │
│                                         │
│ Mari kita setup dalam 3 langkah mudah!  │
│                                         │
│              [Mulai Tour]               │
└─────────────────────────────────────────┘

Step 2: Goal Setup (Level 1 - General Goal)
┌─────────────────────────────────────────┐
│ 🎯 Langkah 1/3: Tujuan Belajarmu        │
│                                         │
│ Apa tujuan belajarmu secara umum?      │
│ (Contoh: Lulus cumlaude, Dapet beasiswa)│
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Input tujuan general...]           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💡 Tujuan ini akan membantu kamu tetap  │
│    motivated saat belajar!              │
│                                         │
│              [Selanjutnya]              │
└─────────────────────────────────────────┘

Step 3: First Task Demo
┌─────────────────────────────────────────┐
│ 📝 Langkah 2/3: Buat Task Pertama       │
│                                         │
│ Coba buat satu task untuk latihan:     │
│                                         │
│ Course: [Algoritma___]  Topic: [___]    │
│                                         │
│ 💡 Nanti kamu bisa track progress dengan│
│    Pre-test dan Post-test score!        │
│                                         │
│              [Buat Task]                │
└─────────────────────────────────────────┘

Step 4: Feature Overview (Skippable)
┌─────────────────────────────────────────┐
│ ✨ Langkah 3/3: Fitur-Fitur Utama       │
│                                         │
│ • 📊 Track improvement (pre/post)       │
│ • 💭 Reflection setelah belajar         │
│ • 📈 Lihat progress & insights          │
│ • 🔔 Smart reminder (opsional)          │
│                                         │
│ Kamu bisa explore nanti! Sekarang       │
│ langsung mulai aja yuk!                 │
│                                         │
│  [Skip Tour]          [Mulai Belajar]   │
└─────────────────────────────────────────┘
```

**2. Contextual Help Overlay (On-Demand):**
```
When user taps "?" icon on complex features:

┌─────────────────────────────────────────┐
│ ❓ Goal Hierarchy                       │
│                                         │
│ Kenapa kamu perlu isi tujuan?           │
│                                         │
│ • Tujuan membantu kamu tetap motivated  │
│ • Research shows: students with clear   │
│   goals 2x lebih engaged                │
│ • Kamu bisa isi:                        │
│   - General goal (1x saat setup)        │
│   - Course goal (per mata kuliah)       │
│                                         │
│ Contoh:                                 │
│ General: "Lulus cumlaude"               │
│ Course (Algoritma): "Kuasai sorting     │
│ untuk final project"                    │
│                                         │
│            [Mengerti]                   │
└─────────────────────────────────────────┘
```

**3. Inline Tooltips (Lightweight, Non-Intrusive):**
```
Saat hover/tap field pertama kali:

┌─────────────────────────────────────────┐
│ Pre-Test Score: [___] %                 │
│ 💡 Isi score kamu sebelum belajar       │
│    (bisa dari latihan soal/quiz)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Reflection:                             │
│ Q1: Strategi apa yang kamu pakai?      │
│ 💡 Contoh: video tutorial, baca buku,   │
│    diskusi teman                        │
└─────────────────────────────────────────┘
```

**4. Progressive Feature Unlock (Optional - Future Enhancement):**
```
Untuk mencegah overwhelming:
- Week 1: Basic features (task creation, pre/post tracking)
- Week 2: Reflection unlocked (after 3 tasks completed)
- Week 3: Advanced insights unlocked (after 5 tasks)

Rationale: Gradual exposure prevents cognitive overload
```

**Implementation Complexity:** LOW
- Frontend: simple modal flows + tooltip components
- Backend: minimal (flag `has_completed_onboarding` di user profile)
- No AI, no complex logic

**Evidence:**
- **Baseline Research Validation:** Expert evaluator explicitly stated: "Fitur sudah baik, namun kurang efektif tanpa tutorial"
- **Ryan & Deci (2020):** Structure & Scaffolding adalah prinsip fundamental untuk mendukung Competence
- **Cognitive Load Theory:** Progressive disclosure mencegah cognitive overload
- **UX Best Practice:** Duolingo, Notion, Todoist semua menggunakan progressive onboarding

**SDT Link:** 
- **Competence** (Structure & Scaffolding - membangun rasa mampu secara bertahap)
- **Autonomy** (user bisa skip tour jika sudah familiar)

**Impact:**
- **Mengatasi barrier utama:** Cognitive overload yang mencegah adoption
- **Foundational enabler:** Tanpa scaffolding, fitur-fitur canggih lain tidak akan digunakan secara efektif
- **Menjawab validasi pakar:** Direct response terhadap feedback penelitian sebelumnya

**Why TIER 1:**
1. **Foundational:** Enabler untuk semua fitur lain (tidak ada gunanya punya fitur canggih kalau user tidak tahu cara pakainya)
2. **Evidence-based:** Explicit recommendation dari validasi pakar
3. **High ROI:** Low effort, high impact (mencegah user abandonment di early stage)
4. **Theoretical support:** Structure & Scaffolding adalah prinsip core dari SDT untuk Competence

---

### 5.4 OIT Integration: Value Internalization Features

**Overview:** OIT (Organismic Integration Theory) features untuk support **value internalization**, bukan hanya enjoyment. Ini cross-cutting approach yang support competence dengan fokus pada autonomous motivation.

**Theoretical Foundation:**
- **Alberts et al. (2024) hal 1:** "Focus on membantu internalisasi nilai (OIT), NOT hanya membuat app enjoyable (CET)"
- **OIT Continuum:** External → Introjected → **Identified** → **Integrated** → Intrinsic
- Target: Identified & Integrated Regulation (Autonomous Motivation)

**Dual-Purpose Note:** Fitur di section ini serve **primary purpose** (Competence/OIT) dan **secondary purpose** (minimal Relatedness untuk theoretical completeness).

---

#### A. Explain Value ← **TIER 1 - CORE OIT FEATURE**

**Alberts et al. Mapping:** `Explain Value` (Design suggestion #27)

**Deskripsi:** Sistem goal hierarchy untuk membantu user **internalize value** dari aktivitas SRL tanpa repetitive prompting.

**Enhancement Rationale:**
- **CRITICAL OIT ALIGNMENT:** Fitur ini membantu user **internalize value** dari aktivitas SRL
- Bukan sekadar "app enjoyable" (CET), tapi "user paham kenapa SRL penting untuk masa depan" (OIT)
- Support **Identified Regulation**: user understand personal value of behavior

**Problem dengan Task-Level Prompts:**
```
❌ OLD APPROACH (High Friction):
Task 1: "Kenapa ini penting?" → User jawab
Task 2: "Kenapa ini penting?" → User jawab (repetitive...)
Task 3: "Kenapa ini penting?" → User jawab (annoying...)
Task 4+: User skip → OIT FAILS

Result: User fatigue → 90% skip rate → no data → no OIT effect
```

**Solution: Goal Hierarchy System (3-Level)**

```
┌──────────────────────────────────────────────────────────────┐
│                    GOAL HIERARCHY                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  LEVEL 1: GENERAL GOAL (One-time, Onboarding)               │
│  "Apa tujuan belajarmu secara keseluruhan?"                 │
│  → Input: 1x saat onboarding                                 │
│  → Applies to: ALL tasks (fallback)                          │
│  → Example: "Lulus cumlaude untuk beasiswa S2"               │
│                                                              │
│           ↓ (inheritance)                                    │
│                                                              │
│  LEVEL 2: COURSE GOAL (Per course, First task)              │
│  "Kenapa course ini penting untukmu?"                        │
│  → Input: 1x per course (first task only)                   │
│  → Applies to: All tasks in this course                      │
│  → Override: General goal                                    │
│  → Example: "Interview software engineer"                    │
│                                                              │
│           ↓ (inheritance)                                    │
│                                                              │
│  LEVEL 3: TASK GOAL (Optional override)                     │
│  "Kenapa task spesifik ini penting?"                         │
│  → Input: Optional (rare case)                               │
│  → Applies to: This task only                                │
│  → Override: Course goal                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Friction Comparison:**

| Approach | Total Prompts (50 tasks) | User Experience |
|----------|--------------------------|-----------------|
| OLD (Task-level) | 50 prompts | ❌ Annoying, high skip rate |
| NEW (Hierarchy) | 1 general + ~5 course = **6 prompts** | ✅ Low friction, consistent data |

**Friction Reduction: 90%**

---

**Implementation Flows:**

**1. Onboarding (Level 1 - ONE-TIME):**

```
┌─────────────────────────────────────────┐
│ 👋 Selamat Datang di Kanban Learning!   │
│                                         │
│ Sebelum mulai, mari set up tujuan       │
│ belajarmu...                            │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ Apa tujuan belajarmu secara keseluruhan?│
│ (ini akan memotivasi semua aktivitasmu) │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Lulus cumlaude untuk beasiswa S2    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💡 Contoh:                              │
│ • Lulus cumlaude                        │
│ • Dapat kerja di tech company           │
│ • Persiapan karir sebagai engineer      │
│                                         │
│ [Skip untuk nanti]       [Lanjut]       │
└─────────────────────────────────────────┘
```

**2. First Task in New Course (Level 2):**

```
┌─────────────────────────────────────────┐
│ Tambah Task Baru                        │
│                                         │
│ Course: [Algoritma & Pemrograman____]   │
│ Topic:  [Sorting Algorithm__________]   │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ 💭 First time di course "Algoritma"!    │
│                                         │
│ Kenapa course ini penting untukmu?      │
│ (optional - kosongkan untuk pakai       │
│  general goal)                          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Penting untuk interview software    │ │
│ │ engineer                            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📌 General goal:                        │
│    "Lulus cumlaude untuk beasiswa S2"   │
│                                         │
│ [Use General Goal]      [Save Course Goal]│
└─────────────────────────────────────────┘
```

**3. Subsequent Tasks (ZERO PROMPTING):**

```
┌─────────────────────────────────────────┐
│ Tambah Task Baru                        │
│                                         │
│ Course: [Algoritma & Pemrograman____]   │
│ Topic:  [Heap Sort__________________]   │
│                                         │
│ 💭 Goal: "Interview software engineer"  │
│    (inherited dari course Algoritma)    │
│                                         │
│ [Edit Goal]              [Create Task]  │
└─────────────────────────────────────────┘
```

**4. Task Card Display:**

```
┌─────────────────────────────────────────┐
│ 📚 Heap Sort                            │
│ Course: Algoritma & Pemrograman         │
│                                         │
│ 💡 Why: Interview software engineer     │
│    (Course goal)                        │
│                                         │
│ Progress: [████████░░] 80%              │
└─────────────────────────────────────────┘
```

**5. Completion Reflection (Goal Closure):**

```
┌─────────────────────────────────────────┐
│ ✨ Task Selesai!                        │
│                                         │
│ 📊 Pre: 60% → Post: 85% (+25%!)         │
│                                         │
│ 💭 Tujuanmu: "Interview software engineer"│
│                                         │
│ Apakah task ini membantu tujuanmu?      │
│ [😔] [😐] [🙂] [😊] [🎉]                │
└─────────────────────────────────────────┘
```

---

**Goal Resolution Logic:**

```javascript
// Priority: task > course > general
function resolveTaskGoal(userId, taskId) {
  const task = await db.tasks.findOne({ id: taskId })
  
  // 1. Task-specific (rare, optional)
  if (task.task_specific_goal) {
    return { goal: task.task_specific_goal, source: 'task' }
  }
  
  // 2. Course goal
  const courseGoal = await db.course_goals.findOne({
    user_id: userId, course_name: task.course_name
  })
  if (courseGoal?.course_goal) {
    return { goal: courseGoal.course_goal, source: 'course' }
  }
  
  // 3. General goal (fallback)
  const userGoal = await db.user_goals.findOne({ user_id: userId })
  return { goal: userGoal.general_goal, source: 'general' }
}
```

---

**Psychological Mechanism (UNCHANGED - Still OIT):**

1. **Self-Generated Justification:** User writes own reason → stronger internalization
2. **Cognitive Dissonance Reduction:** "Kalau penting kenapa aku males?" → "Berarti aku harus belajar"
3. **Repeated Exposure:** User melihat reminder setiap buka task → reinforcement

**Evidence:**
- **Alberts et al. (2024):** "Explain Value: helps users internalize value of activities" (#27)
- **Ryan & Deci (2000) OIT:** Identified Regulation → Integrated Regulation
- **Festinger (1957):** Self-generated justification → stronger belief

**SDT Link:**
- **Primary:** **OIT (value internalization)** → Competence + Autonomy
- **Secondary:** Relatedness (meaning-making)

**Priority:** **TIER 1 - MUST HAVE** (Core OIT feature)

---

#### B. Guided Reflection as Metacognition ← **SRL COMPONENT (DUAL-PURPOSE)**

**Alberts et al. Mapping:** `Prompt Reflection` (Design suggestion #22) + `Guided Goal-Setting` (Design suggestion #15)

**Deskripsi:** Guided reflection prompts untuk **metacognitive awareness** (SRL component).

**Dual-Purpose Framing:**
- **Primary:** Competence (Metacognitive Awareness - SRL)
- **Secondary:** Relatedness (Self-connection, goal connection)

**Theoretical Foundation:**
- **Zimmerman (2002) SRL Model:** Metacognition adalah core component SRL
  - Self-monitoring, self-evaluation, self-reflection
- **Schraw & Moshman (1995):** Metacognitive awareness → better learning outcomes
- **Ryan & Deci (2017):** Relatedness juga tentang "feeling that activity matters"

**Defense Mechanism:**
> "Berdasarkan Bureau et al. (2022), Competence memfasilitasi internalisasi. Guided Reflection dirancang sebagai Enhanced Competence untuk membangun efficacy dan metacognitive awareness, agar mahasiswa menginternalisasi nilai belajar secara mandiri. Fitur ini **primarily** support Competence (SRL), namun **incidentally** provide minimal Relatedness melalui goal connection (Lüking et al., 2023: Relatedness kurang efektif di digital individual apps)."

**Enhancement Rationale:**
- Baseline: Notes tanpa guidance → tidak efektif untuk metacognition
- Guided prompts → structured metacognitive awareness
- Support **self-evaluation** dan **adaptive learning** (SRL)
- Minimal Relatedness via goal/self connection (theoretical completeness)

**Implementation:**

**1. Goal Prompt saat Create Task (Optional):**

```
┌─────────────────────────────────────┐
│ Tambah Task Baru                    │
│                                     │
│ Course: [Algoritma______________]   │
│ Materi: [Sorting________________]   │
│                                     │
│ 💡 Apa tujuanmu untuk task ini?     │
│    (optional - untuk tracking goal) │
│ ┌─────────────────────────────────┐ │
│ │ Paham konsep sorting untuk UTS  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]              [Create]      │
└─────────────────────────────────────┘
```

**Framing:** **Primary = Goal-setting** (SRL component), **Secondary = Purpose connection** (minimal Relatedness)

**Catatan:** Optional agar tidak menjadi friction for quick task creation.

---

**2. Guided Reflection saat Task Complete (Q1+Q2+Q3 Mandatory, Q4 Optional):**

```
┌─────────────────────────────────────────┐
│ ✨ Task Selesai!                        │
│                                         │
│ 📊 Progress                             │
│ Pre: 60% → Post: 85% (+25%!)            │
│                                         │
│ ─────────────────────────────────────   │
│                                         │
│ Refleksi Singkat (unlock insights)      │
│                                         │
│ 1. Apa yang paling membantu? (WAJIB)   │
│    ○ Video/penjelasan                   │
│    ○ Latihan soal                       │
│    ○ Membaca materi                     │
│    ○ Diskusi/bertanya                   │
│                                         │
│ 2. Seberapa efektif strategi ini?       │
│    (WAJIB - quick rating)               │
│    [😔] [😐] [🙂] [😊] [🎉]            │
│    Tidak efektif ←────→ Sangat efektif  │
│                                         │
│ 3. Seberapa yakin dengan materi ini?    │
│    [1] [2] [3] [4] [5]                  │
│    Tidak yakin ←────→ Sangat yakin      │
│                                         │
│ 4. Apa yang akan kamu lakukan berbeda?  │
│    (optional - untuk improve strategi)  │
│    ┌─────────────────────────────────┐  │
│    │                                 │  │
│    └─────────────────────────────────┘  │
│                                         │
│ [Submit]                                │
└─────────────────────────────────────────┘
```

**Framing:**
- Pertanyaan 1: **Strategy identification** (DESCRIPTIVE - apa yang dipakai)
- **Pertanyaan 2: Strategy effectiveness rating** (EVALUATIVE - seberapa efektif) ← **NEW!**
- Pertanyaan 3: **Self-efficacy tracking** (competence - confidence level)
- Pertanyaan 4: **Adaptive learning** (SRL - what next)
- Overall: Minimal self-connection (Relatedness - SECONDARY)

**Key Addition: Q2 (Strategy Effectiveness Rating)**
- **Purpose:** Subjective effectiveness data untuk Strategy Dashboard (Section 5.2.E)
- **Why Mandatory:** Mitigates GIGO risk (tidak bergantung 100% pada pre/post grades)
- **Low Friction:** Emoji rating (1 click, <2 detik)
- **High Value:** Always-available data untuk personalized insights

**Tiered Engagement Design:**

```
┌──────────────────────────────────────────────────────────────┐
│               REFLECTION TIERS                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 1: MANDATORY (Low Friction - Descriptive)             │
│  Q1: "Apa yang paling membantu?"                            │
│      ○ Video ○ Latihan ○ Baca ○ Diskusi                     │
│      → Multiple choice (1 click, <3 detik)                  │
│      → WAJIB (identify strategy used)                       │
│      → Data untuk Strategy Dashboard (Section 5.2.E)        │
│                                                              │
│  TIER 2: MANDATORY (Low Friction - Evaluative) ← NEW!       │
│  Q2: "Seberapa efektif strategi ini?"                       │
│      [😔] [😐] [🙂] [😊] [🎉]                              │
│      → Emoji rating (1 click, <2 detik)                     │
│      → WAJIB (subjective effectiveness)                     │
│      → Data untuk Strategy Dashboard (GIGO mitigation)      │
│                                                              │
│  TIER 3: MANDATORY (Low Friction - Self-Assessment)         │
│  Q3: "Seberapa yakin dengan materi ini?"                    │
│      [1] [2] [3] [4] [5]                                    │
│      → Slider (1 click, <2 detik)                           │
│      → WAJIB (self-efficacy tracking)                       │
│      → Data untuk Confidence Trend Analysis                 │
│                                                              │
│  TIER 4: OPTIONAL (For Engaged Users - Deep Reflection)     │
│  Q4: "Apa yang akan kamu lakukan berbeda?"                  │
│      [text input]                                           │
│      → Optional (high value, low pressure)                  │
│      → Data untuk Commitment Tracking                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Design Decisions:**

| Setting | Default | Alasan |
|---------|---------|--------|
| Reflection saat complete | **Wajib (Q1+Q2+Q3)** | Core untuk metacognitive awareness & data collection |
| Q1 (Strategy ID) | **MANDATORY (MC)** | Descriptive - apa yang dipakai (low friction) |
| Q2 (Effectiveness) | **MANDATORY (emoji)** | **NEW!** Evaluative - seberapa efektif (<2 sec) |
| Q3 (Confidence) | **MANDATORY (slider)** | Self-efficacy tracking (1 click) |
| Q4 (Adaptive) | **OPTIONAL (text)** | For engaged users, commitment tracking |
| Goal prompt saat create | **N/A** | Using hierarchy system (Section 5.4.A) |

**Kenapa Q1+Q2+Q3 Mandatory:**
- **Low friction:** MC + emoji + slider (total <8 detik)
- **High value:** 
  - Q1: Identify strategy used
  - **Q2: Subjective effectiveness (GIGO mitigation for Strategy Dashboard)**
  - Q3: Self-efficacy trend
- **User benefit:** Unlock Strategy Effectiveness Dashboard + Confidence Trend
- **Balance:** 3 mandatory (quick) + 1 optional (deep)

---

**3. Goal Completion Check (jika goal diisi saat create):**

```
┌─────────────────────────────────────────┐
│ ✨ Task Selesai!                        │
│                                         │
│ Tujuan awalmu:                          │
│ "Paham konsep sorting untuk UTS"        │
│                                         │
│ Apakah tujuan tercapai?                 │
│ [😔] [😐] [🙂] [😊] [🎉]                │
│                                         │
│ [Refleksi Lebih Lanjut]    [Selesai]    │
└─────────────────────────────────────────┘
```

**Framing:** **Primary = Self-evaluation** (SRL component), **Secondary = Goal connection** (minimal Relatedness)

**Kenapa Penting:**
- Menghubungkan kembali ke tujuan awal → metacognitive closure (PRIMARY)
- User evaluate apakah effort mencapai target → self-assessment (Competence)
- Minimal goal connection → Relatedness (SECONDARY)

---

**4. Confidence Level (Mengganti Star Rating):**

**Alberts et al. Mapping:** `Self-Monitoring` (self-efficacy awareness)

**Baseline Problem:** Star rating 1-5 tanpa konteks membingungkan (quality of material? satisfaction?)

**Solution:** Ubah menjadi **Self-Efficacy Rating / Confidence Check**

**Question:** "Seberapa yakin kamu menguasai materi ini?" (1-5)

**Benefit:**
- Mendukung Competence (self-efficacy awareness)
- Useful untuk Learning Analytics
- Mendukung metakognisi (SRL component)
- Track self-efficacy trend over time

**Evidence:**
- **Alberts et al. (2024):** Self-Monitoring patterns
- **Bandura (1997):** Self-efficacy theory
- **Zimmerman (2002):** Self-efficacy = key SRL component

**Implementation:**
```
Seberapa yakin kamu menguasai materi ini?
[1] [2] [3] [4] [5]
Tidak yakin ←────────→ Sangat yakin

(Data untuk tracking self-efficacy trend)
```

**Framing:** **Self-efficacy** (competence), bukan satisfaction rating.

**SDT Link:** Competence (self-efficacy = core competence indicator)

---

**Evidence untuk Guided Reflection:**
- **Alberts et al. (2024):** "Prompt Reflection: shows information prompting users to reflect on past goals" (suggestion #22)
- **Alberts et al. (2024):** "Guided Goal-Setting: supports users in setting meaningful goals" (suggestion #15)
- **Zimmerman (2002):** Metacognition = core SRL component
- **Schraw & Moshman (1995):** Metacognitive awareness → learning outcomes
- **Ryan & Deci (2017):** Relatedness = feeling that activity matters (secondary support)

**SDT Link:**
- **Primary:** **Competence** (metacognitive awareness → better learning)
- **Secondary:** **OIT** (reflection on value) + **Relatedness** (goal/self connection)

**Priority:** **TIER 1 - MUST HAVE** (Core SRL component + OIT support + minimal Relatedness)

---

#### C. Reflection Prompts Library

**Goal-Oriented Prompts (for value internalization + minimal relatedness):**
- "Mengapa materi ini penting untuk karirmu?"
- "Bagaimana task ini membantumu mencapai tujuan semester?"
- "Apa yang ingin kamu capai dengan mempelajari ini?"

**Metacognitive Prompts (for SRL - primary competence):**
- "Apa yang kamu pelajari tentang cara belajarmu?"
- "Strategi apa yang paling cocok untukmu?"
- "Apa yang akan kamu lakukan berbeda next time?"

**Self-Evaluation Prompts (for competence):**
- "Seberapa yakin kamu menguasai materi ini?"
- "Apakah tujuan awalmu tercapai?"
- "Kapan kamu merasa paling fokus saat mengerjakan task ini?"

---

#### D. Technical Implementation: OIT Data Flow System

**Database Schema:**

```sql
-- User general goals (Level 1)
user_goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  general_goal TEXT NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(user_id)
)

-- Course-level goals (Level 2)
course_goals (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  course_goal TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, course_name)
)

-- Tasks (with goal inheritance)
tasks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  course_name VARCHAR(255),
  topic VARCHAR(255),
  
  -- Goal inheritance (resolved dynamically via course_goals)
  task_specific_goal TEXT,  -- NULL for most tasks (inherited)
  
  pre_grade INT,
  post_grade INT,
  completed_at TIMESTAMP
)

-- Task reflections
task_reflections (
  id SERIAL PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  
  -- Mandatory fields
  strategy_helpful VARCHAR(50) NOT NULL,        -- Q1: video/latihan/baca/diskusi
  strategy_effectiveness_rating INT NOT NULL,   -- Q2: 1-5 (emoji) ← NEW!
  confidence_level INT NOT NULL,                -- Q3: 1-5 (slider)
  
  -- Optional fields
  next_time TEXT,                               -- Q4: adaptive learning (text)
  goal_achievement_rating INT,                  -- emoji rating (1-5)
  
  created_at TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
)
```

---

**Data Flow Pipeline:**

```
┌─────────────────────────────────────────────────────────────┐
│                    OIT DATA ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1] USER INPUT                                             │
│      ├─ General Goal (onboarding, 1x)                       │
│      ├─ Course Goal (per course, ~5x)                       │
│      ├─ Reflection Q1-Q3 (per task completed)               │
│      └─ Goal Achievement Rating (per completion)            │
│                      ↓                                      │
│  [2] STORAGE                                                │
│      ├─ user_goals                                          │
│      ├─ course_goals                                        │
│      ├─ task_reflections                                    │
│                      ↓                                      │
│  [3] PROCESSING                                             │
│      ├─ Goal Resolution (task→course→general)               │
│      ├─ Strategy Effectiveness Calculation                  │
│      ├─ Confidence Trend Analysis                           │
│                      ↓                                      │
│  [4] OUTPUT TO USER                                         │
│      ├─ Task Card: Goal reminder (real-time)                │
│      ├─ Strategy Dashboard: "Video = best" (aggregated)     │
│      ├─ Smart Suggestions: "Try video" (adaptive)           │
│      ├─ Confidence Trend: Graph (longitudinal)              │
│                      ↓                                      │
│  [5] FEEDBACK LOOP                                          │
│      └─ User sees value → More engagement → Better data     │
│         → Better insights → More value (cycle)              │
└─────────────────────────────────────────────────────────────┘
```

---

**Data Usage Examples:**

**1. Strategy Effectiveness Dashboard (from Reflection Q1):**

```javascript
// Backend calculation
async function calculateStrategyEffectiveness(userId) {
  const reflections = await db.query(`
    SELECT 
      r.strategy_helpful,
      t.post_grade - t.pre_grade AS improvement,
      COUNT(*) as count
    FROM task_reflections r
    JOIN tasks t ON r.task_id = t.id
    WHERE r.user_id = $1 AND t.post_grade IS NOT NULL
    GROUP BY r.strategy_helpful
  `, [userId])
  
  // Calculate average improvement per strategy
  const effectiveness = reflections.map(row => ({
    strategy: row.strategy_helpful,
    avgImprovement: row.improvement / row.count,
    count: row.count
  }))
  
  return effectiveness.sort((a, b) => b.avgImprovement - a.avgImprovement)
}
```

**User sees:**
```
📊 Strategy Effectiveness

Video Tutorial:
▓▓▓▓▓▓▓▓░░ 85% avg improvement (12x)
💡 Best strategy for you!

Latihan Soal:
▓▓▓▓▓▓░░░░ 65% avg improvement (8x)
```

---

**2. Confidence Trend Analysis (from Reflection Q2):**

```javascript
// Backend calculation
async function analyzeConfidenceTrend(userId) {
  const data = await db.query(`
    SELECT 
      confidence_level,
      DATE(created_at) as date,
      AVG(confidence_level) OVER (
        ORDER BY created_at 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
      ) as moving_avg
    FROM task_reflections
    WHERE user_id = $1
    ORDER BY created_at
  `, [userId])
  
  // Calculate trend slope
  const trend = calculateLinearRegression(data)
  
  return {
    data: data,
    trend: trend.slope > 0 ? 'increasing' : 'decreasing',
    change: Math.abs(trend.slope) * 100 // % change per week
  }
}
```

**User sees:**
```
📈 Self-Efficacy Trend

 5 ┤              ●
 4 ┤        ●
 3 ┤  ●
 2 ┤
 1 ┤
   └──────────────────
   W1   W2   W3   W4

🎉 Self-efficacy meningkat 40% dalam 4 minggu!
```

---

**3. Smart Suggestions (Adaptive):**

```javascript
// When user creates new task
async function suggestStrategy(userId, courseName) {
  const effectiveness = await calculateStrategyEffectiveness(userId)
  
  // Filter strategies with enough data (min 3 tasks)
  const reliableStrategies = effectiveness.filter(s => s.count >= 3)
  
  if (reliableStrategies.length > 0) {
    const best = reliableStrategies[0]
    return {
      strategy: best.strategy,
      avgImprovement: best.avgImprovement,
      count: best.count
    }
  }
  
  return null
}
```

**User sees saat create task:**
```
Tambah Task Baru

Course: [Algoritma___________________]
Topic:  [Heap Sort___________________]

💡 Saran: Coba video tutorial
   (Berdasarkan 12 task sebelumnya,
    video gives +85% avg improvement)

[Ignore]              [Use Suggestion]
```

---

**API Endpoints (Frontend Consumption):**

```javascript
// Analytics endpoints
GET /api/analytics/strategy-effectiveness
GET /api/analytics/confidence-trend

// Suggestion endpoints
GET /api/suggestions/next-task?course={courseName}

// Goal management
GET /api/goals/user
PUT /api/goals/user
GET /api/goals/course/{courseName}
PUT /api/goals/course/{courseName}
```

---

**Key Technical Achievements:**

✅ **Data is NOT "dead"** - Complete feedback loop with 4 usage types

✅ **Low friction** - Goal hierarchy reduces prompts by 90%

✅ **High value** - User sees immediate benefit (Strategy Dashboard, Trend, Insights)

✅ **Scalable** - Works for 5 courses or 50 courses

✅ **Evidence-based** - All processing based on proven principles (no black box)

---

### 5.5 Gap 3 Summary

**Baseline Enhancements:**

| Fitur Baseline | Enhancement | Alberts et al. | Kenapa Perlu | Evidence | Evidence Strength |
|----------------|-------------|----------------|--------------|----------|-------------------|
| Pre/Post Grade | + Improvement Visualization | *Self-Monitoring* | Data ada tapi "mati", tidak actionable | Sailer 2017 | ✅ Strong |
| Timer | + Personal Best Tracking | **Self-Monitoring** | Tidak ada context, no comparison | Alberts #23 | ✅ Strong |
| Session History | + Productive Time Detection | *Self-Monitoring + Informed Decision* | Data tidak digunakan untuk insights | FLoRA 2024 | ✅ Strong |
| Checklists | + Immediate Feedback | *Positive Feedback + CET* | Terasa flat, no reinforcement | Sailer 2017 | ✅ Strong |
| Learning Strategy | + Effectiveness Feedback (Hybrid) | *Informed Decision Making* | Tidak bisa optimize strategy + GIGO risk | Alberts 2024 + Bandura 1997 | ✅ Strong |
| Course Selection | → Free Input + Suggestion | *Choice in Task* | Restricted choice → autonomy thwarted | Ryan & Deci 2020 | ✅ Strong |

**New Competence Features:**

| Fitur Baru | Alberts et al. | SDT Target | Evidence | Evidence Strength | Priority |
|------------|----------------|------------|----------|-------------------|----------|
| **Scaffolding & Onboarding Tour** | **Tutorials + Structure** | **Competence** | **Ryan & Deci 2020 + Baseline Validation** | ✅ Strong | **TIER 1** |
| Completion Celebration | **Positive Feedback + Celebration** | Competence | Alberts #16, #48 | ✅ Strong | High |
| Encouragement Messages | **Encouragement** | Competence | Alberts #17 | ✅ Strong | High |
| Actionable Insights | *Informed Decision Making* | Competence | FLoRA 2024 | ✅ Strong | Medium |

**OIT Integration Features (Dual-Purpose):**

| Fitur OIT | Alberts et al. | Primary SDT | Secondary SDT | Evidence | Evidence Strength | Priority |
|-----------|----------------|-------------|---------------|----------|-------------------|----------|
| **Explain Value (Goal Hierarchy)** | **Explain Value** | **OIT (Internalization)** | **Relatedness (Meaning)** | **Alberts #27 + Festinger 1957** | ✅ Strong | **TIER 1** |
| **Guided Reflection** | **Prompt Reflection + Guided Goal-Setting** | **Competence (Metacognition)** | **Relatedness (Goal Connection)** | **Alberts #22, #15 + Zimmerman 2002** | ✅ Strong | **TIER 1** |
| Confidence Level | *Self-Monitoring* | Competence (Self-efficacy) | - | Alberts 2024 + Bandura 1997 | ✅ Strong | High |

**Target:** Meningkatkan Competence dari 40% → 90%

**OIT Achievement:** Support Autonomous Motivation melalui value internalization + metacognitive awareness

**Relatedness (Secondary):** Minimal support via dual-purpose features (goal connection, meaning-making)

**Technical Innovation:** Goal Hierarchy System reduces friction by 90% (6 prompts vs 50+ prompts) while maintaining OIT psychological mechanism

**Data Quality Mitigation:** Strategy Effectiveness uses hybrid approach (subjective + objective) untuk menghindari "Garbage In, Garbage Out" risk - subjective rating mandatory (always available), objective improvement optional (when pre/post grades available)

**All features in Gap 3 have STRONG evidence** - berbeda dengan beberapa gamification features tradisional yang memiliki risk (e.g., Streaks → Introjected Regulation)

---

## 6. Evidence Mapping (Consolidated)

### 6.1 Fitur dengan Evidence Kuat (Peer-Reviewed)

| Fitur | Evidence Summary | Paper | SDT | Alberts et al. |
|-------|------------------|-------|-----|----------------|
| **Scaffolding & Onboarding Tour** | **Structure & Scaffolding mencegah cognitive overload** | **Ryan & Deci (2020) + Baseline Validation (Skripsi Azmi)** | **Competence** | **Tutorials + Structure** |
| Push Notification | Meningkatkan engagement | Karaali (2025) | Trigger | *Reminders from Digital Assistant* |
| Smart Reminder | Scheduled > random | Karaali (2025) | Trigger | *Manual Reminders* |
| **Social Presence Notification** | **Descriptive norms influence behavior** | **Cialdini (2009), Plak (2023)** | **Relatedness** | *Social Support (implied)* |
| Notification Preferences | Autonomy = choice | Ryan & Deci (2020) | Autonomy | *Customisation* |
| Progress Bar | Performance graphs → competence | Sailer (2017) | Competence | *Progress Tracking* |
| Badges (Milestone) | Badges → competence; meaningful | Sailer (2017), Nicholson (2015) | Competence | *Rewards / Celebration* |
| Improvement Visualization | Performance graphs → competence | Sailer (2017) | Competence | *Self-Monitoring* |
| Personal Best Tracking | Self-Monitoring pattern | Alberts et al. (2024) #23 | Competence | **Self-Monitoring** |
| Completion Celebration | Positive Feedback + Celebration | Alberts (2024) #16, #48 | Competence | **Positive Feedback + Celebration** |
| Encouragement Messages | Supportive messages saat struggle | Alberts (2024) #17 | Competence | **Encouragement** |
| **Explain Value** | **Why tasks meaningful** | **Alberts (2024) #27** | **OIT + Relatedness** | **Explain Value** |
| **Guided Reflection** | **Prompt Reflection + Goal-Setting** | **Alberts (2024) #22, #15 + Zimmerman (2002)** | **Competence + Relatedness** | **Prompt Reflection + Guided Goal-Setting** |
| Course Free Input | Choice & control | Ryan & Deci (2020) | Autonomy | *Choice in Task* |
| Theme Customization | Autonomy = choice | Ryan & Deci (2020) | Autonomy | *Customisation* |

### 6.2 Fitur dengan Evidence Moderate (Framework/Case Study)

| Fitur | Justifikasi | Source Type | Catatan |
|-------|-------------|-------------|---------|
| Streaks (Forgiving) | Habit formation theory | Agrawal (2023) + Gao (2024) risk mitigation | Forgiving design untuk avoid Introjected Regulation |
| Actionable Insights | Personalized feedback | FLoRA (2024) | Kita pakai simplified version (no AI) |
| Swipe Navigation | Mobile-first UX | Case studies | Design decision, bukan claim penelitian |
| Learning Journey Metaphor | Metaphor alignment | Case studies (Duolingo, Forest) | Design decision, bukan claim penelitian |

### 6.3 Semua Fitur Utama Memiliki Evidence

**Status:** ✅ Semua fitur utama sekarang memiliki evidence dari peer-reviewed sources atau strong theoretical foundation.

---

## 7. Summary: All Features

### 7.1 Fitur yang TIDAK Perlu Perubahan
- Add/Edit/Delete/Archive tasks
- Title, description
- Difficulty, priority
- Links
- Task distribution chart
- JWT auth & admin

### 7.2 Fitur Baseline yang Perlu ENHANCEMENT

| **Fitur Baseline** | **Enhancement** | **Alberts et al.** | **SDT Target** | **Kenapa Perlu** |
| --- | --- | --- | --- | --- |
| 4 Kolom SRL | + Progress bar per kolom | *Progress Tracking* | Competence | Visual feedback progress |
| Drag & drop | + Swipe option (mobile) | *Flexible Means* | Autonomy | Mobile-first UX |
| Course selection | → Free input + suggestion | *Choice in Task* | Autonomy | Menghilangkan ketergantungan admin |
| Learning strategy | + Effectiveness feedback | *Informed Decision Making* | Competence | Data-driven optimization |
| Checklists | + Immediate feedback animation | *Positive Feedback + CET* | Competence | Reinforce behavior |
| Pre/Post test | + Improvement visualization | *Self-Monitoring* | Competence | Data jadi actionable |
| Notes | → Guided reflection (metacognition) | **Prompt Reflection** | Competence + Relatedness | Metacognitive awareness + goal connection |
| Timer | + Personal best tracking | **Self-Monitoring** | Competence | Self-referential comparison |
| Session history | + Productive time insights | *Self-Monitoring + Informed Decision* | Competence | Actionable insights |
| Progress summary | + Trend over time | *Self-Monitoring* | Competence | Longitudinal view |
| Course performance | + Improvement trend | *Self-Monitoring* | Competence | Track growth per course |
| Star Rating | → Confidence Level | *Self-Monitoring* | Competence | Self-efficacy awareness |

### 7.3 Fitur BARU yang Ditambahkan

| **Fitur Baru** | **Alberts et al.** | **SDT Target** | **Evidence** | **Priority** |
| --- | --- | --- | --- | --- |
| **Scaffolding & Onboarding Tour** | **Tutorials + Structure** | **Competence** | **Ryan & Deci (2020) + Baseline Validation** | **TIER 1** |
| Push Notification | *Reminders from Digital Assistant* | Trigger | Karaali (2025) | High |
| Smart Reminder | *Manual Reminders* | Trigger + Autonomy | Karaali (2025) | High |
| **Social Presence Notification** | *Social Support (implied)* | **Relatedness** | **Cialdini (2009), Plak (2023)** | **High** |
| Notification Preferences | *Customisation* | Autonomy | Ryan & Deci (2020) | High |
| Progress Bar per Kolom | *Progress Tracking* | Competence | Sailer (2017) | High |
| Badges (Milestone) | *Rewards / Celebration* | Competence | Sailer (2017) | High |
| Streaks (Forgiving) | *Self-Monitoring* | Autonomy | Agrawal (2023) + Gao (2024) | Medium |
| Completion Celebration | **Positive Feedback + Celebration** | Competence | Alberts #16, #48 | High |
| **Goal Hierarchy System** | **Explain Value + Guided Goal-Setting** | **OIT + Competence + Relatedness** | **Alberts #27, #15** | **TIER 1** |
| Goal Completion Check | **Prompt Reflection** | Competence + Relatedness | Alberts #22 | High |
| Theme Customization | *Customisation* | Autonomy | Ryan & Deci (2020) | Medium |
| Actionable Insights | *Informed Decision Making* | Competence | FLoRA (2024) | Medium |
| Encouragement Messages | **Encouragement** | Competence | Alberts #17 | High |

**Note:** Goal Hierarchy System menggabungkan "Explain Value" + "Goal Prompt" menjadi 3-level goal system (general → course → task) dengan 90% friction reduction.

### 7.4 SDT Coverage: Before vs After

**Before (Baseline):**
```
AUTONOMY     [████████░░] 80%
COMPETENCE   [████░░░░░░] 40%  ← GOLDEN GAP
RELATEDNESS  [░░░░░░░░░░]  0%  ← No social features
```

**After (Enhanced):**
```
AUTONOMY     [██████████] 100%  (+20%)
COMPETENCE   [█████████░] 90%   (+50%) ← MAIN FOCUS
RELATEDNESS  [███░░░░░░░] 30%   (+30%) ← Minimal via dual-purpose
```

**Total Enhancement Impact:** 220/300 = **73% SDT coverage**

**Relatedness Breakdown (30%):**
- 20%: Dual-purpose features (Guided Reflection, Goal Prompts, Explain Value)
- 10%: Social Presence Notification (subtle social element)

**Evidence-Based Prioritization:**
- **High Priority:** Autonomy (100%) + Competence (90%) - strong evidence
- **Low Priority:** Relatedness (30%) - weak evidence di digital (Lüking 2023), implemented untuk theoretical completeness

---

## 8. Implementation Priorities

### TIER 1 (MUST HAVE - Core Enhancement)
1. **Scaffolding & Onboarding Tour** (Structure & Scaffolding - mencegah cognitive overload, foundational enabler)
   - Progressive onboarding flow (3-step setup)
   - Contextual help overlay (on-demand)
   - Inline tooltips (lightweight)
   - **Why TIER 1:** Menjawab validasi pakar baseline research + Ryan & Deci (2020) Structure principle
2. **Goal Hierarchy System** (OIT core - value internalization dengan 90% friction reduction)
   - General Goal (onboarding)
   - Course Goal (per course)
   - Goal Resolution Logic
3. **Guided Reflection** (Metacognitive awareness - SRL core + minimal Relatedness)
   - Q1+Q2 mandatory (low friction)
   - Q3 optional
4. Improvement Visualization (Competence core - Golden Gap)
5. Completion Celebration (Competence reinforcement)
6. Push Notification + Smart Reminder (Behavioral trigger)
7. **Social Presence Notification** (Minimal Relatedness - LOW complexity, HIGH impact)
8. Progress Bar per Kolom (Visual feedback)

### TIER 2 (HIGH VALUE - Significant Impact)
9. Personal Best Tracking
10. Encouragement Messages
11. Goal Completion Check (emoji rating)
12. Badges (Milestone only)
13. Course Free Input
14. Confidence Level (Self-efficacy tracking)
15. Strategy Effectiveness Dashboard (from reflection Q1)
16. Confidence Trend Analysis (from reflection Q2)

### TIER 3 (POLISH - UX Enhancement)
17. Immediate Feedback Animation (Checklists)
18. Streaks (Forgiving design)
19. Theme Customization
20. Learning Journey Wrapper (design system)

---

## 9. Key Insights & Theoretical Positioning

### 9.1 Why Focus on Competence?

1. **Bureau et al. (2022):** Competence = strongest predictor (43% variance)
2. **Li et al. (2024):** Gamification weak at competence (g=0.277)
3. **The Golden Gap:** Most important need + weakest in gamification = biggest opportunity
4. **Bureau et al. (2022) Critical Insight:** "Competence memfasilitasi internalisasi" → OIT integration

### 9.2 Why OIT Integration?

1. **Alberts et al. (2024):** OIT orientation = sustainable motivation
2. **Gao (2024):** Autonomous-Motivation Gamification > Controlled-Motivation Gamification
3. **Long-term sustainability:** Value internalization persists beyond BCT
4. **Bureau et al. (2022):** Competence facilitates internalization → OIT features support Competence

### 9.3 Evidence-Based Prioritization: Why Low Priority Relatedness?

**Critical Evidence:**
1. **Lüking et al. (2023):** Relatedness **NOT significant** in digital individual apps
   - Only Autonomy and Competence significant in digital context
2. **Li et al. (2024):** Relatedness g=1.776 TAPI dari **social gamification** (team work, competition)
   - Our app = individual, NOT social

**Strategy:**
- **Primary Focus:** Autonomy (100%) + Competence (90%) - evidence strong
- **Minimal Relatedness (30%):** Untuk theoretical completeness, NOT primary driver

**Implementation Approach:**
1. **Dual-Purpose Features (20%):**
   - Guided Reflection: **Primary = Competence** (metacognition), **Secondary = Relatedness** (goal connection)
   - Explain Value: **Primary = OIT**, **Secondary = Relatedness** (meaning-making)

2. **Subtle Social Element (10%):**
   - Social Presence Notification: **Descriptive norm** (informational), NOT competitive
   - Anonymized, non-competitive, user-controlled

**Defense Mechanism:**
> "Berdasarkan Bureau et al. (2022), Competence memfasilitasi internalisasi. Fitur Goal Connection dan Reflection dirancang sebagai Enhanced Competence untuk membangun efficacy, agar mahasiswa menginternalisasi nilai belajar secara mandiri, tanpa bergantung pada dorongan sosial (Relatedness) yang terbukti kurang efektif di digital individual apps (Lüking et al., 2023)."

**Theoretical Completeness:**
- Mengakui 3 basic needs SDT (theoretical soundness)
- Evidence-based prioritization (pragmatic approach)
- Minimal implementation untuk completeness, NOT primary driver

### 9.4 Framework Summary

```
3 Gaps → 3 Solutions
├─ Gap 1: Behavioral Triggers → Push Notif + Smart Reminder + Social Presence
├─ Gap 2: Gamification → Meaningful badges + streaks + wrapper
└─ Gap 3: Competence (GOLDEN GAP) → Visualization + Feedback + OIT

Evidence-Based Prioritization:
├─ High Priority: Autonomy (100%) + Competence (90%)
└─ Low Priority: Relatedness (30%) - dual-purpose + subtle social

OIT Cross-Cutting:
├─ Explain Value → internalize task value
└─ Guided Reflection → metacognitive awareness (SRL) + goal connection

Result:
├─ Autonomy: 80% → 100%
├─ Competence: 40% → 90% (MAIN ACHIEVEMENT)
├─ Relatedness: 0% → 30% (theoretical completeness)
└─ Target: 20% → 50%+ active users
```

---

*Document Version: 6.1*
*Last Updated: March 14, 2026*
*Status: Evidence-Based Prioritization - Dual-Purpose Framing + Minimal Relatedness via Subtle Social Element*
