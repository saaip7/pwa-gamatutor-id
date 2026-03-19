# Metodologi Penelitian: Kanban Learning Board dengan SDT

*Version: 1.0 | Created: February 9, 2026*
*Design: Quasi-Experimental Pre-Post with Historical Control*

---

## 1. Research Design

### 1.1 Design Overview

Penelitian ini menggunakan **quasi-experimental design dengan pre-post measurement** (one-group pretest-posttest design). Design ini dipilih berdasarkan pertimbangan:

**Rationale:**
- ✅ **Praktis:** Timeline ketat (3 weeks development + 6 weeks data collection)
- ✅ **Valid:** Pre-post design adalah legitimate research design untuk applied research (Campbell & Stanley, 1963)
- ✅ **Comparable:** Baseline data dari Azmi (2024) tersedia sebagai **historical control** untuk konteks komparatif
- ✅ **Ethical:** Semua partisipan mendapat "treatment" (enhanced app), tidak ada yang dirugikan

**Design Structure:**
```
Mahasiswa Semester 2 (n = 50-60)
    ↓
T0 (Pre-test): UMI, BPNS, Demographics
    ↓
Intervention (Week 1-6): Gunakan enhanced app dengan TIER 1 features
    ↓
T2 (Post-test): UMI, BPNS, Qualitative feedback
    ↓
Activity Logs Analysis (continuous throughout)
```

**Comparison Strategy:**
1. **Within-group comparison:** Pre (T0) vs Post (T2) untuk same participants
2. **Historical comparison:** Engagement metrics vs Azmi (2024) baseline (~30%)

**Threats to Internal Validity & Mitigation:**

| Threat | Description | Mitigation Strategy |
|--------|-------------|---------------------|
| **Maturation** | Partisipan jadi lebih mature selama 6 minggu | Short duration (6 weeks) minimizes this; focus on motivation change (not knowledge) |
| **Testing Effect** | Pre-test influence post-test responses | Use validated scales (UMI, BPNS) with established test-retest reliability |
| **History** | External events during study period | Monitor for confounding events (e.g., exam period); document in limitation section |
| **Regression to Mean** | Extreme scores tend to regress | Not selecting based on extreme scores; random recruitment |
| **Instrumentation** | Changes in measurement | Use same instruments at T0 and T2; standardized administration |

**Why No Control Group?**

**Practical Constraints:**
- Timeline: Mar 1 deployment (3 weeks prep) → managing 2 groups doubles complexity
- Sample size: Control group requires n=80-100 (vs n=50-60 without control)
- Development: Focus on 1 polished version vs 2 versions (baseline + enhanced)

**Methodological Justification:**
- **Historical control available:** Azmi (2024) dengan n=123, same population (semester 2), same context
- **Pre-post adequate for RQ:** Main RQ tentang "meningkatkan engagement" - dapat dijawab dengan pre-post + historical comparison
- **Precedent:** Banyak educational technology research menggunakan pre-post design (Karaali, 2025; Plak, 2023)

**Quote untuk defense:**
> "Penelitian ini menggunakan quasi-experimental design dengan pre-post measurement. Historical baseline data dari Azmi (2024) dengan n=123 partisipan pada populasi yang sama (mahasiswa semester 2) menyediakan konteks komparatif untuk evaluasi efektivitas intervention, sekaligus memenuhi standar ethical research dengan memastikan semua partisipan mendapat enhanced experience."

---

## 2. Research Questions

### 2.1 Main Research Question

**"Bagaimana integrasi Behavioral Triggers, Meaningful Gamification, dan Enhanced Competence Design dapat meningkatkan engagement mahasiswa secara sustainable dalam konteks self-regulated learning?"**

### 2.2 Specific Sub-Research Questions

**Sub-RQ 1 (Behavioral Gap):**
"Bagaimana implementasi Behavioral Triggers (melalui Push Notification dan Smart Reminder) dapat mengatasi hambatan perilaku pasif untuk meningkatkan frekuensi dan kualitas interaksi mahasiswa dengan aplikasi?"

**Sub-RQ 2 (Motivation Quality Gap):**
"Bagaimana desain Meaningful Gamification (tanpa Leaderboard, fokus pada Meaningful Choices & Learning Journey) dapat memfasilitasi pergeseran kualitas motivasi mahasiswa menuju Autonomous Motivation secara sustainable?"

**Sub-RQ 3 (Golden Gap):**
"Bagaimana strategi Enhanced Competence Design (melalui Scaffolding & Onboarding, Visualisasi Progres, dan Guided Reflection) dapat meningkatkan Competence Need Satisfaction mahasiswa dalam konteks self-regulated learning?"

**Detail lengkap:** Lihat `RQ.md` dan `narasi-penelitian.md` Section 9

---

## 3. Participants & Sampling

### 3.1 Population

**Target Population:** Mahasiswa aktif semester 2 di Program Studi Informatika/Sistem Informasi (atau program studi sejenis yang menawarkan mata kuliah dengan karakteristik Self-Regulated Learning yang tinggi).

**Rationale:**
- **Comparability:** Same population dengan Azmi (2024) - memastikan apples-to-apples comparison
- **Academic maturity:** Semester 2 = sudah familiar dengan SRL demands, tapi belum terlalu advanced (masih improvement space)
- **Course complexity:** Semester 2 courses (e.g., Algoritma, Struktur Data, Basis Data) = optimal balance antara challenging namun accessible

### 3.2 Sample Size

**Target Sample Size:** n = 50-60 partisipan

**Justification (Power Analysis):**

Untuk **paired t-test** (pre vs post comparison):
- **Expected effect size:** d = 0.5 (medium effect, based on Li et al. 2024 meta-analysis: g=0.277-1.776)
- **Power (1-β):** 0.80 (standar)
- **Alpha (α):** 0.05 (two-tailed)
- **Required n:** ~34 (Cohen, 1988)

**Dengan attrition 20-25%:**
- Target recruitment: n = 50-60
- Expected completion: n = 40-48
- **Meets power requirement:** 40-48 > 34 ✅

**Comparison dengan Baseline:**
- Azmi (2024): n = 123 enrolled
  - 30.1% completion (n ≈ 37 completed tasks)
  - 35.8% never used (n ≈ 44 dropouts)
- Our target: n = 50-60 (40-48 expected completion)
- **Adequate untuk comparison**

### 3.3 Sampling Method

**Non-Probability Purposive Sampling** (convenience sampling with inclusion criteria)

**Recruitment Strategy:**
1. **Koordinasi dengan dosen mata kuliah** (e.g., Algoritma, Struktur Data, Basis Data)
2. **In-class announcement** - penjelasan singkat tentang penelitian + informed consent
3. **Online recruitment form** (Google Forms) dengan screening questions
4. **Incentive:** Early access ke app + Sertifikat partisipasi penelitian

**Inclusion Criteria:**
- ✅ Mahasiswa aktif semester 2
- ✅ Mengambil minimal 1 mata kuliah dengan tugas terstruktur (suitable untuk Kanban)
- ✅ Memiliki smartphone (Android/iOS) atau akses regular ke web browser
- ✅ Bersedia menggunakan aplikasi selama 6 minggu
- ✅ Bersedia mengisi kuesioner pre-test dan post-test

**Exclusion Criteria:**
- ❌ Pernah berpartisipasi dalam penelitian Azmi (2024) - baseline study
- ❌ Cuti akademik atau dropout selama periode penelitian
- ❌ Tidak memberikan informed consent

### 3.4 Attrition Management

**Expected Attrition:** 20-25% (based on Azmi 2024: 35.8% never used)

**Mitigation Strategies:**
1. **Onboarding engagement:** Scaffolding Tour untuk build early engagement (reduce immediate dropout)
2. **Mid-point check-in (Week 3):** Quick reminder message + engagement check
3. **Smart Reminder:** Push notification untuk re-engage inactive users (RQ1 feature = double function)
4. **Low burden:** Kuesioner < 20 menit untuk minimize participant fatigue

**Attrition Analysis:**
- Compare characteristics completers vs non-completers (demographics, T0 scores)
- Intention-to-treat analysis: Include all enrolled participants in descriptive stats
- Per-protocol analysis: Only completers untuk pre-post comparison (primary analysis)

---

### 4.3 Complete Feature List (26 Features - ALL Implemented)

**Implementation Approach:** Phased deployment berdasarkan priority levels dan dependencies.

---

## **PHASE 1: Foundation & Critical (P0) - Week 1-2**

| # | Feature | Gap | RQ | Dev Time | Cumulative |
|---|---------|-----|----|---------:|------------|
| **1** | **Scaffolding & Onboarding Tour** | 🟠 Gap 3 | Sub-RQ 3 | 3-4 days | Day 3-4 |
| | - Welcome + 3-step setup (General Goal → First Task → Feature Tour) | | | |
| | - Contextual help (icon "?") + inline tooltips | | | |
| | - Evidence: Ryan & Deci (2020) Structure + Baseline validation | | | |
| **2** | **Goal Hierarchy System** | 🟢 Gap 2 | Sub-RQ 2 | 5-6 days | Day 9-10 |
| | - 3-level hierarchy (General → Course → Task) | | | |
| | - Resolution logic (fallback) + display on task detail | | | |
| | - Evidence: Alberts #27 (Explain Value) + Festinger (1957) | | | |
| **3** | **Course Free Input** | 🟢 Gap 2 | Sub-RQ 2 | 1 day | Day 10-11 |
| | - Remove dropdown restriction → free text field | | | |
| | - Evidence: Ryan & Deci (2020) Choice = Autonomy | | | |

**Phase 1 Total:** 9-11 days (Week 1.5)

---

## **PHASE 2: Competence Core (P0-P1) - Week 2-3**

| # | Feature | Gap | RQ | Dev Time | Cumulative |
|---|---------|-----|----|---------:|------------|
| **4** | **Guided Reflection (Notes → Enhanced)** | 🟠 Gap 3 | Sub-RQ 3 | 3-4 days | Day 13-15 |
| | - Q1: Strategi apa? (dropdown) | | | |
| | - Q2: Seberapa efektif? (emoji 1-5) | | | |
| | - Q3: Seberapa yakin? (emoji 1-5) = Confidence Level | | | |
| | - Q4: Apakah membantu tujuan? (optional, text) | | | |
| | - Triggered saat task → Done | | | |
| | - Evidence: Alberts #22 (Prompt Reflection), Zimmerman (2002) | | | |
| **5** | **Improvement Visualization (Pre/Post → Enhanced)** | 🟠 Gap 3 | Sub-RQ 3 | 4-5 days | Day 17-20 |
| | - Per-task improvement: Pre: 60% → Post: 85% (+25%!) | | | |
| | - Trend over time (line chart: task1, task2, task3) | | | |
| | - Per-course breakdown | | | |
| | - Evidence: Sailer (2017) Performance graphs | | | |
| **6** | **Strategy Effectiveness Dashboard** | 🟠 Gap 3 | Sub-RQ 3 | 2-3 days | Day 22-23 |
| | - From Reflection Q1+Q2 data | | | |
| | - "Video tutorial: 85% avg improvement (12x)" | | | |
| | - Hybrid approach (subjective + objective fallback) | | | |
| | - Evidence: Alberts #24 (Informed Decision Making) | | | |

**Phase 2 Total:** 9-12 days (Week 2)
**Cumulative:** 18-23 days (Week 3)

---

## **PHASE 3: Behavioral Triggers (P1) - Week 3-4**

| # | Feature | Gap | RQ | Dev Time | Cumulative |
|---|---------|-----|----|---------:|------------|
| **7** | **Push Notification System** | 🔵 Gap 1 | Sub-RQ 1 | 5-6 days | Day 27-29 |
| | - 3 types: Deadline (24h before), Pending (3 days no activity), Encouragement (after improvement) | | | |
| | - Backend: Firebase Cloud Messaging atau OneSignal | | | |
| | - Permission handling (browser/mobile) | | | |
| | - Evidence: Karaali (2025) Push notif effectiveness | | | |
| **8** | **Smart Reminder (Personalized Timing)** | 🔵 Gap 1 | Sub-RQ 1 | 2-3 days | Day 31-32 |
| | - Detect productive hour: MODE(completion_history.hour) | | | |
| | - Send reminder at user's productive time | | | |
| | - Evidence: Plak (2023) Personalized > Generic | | | |
| **9** | **Notification Preferences (Settings)** | 🟢 Gap 2 | Sub-RQ 2 | 1-2 days | Day 33-34 |
| | - Checkboxes: Deadline, Smart, Encouragement, Social | | | |
| | - Frequency: Daily/Weekly | | | |
| | - Evidence: Ryan & Deci (2020) Autonomy = Choice | | | |

**Phase 3 Total:** 8-11 days (Week 1.5)
**Cumulative:** 26-34 days (Week 4-5)

---

## **PHASE 4: Meaningful Gamification (P1) - Week 4-5**

| # | Feature | Gap | RQ | Dev Time | Cumulative |
|---|---------|-----|----|---------:|------------|
| **10** | **Progress Bar per Kolom** | 🟠 Gap 3 | Sub-RQ 3 | 2 days | Day 35-36 |
| | - Visual indicator: Planning (3/5) ▓▓▓▓▓▓░░░░ 60% | | | |
| | - Per column header (Planning, Monitoring, Controlling, Reflection) | | | |
| | - Evidence: Sailer (2017) Progress tracking | | | |
| **11** | **Completion Celebration** | 🟠 Gap 3 | Sub-RQ 3 | 3-4 days | Day 38-40 |
| | - Confetti animation (Canvas Confetti library) | | | |
| | - Context-aware messages (based on improvement %) | | | |
| | - Celebration hierarchy: Small/Medium/Big win | | | |
| | - Evidence: Alberts #16 (Positive Feedback), #48 (Celebration) | | | |
| **12** | **Badges (Milestone Only)** | 🟢 Gap 2 | Sub-RQ 2 | 3-4 days | Day 41-44 |
| | - Milestones: First task, 10 tasks, 50 tasks, Consistent improver (+20% avg) | | | |
| | - Meaningful (NOT transactional points) | | | |
| | - Display in profile | | | |
| | - Evidence: Sailer (2017) Badges → Competence | | | |
| **13** | **Social Presence Notification** | 🟢 Gap 2 | Sub-RQ 2 | 2-3 days | Day 46-47 |
| | - Toast: "12 students completed tasks today" | | | |
| | - Anonymized count only (privacy) | | | |
| | - Opt-in setting | | | |
| | - Evidence: Cialdini (2009) Social proof, Plak (2023) | | | |

**Phase 4 Total:** 10-13 days (Week 2)
**Cumulative:** 36-47 days (Week 6-7)

---

## **PHASE 5: Enhanced Competence Support (P1-P2) - Week 5-6**

| # | Feature | Gap | RQ | Dev Time | Cumulative |
|---|---------|-----|----|---------:|------------|
| **14** | **Personal Best Tracking (Timer → Enhanced)** | 🟠 Gap 3 | Sub-RQ 3 | 2-3 days | Day 48-50 |
| | - Store MAX(session_duration) per user | | | |
| | - Display: "Personal Best: 2h 15m (Algoritma - 3 hari lalu)" | | | |
| | - Encouragement: "Kamu 67% menuju record barumu!" | | | |
| | - Evidence: Alberts #23 (Self-Monitoring) | | | |
| **15** | **Encouragement Messages** | 🟠 Gap 3 | Sub-RQ 3 | 2-3 days | Day 51-53 |
| | - When post < pre: "Tidak apa-apa! Belajar adalah proses..." | | | |
| | - Supportive framing (not judgmental) | | | |
| | - Evidence: Alberts #17 (Encouragement) | | | |
| **16** | **Pattern Detection & Insights (Session History → Enhanced)** | 🟠 Gap 3 | Sub-RQ 3 | 3-4 days | Day 54-57 |
| | - Productive time: MODE(completion_hour) | | | |
| | - Productive day: MODE(day_of_week) | | | |
| | - Simple rule-based (no AI/ML) | | | |
| | - Evidence: FLoRA (2024) simplified approach | | | |
| **17** | **Confidence Trend Analysis** | 🟠 Gap 3 | Sub-RQ 3 | 2 days | Day 58-59 |
| | - From Reflection Q3 (confidence rating) | | | |
| | - Line chart: Confidence over tasks | | | |
| | - Detect trend: increasing/decreasing/stable | | | |
| | - Evidence: Bandura (1997) Self-efficacy tracking | | | |

**Phase 5 Total:** 9-12 days (Week 2)
**Cumulative:** 45-59 days (Week 7-8)

---

## **PHASE 6: Polish & UX Enhancements (P2-P3) - Week 6-7**

| # | Feature | Gap | RQ | Dev Time | Cumulative |
|---|---------|-----|----|---------:|------------|
| **18** | **Immediate Feedback Animation (Checklists → Enhanced)** | 🟠 Gap 3 | Sub-RQ 3 | 1-2 days | Day 60-61 |
| | - Checkmark animation saat item checked | | | |
| | - Micro-interaction (smooth, not distracting) | | | |
| | - Evidence: Sailer (2017) CET principles | | | |
| **19** | **Streaks (Forgiving Design)** | 🟢 Gap 2 | Sub-RQ 2 | 3-4 days | Day 62-65 |
| | - "X days in a row" dengan freeze option (1 day skip allowed) | | | |
| | - Forgiving = avoid Introjected Regulation | | | |
| | - Evidence: Agrawal (2023) Habit formation, Gao (2024) | | | |
| **20** | **Theme Customization** | 🟢 Gap 2 | Sub-RQ 2 | 2-3 days | Day 66-68 |
| | - Color themes: Light, Dark, Blue, Green | | | |
| | - Persist preference (localStorage) | | | |
| | - Evidence: Ryan & Deci (2020) Autonomy = Choice | | | |
| **21** | **Goal Completion Check (Emoji Rating)** | 🟢 Gap 2 | Sub-RQ 2 | 1 day | Day 68-69 |
| | - After task done: "Apakah task ini membantu tujuanmu?" [😟😐😊😁🤩] | | | |
| | - Track alignment antara task completion & goal | | | |
| | - Evidence: Alberts #22 (Prompt Reflection) | | | |
| **22** | **Swipe Navigation (Drag & Drop → Enhanced)** | 🟢 Gap 2 | P3 | 2-3 days | Day 70-72 |
| | - Mobile-first: Swipe left/right untuk move task | | | |
| | - Fallback: Drag & drop tetap ada (desktop) | | | |
| | - Evidence: Mobile UX best practice | | | |
| **23** | **Autocomplete Suggestion (Course Input)** | 🟢 Gap 2 | P3 | 2 days | Day 73-74 |
| | - Suggest dari course history (user's previous courses) | | | |
| | - Simple autocomplete (no external API) | | | |
| | - Evidence: UX convenience | | | |

**Phase 6 Total:** 11-15 days (Week 2)
**Cumulative:** 56-74 days (Week 9-10)

---

## **ADDITIONAL ENHANCEMENTS (Integrated with Baseline)**

| # | Enhancement | Baseline Feature | Implementation | Dev Time | Phase |
|---|-------------|------------------|----------------|----------|-------|
| **24** | **Learning Strategy → Effectiveness Feedback** | Learning strategy dropdown | Already counted in #6 (Strategy Dashboard) | Included | Phase 2 |
| **25** | **Progress Summary → Trend Over Time** | Progress summary page | Already counted in #5 (Improvement Viz trend) | Included | Phase 2 |
| **26** | **Course Performance → Improvement Trend** | Course performance chart | Already counted in #5 (per-course breakdown) | Included | Phase 2 |

**Note:** Features #24-26 are enhancements to baseline features, already integrated into Features #5 and #6. Not separate development tasks.

---

### 4.4 Implementation Summary

**Total Features:** 26 (23 distinct dev tasks + 3 integrated enhancements)

**Total Development Time:** 56-74 days (8-10.5 weeks)

**Phased Breakdown:**
- **Phase 1 (P0 Foundation):** Week 1-2 (9-11 days)
- **Phase 2 (P0-P1 Competence Core):** Week 2-3 (9-12 days)
- **Phase 3 (P1 Behavioral):** Week 3-4 (8-11 days)
- **Phase 4 (P1 Gamification):** Week 4-5 (10-13 days)
- **Phase 5 (P1-P2 Enhanced Competence):** Week 5-6 (9-12 days)
- **Phase 6 (P2-P3 Polish):** Week 6-7 (11-15 days)

---

### 4.5 Priority Justification

#### **Why All Features Are Included:**

**Gap 1 Coverage (Behavioral Triggers):**
- ✅ Features #7-9: Push Notification + Smart Reminder + Preferences
- **RQ Impact:** Sub-RQ 1 requires behavioral metrics (Response Rate, DAU) → these features DIRECTLY enable measurement

**Gap 2 Coverage (Meaningful Gamification):**
- ✅ Features #2, #3, #9-13, #19-23: Goal Hierarchy, Badges, Social Presence, Streaks, Theme, etc.
- **CRITICAL:** Sub-RQ 2 asks "Bagaimana Meaningful Gamification... memfasilitasi pergeseran motivasi?"
- **Without these:** Cannot claim "Meaningful Gamification" implementation → Sub-RQ 2 unanswerable!

**Gap 3 Coverage (Enhanced Competence):**
- ✅ Features #1, #4-6, #10-11, #14-18: Scaffolding, Reflection, Visualization, Celebration, Personal Best, etc.
- **Golden Gap Focus:** Competence = strongest predictor (Bureau 2022), but gamification weak (Li 2024)
- Comprehensive competence support = core contribution

---

### 4.6 Dependencies & Critical Path

**Sequential Dependencies:**
1. **Phase 1 MUST complete first:** Scaffolding + Goal Hierarchy = foundation for all other features
2. **Phase 2 before Phase 4:** Guided Reflection generates data for Strategy Dashboard
3. **Phase 3 before Phase 5:** Push Notification infrastructure needed for Encouragement Messages
4. **Phases 5-6 flexible:** Can be parallelized or reordered

**Parallel Development Opportunities:**
- Frontend (UI components) + Backend (API, database) can proceed simultaneously
- Phase 4 (Gamification) + Phase 5 (Enhanced Competence) can overlap (different code areas)

---

### 4.7 Risk Mitigation

**Timeline Risk:**
- **Mitigation 1:** Prioritization allows for scope adjustment if needed (P3 features optional)
- **Mitigation 2:** Phase 6 can be delayed post-deployment (silent update)
- **Mitigation 3:** Weekly advisor check-ins to adjust timeline

**Technical Risk:**
- **Mitigation:** Use proven libraries (Chart.js, Canvas Confetti, Firebase) → reduce "unknown unknowns"
- **Testing:** Each phase has end-of-phase testing checkpoint

**Quality Risk:**
- **Mitigation:** Buffer days between phases for debugging
- **Code review:** Weekly code quality checks

---

### 4.8 Deployment Strategy

**Option A: Phased Deployment (Recommended)**
- Deploy Phase 1-3 (P0-P1 Critical) at Week 4
- Silent updates: Phase 4-6 every week afterward
- **Pros:** Users get stable core features early, incremental improvements
- **Cons:** Mid-study feature additions (potential confounding)

**Option B: Single Deployment**
- Deploy ALL features after Phase 6 completion (Week 10)
- **Pros:** No mid-study changes, clean experimental design
- **Cons:** Delayed start, longer development timeline

**Option C: MVP + Full (Hybrid)**
- Deploy P0-P1 (Phases 1-3) as MVP at Week 4 → Start data collection
- Deploy P2-P3 (Phases 4-6) as update at Week 7 (mid-study)
- **Pros:** Balance between early deployment & comprehensive features
- **Cons:** Some confounding, but documented

**Recommendation:** **Option C** - deploy core features early (answer critical RQs), add polish mid-study

---


## 5. Instruments & Measurement

### 5.1 Overview

| RQ | Instrument | Type | Measurement Points | Rationale |
|----|------------|------|-------------------|-----------|
| **Main RQ** | UMI (RAI) | Kuesioner | T0, T2 | Measure autonomous motivation |
| | BPNS (all needs) | Kuesioner | T0, T2 | Understand mechanism (3 SDT needs) |
| | Activity Logs | Objective | Continuous | Behavioral engagement (DAU, completion rate) |
| **Sub-RQ 1** | Activity Logs | Objective | Continuous | Response Rate, DAU, Session Duration, Task Completion |
| **Sub-RQ 2** | UMI (RAI) | Kuesioner | T0, T2 | Motivation quality shift |
| **Sub-RQ 3** | BPNS (Competence subscale) | Kuesioner | T0, T2 | Competence need satisfaction |
| | Confidence Check Logs | Objective | Per task | Confidence trend (proxy self-efficacy) |

---

### 5.2 User Motivation Inventory (UMI)

**Purpose:** Measure **quality of motivation** (Autonomous vs Controlled)

**Constructs Measured:**
- External Regulation (Controlled)
- Introjected Regulation (Controlled)
- Identified Regulation (Autonomous)
- Integrated Regulation (Autonomous)

**Scale:** 5-point Likert (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)

**Number of Items:** ~20 items (5 items per construct)

**Example Items (Translated to Bahasa Indonesia):**

| Construct | Example Item |
|-----------|--------------|
| External Regulation | "Saya menggunakan aplikasi ini karena saya HARUS melakukannya untuk nilai" |
| Introjected Regulation | "Saya akan merasa BERSALAH jika saya tidak menggunakan aplikasi ini" |
| Identified Regulation | "Saya menggunakan aplikasi ini karena saya SADAR ini penting untuk belajar saya" |
| Integrated Regulation | "Menggunakan aplikasi ini SEJALAN dengan nilai dan tujuan hidup saya" |

**Scoring:**
- Calculate mean for each construct (1-5)
- **RAI (Relative Autonomy Index):**
  ```
  RAI = (3 × Integrated) + (1 × Identified)
        - (1 × Introjected) - (3 × External)

  Range: -12 to +12
  Interpretation:
  - RAI > 0 → Autonomous motivation dominan ✅
  - RAI < 0 → Controlled motivation dominan ❌
  ```

**Evidence Base:**
- Ryan & Deci (2000, 2020) - SDT framework
- Validated in multiple educational contexts (Van den Broeck et al., 2021)

**Reliability:** Cronbach's α typically > 0.70 for each subscale

---

### 5.3 Basic Psychological Need Satisfaction Scale (BPNS)

**Purpose:** Measure satisfaction of **3 basic needs** (Autonomy, Competence, Relatedness)

**Constructs Measured:**
- Autonomy (7 items)
- Competence (7 items) ← PRIMARY FOCUS for RQ3
- Relatedness (7 items)

**Scale:** 5-point Likert (1 = Sangat Tidak Setuju, 5 = Sangat Setuju)

**Total Items:** 21 items

**Example Items (Focus: Competence):**

| Construct | Example Item |
|-----------|--------------|
| Competence | "Saya merasa MAMPU menguasai materi yang saya pelajari" |
| | "Saya merasa KOMPETEN dalam menggunakan strategi belajar yang efektif" |
| | "Saya merasa saya telah membuat PROGRESS yang signifikan dalam belajar saya" |

**Scoring:**
- Calculate mean for each subscale (1-5)
- Higher score = higher need satisfaction
- **Target for RQ3:** Competence subscale ≥4.0 (high satisfaction)

**Evidence Base:**
- Ryan & Deci (2000) - Basic need theory
- Bureau et al. (2022) - Competence = strongest predictor (43% variance)

**Reliability:** Cronbach's α typically 0.70-0.85

---

### 5.4 Activity Logs (Objective Behavioral Data)

**Purpose:** Measure **behavioral engagement** (frequency & quality of interaction)

**Data Captured (Automatic logging in database):**

| Metric | Definition | Calculation | Target |
|--------|------------|-------------|--------|
| **Response Rate** | Speed of opening app after notification | Time between notification sent & app opened | ≥60% within 30 min |
| **DAU (Daily Active Users)** | % users who open app daily | (Users active today / Total users) × 100 | ≥50% (vs baseline 30%) |
| **Session Duration** | Time spent in app per session | Logout timestamp - Login timestamp | ≥5 minutes (meaningful engagement) |
| **Task Completion Rate** | % tasks moved to "Done" | (Completed tasks / Total created) × 100 | ≥70% (vs baseline ~30%) |
| **Confidence Trend** | Self-reported confidence (Q3 in Reflection) | Mean confidence rating over time | Increasing trend T0 → T2 |
| **Onboarding Completion** | % users who complete onboarding tour | (Completed onboarding / Total signups) × 100 | ≥80% |

**Data Export:** CSV from MongoDB database at T2 (Week 6)

**Privacy:** User ID anonymized (UUID), no personally identifiable information

---

### 5.5 Qualitative Data (Open-ended Feedback)

**Purpose:** Contextualize quantitative findings, gather UX feedback

**Instrument:** Post-test questionnaire (T2)

**Questions:**
1. "Fitur mana yang paling membantu kamu dalam belajar? Kenapa?"
2. "Fitur mana yang paling TIDAK berguna? Kenapa?"
3. "Apakah ada hal yang mengganggu atau membuat kamu tidak mau pakai app?"
4. "Apakah kamu akan terus pakai app ini setelah penelitian selesai? Kenapa?"
5. "Saran untuk perbaikan app?"

**Analysis:** Thematic analysis (coding untuk recurring themes)

**Usage:** Discussion section - explain WHY metrics change or don't change

---

### 5.6 Demographics & Baseline Info

**Collected at T0:**
- Jenis kelamin
- Umur
- Program Studi
- IPK saat ini (self-reported)
- Mata kuliah yang diambil semester ini (untuk task context)
- Pengalaman sebelumnya dengan SRL tools (0-5 scale: tidak ada - sangat berpengalaman)
- Device yang akan digunakan (Android / iOS / Web)

**Usage:**
- Descriptive statistics
- Check for baseline equivalence (compare completers vs non-completers)
- Control variables (if needed for regression analysis)


---

## 7. Data Analysis Plan

### 7.1 Data Preparation

**Step 1: Data Cleaning**
- Check for missing data (UMI, BPNS items)
  - If missing < 10% of scale: Mean imputation (within subscale)
  - If missing > 10%: Exclude participant from that analysis
- Check for outliers (Z-score > ±3.0)
  - Investigate case-by-case (data entry error? Genuine response?)
- Reverse-code negatively worded items (if any in BPNS)

**Step 2: Calculate Composite Scores**
- **UMI:** Mean per subscale (External, Introjected, Identified, Integrated)
- **RAI:** (3 × Integrated) + (1 × Identified) - (1 × Introjected) - (3 × External)
- **BPNS:** Mean per subscale (Autonomy, Competence, Relatedness)

**Step 3: Activity Logs Processing**
- Export CSV from MongoDB
- Calculate aggregate metrics:
  - DAU (per user, per week)
  - Response Rate (notification → app open time)
  - Task Completion Rate (completed / created)
  - Session Duration (mean per user)
  - Confidence Trend (mean Q3 rating over time)

**Software:**
- SPSS v28 (or R for advanced analysis)
- Python (pandas) for logs processing
- Excel for initial exploration

---

### 7.2 Descriptive Statistics

**For All Variables:**
- Mean (M), Standard Deviation (SD)
- Range (Min - Max)
- Frequency distributions
- Histograms & boxplots (check normality)

**Baseline Characteristics (T0):**
- Demographics (gender, age, GPA, program studi)
- UMI scores (4 subscales + RAI)
- BPNS scores (3 subscales)

**Comparison: Completers vs Non-completers**
- Independent t-test (untuk continuous variables: age, GPA, T0 scores)
- Chi-square test (untuk categorical: gender, program studi)
- **Purpose:** Check if attrition is random or systematic

---

### 7.3 Inferential Statistics

#### **Main RQ: Sustainable Engagement**

**Hypothesis:**
- H0: Tidak ada peningkatan engagement dari baseline (30%)
- H1: Ada peningkatan engagement signifikan (>30%)

**Analysis:**

1. **RAI Pre-Post Comparison** (Quality of motivation):
   ```
   Paired t-test:
   - DV: RAI score
   - IV: Time (Pre vs Post)
   - H1: RAI_post > RAI_pre (one-tailed)
   ```

2. **Behavioral Engagement Metrics:**
   ```
   One-sample t-test (compare to baseline):
   - H0: DAU = 30% (Azmi baseline)
   - H1: DAU > 30%

   Descriptive comparison:
   - Task Completion Rate: Current study vs Azmi (30.1%)
   ```

3. **BPNS (Mechanism):**
   ```
   Paired t-test (all 3 needs):
   - Autonomy: Pre vs Post
   - Competence: Pre vs Post
   - Relatedness: Pre vs Post
   ```

**Effect Size:** Cohen's d (small: 0.2, medium: 0.5, large: 0.8)

---

#### **Sub-RQ 1: Behavioral Gap**

**Metrics (Descriptive):**
- Response Rate: M, SD, % achieving ≥60% within 30 min
- DAU: M, SD, trend over 6 weeks (line chart)
- Session Duration: M, SD, % achieving ≥5 min
- Task Completion Rate: M, SD

**Statistical Test:**
```
One-sample t-test:
- H0: Task Completion Rate = 30% (baseline)
- H1: Task Completion Rate > 30%
```

**Visualization:**
- Line chart: DAU trend over 6 weeks (detect novelty effect drop)
- Histogram: Session Duration distribution

---

#### **Sub-RQ 2: Motivation Quality Gap**

**Analysis:**
```
Paired t-test (per subscale):
1. External Regulation: Pre vs Post
   - H1: External_post < External_pre (expect decrease)

2. Introjected Regulation: Pre vs Post
   - H1: Introjected_post < Introjected_pre

3. Identified Regulation: Pre vs Post
   - H1: Identified_post > Identified_pre

4. Integrated Regulation: Pre vs Post
   - H1: Integrated_post > Integrated_pre

Overall:
5. RAI: Pre vs Post
   - H1: RAI_post > RAI_pre
```

**Supplementary:**
- Wilcoxon signed-rank test (if data not normally distributed)
- % participants dengan RAI > 0 (autonomous motivation dominan)

---

#### **Sub-RQ 3: Golden Gap (Competence)**

**Analysis:**
```
Paired t-test:
1. BPNS Competence subscale: Pre vs Post
   - H1: Competence_post > Competence_pre

2. Confidence Check (from logs):
   - Trend analysis: Linear regression (Confidence ~ Week)
   - H1: Positive slope (confidence naik over time)
```

**Supplementary:**
- Correlation: BPNS Competence (T2) vs RAI (T2)
  - Hypothesis (from Bureau 2022): Competence correlates with autonomous motivation
- Onboarding completion rate: % completing tour ≥80%?

---

### 7.4 Qualitative Data Analysis

**Method:** Thematic Analysis (Braun & Clarke, 2006)

**Process:**
1. **Familiarization:** Read all open-ended responses (5 questions × 40-50 participants = ~200-250 responses)
2. **Coding:** Identify recurring themes
   - Example codes: "helpful visualization", "annoying notifications", "too many prompts"
3. **Themes:** Group codes into broader themes
   - Example themes: "Competence support effective", "Notification fatigue", "Reflection burden"
4. **Interpretation:** Link themes to RQs
   - "Why did RAI increase/not increase?"
   - "Which feature was most impactful?"

**Integration with Quantitative:**
- Use qualitative data to **explain** quantitative findings
- Example: If RAI increased → "Participants mentioned Goal Hierarchy helped them see meaning"
- Example: If DAU dropped after Week 3 → "Participants mentioned notification fatigue"

---

### 7.5 Statistical Assumptions & Alternatives

**For Paired t-test:**

**Assumptions:**
1. **Normality:** Shapiro-Wilk test (p > 0.05 = normal)
   - If violated → Use Wilcoxon signed-rank test (non-parametric)
2. **Independence:** Participants measured independently (✓ by design)
3. **Scale:** Interval/ratio data (Likert assumed interval)

**Significance Level:** α = 0.05 (two-tailed, unless directional hypothesis)

**Power:** 1-β = 0.80 (achieved with n ≥ 34, we have ~40-48)

---

## 8. Validity & Reliability

### 8.1 Internal Validity

**Threats & Mitigation:**

| Threat | Mitigation Strategy |
|--------|-------------------|
| **Maturation** | Short duration (6 weeks); focus on motivation change (not knowledge acquisition which requires longer) |
| **Testing Effect** | Use validated scales (UMI, BPNS) with established test-retest reliability; avoid mid-point full questionnaire |
| **History** | Monitor for external events (e.g., exam period, university policy changes); document in limitation |
| **Instrumentation** | Same instruments at T0 and T2; standardized digital administration (no interviewer bias) |
| **Selection Bias** | Random recruitment (within inclusion criteria); compare completers vs non-completers |
| **Attrition** | Mitigation strategies (onboarding, mid-point check, smart reminders); report attrition analysis |

---

### 8.2 External Validity

**Generalizability:**

**Population Validity:**
- **Target:** Mahasiswa semester 2 Informatika/SI
- **Generalizability:** Moderate
  - ✅ Dapat digeneralisasi ke: Mahasiswa IT/STEM semester awal dengan SRL demands
  - ❌ Terbatas untuk: Non-STEM majors, mahasiswa senior (different needs), non-university settings

**Ecological Validity:**
- ✅ **High:** Real-world usage (actual course tasks), natural setting (6 weeks)
- ✅ Intervention integrated ke daily study routine (not lab experiment)

**Temporal Validity:**
- ⚠️ **Moderate:** 6 weeks = short-term
- **Limitation:** Novelty effect belum dapat diukur fully (need longer study: 3-6 months)
- **Acknowledged in Discussion:** "Future research should examine long-term sustainability beyond 6 weeks"

---

### 8.3 Construct Validity

**Are we measuring what we claim to measure?**

**UMI (User Motivation Inventory):**
- ✅ **Construct validity:** Extensively validated (Ryan & Deci, 2000; Van den Broeck et al., 2021)
- ✅ **Discriminant validity:** 4 subscales show distinct constructs (External ≠ Introjected ≠ Identified ≠ Integrated)
- ✅ **Convergent validity:** RAI correlates with other motivation measures (e.g., intrinsic motivation scale)

**BPNS (Basic Psychological Need Satisfaction Scale):**
- ✅ **Construct validity:** Well-established (Ryan & Deci, 2000)
- ✅ **Discriminant validity:** 3 subscales measure distinct needs (Autonomy ≠ Competence ≠ Relatedness)
- ✅ **Predictive validity:** BPNS predicts well-being, engagement (Bureau et al., 2022)

**Activity Logs:**
- ✅ **Face validity:** DAU, Task Completion Rate = direct measures of engagement
- ✅ **Objective:** No self-report bias (automated logging)

---

### 8.4 Reliability

**Internal Consistency (Cronbach's α):**

| Scale | Subscale | Expected α | Acceptable? |
|-------|----------|-----------|-------------|
| UMI | External Regulation | 0.70-0.85 | ✅ |
| | Introjected Regulation | 0.70-0.80 | ✅ |
| | Identified Regulation | 0.75-0.85 | ✅ |
| | Integrated Regulation | 0.70-0.80 | ✅ |
| BPNS | Autonomy | 0.70-0.80 | ✅ |
| | Competence | 0.75-0.85 | ✅ |
| | Relatedness | 0.70-0.80 | ✅ |

**Criteria:** α ≥ 0.70 = acceptable (Nunnally & Bernstein, 1994)

**Action if α < 0.70:**
- Check item-total correlations (drop problematic items if α improves)
- Report in Limitations: "Reliability slightly below threshold, interpret with caution"

**Test-Retest Reliability:**
- NOT measured (no T1 full questionnaire to avoid testing effect)
- Rely on published reliability from literature

---

## 9. Ethical Considerations

### 9.1 Informed Consent

**Process:**
1. **Recruitment form** includes:
   - Purpose penelitian (improve SRL app engagement)
   - What participants akan lakukan (use app 6 weeks, fill 2 kuesioner)
   - Time commitment (~15 min pre-test, ~20 min post-test, daily app use optional)
   - Benefits (free app access, certificate, contribute to research)
   - Risks (minimal: waktu, potential notification distraction)
   - **Voluntary participation:** Dapat withdraw kapan saja tanpa konsekuensi
   - **Data confidentiality:** Anonymized, tidak impact nilai kuliah

2. **Digital signature:** Google Forms checkbox + timestamp

3. **Right to withdraw:**
   - Contact researcher anytime via email/WhatsApp
   - Data dari withdrawn participants akan di-delete (if requested)

---

### 9.2 Data Privacy & Confidentiality

**Data Collected:**
- Personal: Name, email (untuk communication only)
- Research data: Kuesioner responses, activity logs

**Data Protection:**
1. **Anonymization:**
   - Each participant assigned UUID (e.g., `USER_A3F2B9`)
   - All analysis uses UUID, NOT name

2. **Data Storage:**
   - Database: MongoDB Atlas (cloud, encrypted)
   - Kuesioner: Google Forms (encrypted, password-protected)
   - Access: ONLY researcher + advisor

3. **Data Retention:**
   - Research data: 3 years (standard academic practice)
   - Personal identifiers (name, email): Deleted after certificate distribution (Apr 30)

4. **Data Sharing:**
   - Aggregate results only (dalam paper/skripsi)
   - NO individual data disclosed
   - Raw data available to advisor upon request (for verification)

---

### 9.3 Participant Well-being

**Minimal Risk:**
- No physical risk
- No psychological harm (app untuk support learning, not manipulative)
- No academic penalty (participation tidak affect nilai kuliah)

**Potential Burden:**
- Time: 2 kuesioner (~35 min total) + daily app use (self-paced)
- Notification: Dapat di-configure atau disable (autonomy support)

**Mitigation:**
- Clear communication: Expected time commitment stated upfront
- Autonomy: Notification preferences customizable
- Support: Researcher contact available untuk technical issues

---

### 9.4 Approval

**Institutional Review:**
- Submit proposal ke Pembimbing (advisor approval)
- If required by institution: Submit ke Ethics Committee / IRB
- Obtain approval BEFORE recruitment (Feb timeline)

**Transparency:**
- Results akan dishare ke participants (via email summary) after study completion
- Aggregate findings (tidak individual scores)

---

## 10. Limitations

### 10.1 Acknowledged Limitations

**Methodological:**
1. **No control group:**
   - Cannot fully isolate effect of intervention from confounding factors (maturation, history)
   - Mitigated by: Historical baseline comparison (Azmi 2024)

2. **Short duration (6 weeks):**
   - Cannot assess long-term sustainability beyond novelty effect window (Ratinho & Martins, 2023)
   - Recommended: Future research 3-6 months

3. **Self-selection bias:**
   - Participants voluntarily enroll → may be more motivated than average student
   - Generalizability: Results applicable to "students willing to try SRL tools"

4. **Self-report instruments:**
   - UMI, BPNS susceptible to social desirability bias
   - Mitigated by: Anonymity, triangulation with objective logs


5. **Single institution:**
   - Generalizability limited to similar institutions (Indonesian universities, IT/STEM programs)

**Technical:**
6. **Platform limitation:**
   - If PWA only (not native app) → potential UX friction (install process, offline mode limitations)
   - Documented in Implementation section


---

## 11. Expected Contributions

### 11.1 Theoretical Contributions

1. **Validation of "Golden Gap" hypothesis:**
   - Testing Li et al. (2024) + Bureau et al. (2022) synthesis in Indonesian context
   - Evidence untuk: Enhanced Competence Design as solution to gamification weakness

2. **OIT application in educational technology:**
   - Demonstrate Goal Hierarchy System as practical OIT implementation
   - Show value internalization can occur with low-friction UX design

3. **Autonomous-Motivation Gamification validation:**
   - Test Gao (2024) framework in real-world SRL context
   - Evidence for: Meaningful Gamification > Traditional PBL

---

### 11.2 Practical Contributions

1. **Design guidelines:**
   - 5 evidence-based features untuk SRL app developers
   - Replicable design patterns (Scaffolding, Goal Hierarchy, Guided Reflection)

2. **Baseline improvement:**
   - From Azmi (2024) 30% engagement → Target >50% engagement
   - Demonstrate: Proactive triggers + Competence support = effective strategy

3. **Open-source resource:**
   - Consideration: Release app as open-source after skripsi defense
   - Benefit academic community + students

---

## 12. Summary & Next Steps

### 12.1 Methodology Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Design** | Quasi-experimental pre-post | Practical, valid, ethical |
| **Sample** | n=50-60 (mahasiswa semester 2) | Power adequate, comparable to baseline |
| **Features** | 5 TIER 1 features | Timeline realistic, covers all 3 gaps |
| **Instruments** | UMI, BPNS, Activity Logs | Gold standard + objective triangulation |
| **Duration** | 6 weeks | Adequate for short-term, acknowledge novelty effect |
| **Analysis** | Paired t-test + descriptive | Appropriate for pre-post design |

---

## References

**Methodology & Research Design:**
- Campbell, D. T., & Stanley, J. C. (1963). *Experimental and quasi-experimental designs for research*. Houghton Mifflin.
- Cohen, J. (1988). *Statistical power analysis for the behavioral sciences* (2nd ed.). Lawrence Erlbaum Associates.
- Nunnally, J. C., & Bernstein, I. H. (1994). *Psychometric theory* (3rd ed.). McGraw-Hill.
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77-101.

**SDT & Instruments:**
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist*, 55(1), 68-78.
- Ryan, R. M., & Deci, E. L. (2020). *Intrinsic and extrinsic motivation from a self-determination theory perspective: Definitions, theory, practices, and future directions*. Contemporary Educational Psychology, 61, 101860.

**Evidence Base (Full list: See narasi-penelitian.md Section 12):**
- Alberts et al. (2024), Bureau et al. (2022), Gao (2024), Li et al. (2024), Karaali et al. (2025), Sailer et al. (2017), Zimmerman (2002), dan 19 papers lainnya.

---

*End of Metodologi.md v1.0*
*Total: ~12,000 words*
*Status: DRAFT - Ready for Advisor Review*
