from shared.db import mongo
from bson import ObjectId
from datetime import datetime

BADGE_DEFINITIONS = [
    # Foundation (The Start)
    {"type": "initiator", "name": "Initiator", "category": "foundation", "shape": "diamond",
     "description": "Perjalanan belajarmu dimulai.",
     "celebration_message": "Kamu telah menyelesaikan onboarding dan memulai perjalanan belajar mandiri! Langkah pertama ini menunjukkan kesiapanmu untuk mengelola pembelajaran secara aktif dan bertanggung jawab.",
     "condition": "onboarding_completed"},
    {"type": "architect", "name": "Architect", "category": "foundation", "shape": "diamond",
     "description": "Visi besar diterjemahkan menjadi langkah kecil.",
     "celebration_message": "Kamu telah menghubungkan 3 tugas dengan tujuan belajarmu! Kemampuanmu memecah visi besar menjadi langkah konkret menunjukkan kompetensi dalam merencanakan pembelajaran secara terstruktur.",
     "condition": "three_task_goals_linked"},
    # Performance (The Action)
    {"type": "deep_diver", "name": "Deep Diver", "category": "performance", "shape": "hexagon",
     "description": "Fokus tanpa batas.",
     "celebration_message": "Kamu mencapai rekor fokus pribadi dengan sesi belajar 60 menit! Kemampuanmu menjaga konsentrasi dalam waktu lama menunjukkan kendali atas produktivitas yang terus berkembang.",
     "condition": "focus_session_60min_personal_best"},
    {"type": "marathoner", "name": "Marathoner", "category": "performance", "shape": "hexagon",
     "description": "Konsistensi mengalahkan intensitas.",
     "celebration_message": "Kamu mempertahankan belajar selama 7 hari berturut-turut! Konsistensimu menunjukkan kompetensi dalam membangun kebiasaan belajar yang berkelanjutan, bukan sekadar motivasi sesaat.",
     "condition": "forgiving_streak_7_days"},
    {"type": "ritualist", "name": "Ritualist", "category": "performance", "shape": "hexagon",
     "description": "Menemukan ritme produktivitasmu sendiri.",
     "celebration_message": "Kamu belajar di waktu yang sama selama 3 hari berturut-turut! Kemampuanmu menemukan ritme belajar sendiri menunjukkan kesadaran atas preferensi personal yang optimal untuk produktivitas.",
     "condition": "same_time_3_consecutive_days"},
    # Mindset (The Strategy)
    {"type": "reflector", "name": "Reflector", "category": "mindset", "shape": "circle",
     "description": "Kesadaran penuh dalam proses belajar.",
     "celebration_message": "Kamu telah menyelesaikan 10 refleksi belajar! Kemampuanmu mengevaluasi strategi dan memahami proses pembelajaran sendiri menunjukkan kualitas metakognisi yang terus berkembang.",
     "condition": "10_reflected_tasks"},
    {"type": "strategist", "name": "Strategist", "category": "mindset", "shape": "circle",
     "description": "Senjata rahasia belajarmu ditemukan.",
     "celebration_message": "Kamu berhasil menggunakan strategi yang sama sebanyak 3 kali dengan tingkat efektivitas tinggi! Kemampuanmu mengidentifikasi dan mengulangi strategi yang berhasil menunjukkan kompetensi dalam memilih pendekatan belajar yang optimal.",
     "condition": "same_strategy_3_times_with_high_effectiveness"},
    {"type": "explorer", "name": "Explorer", "category": "mindset", "shape": "circle",
     "description": "Eksplorasi untuk menemukan cara belajar terbaik.",
     "celebration_message": "Kamu telah mencoba 4 strategi belajar yang berbeda! Rasa ingin tahumu untuk mengeksplorasi berbagai pendekatan menunjukkan keterbukaan terhadap metode belajar yang paling sesuai dengan kebutuhanmu.",
     "condition": "at_least_4_different_strategies"},
    # Mastery (The Result)
    {"type": "improver", "name": "Improver", "category": "mastery", "shape": "shield",
     "description": "Melampaui dirimu yang kemarin.",
     "celebration_message": "Nilaimu meningkat lebih dari 20% setelah belajar! Bukti konkret ini menunjukkan kemampuanmu untuk mengidentifikasi kelemahan, menerapkan strategi yang tepat, dan menghasilkan peningkatan yang signifikan.",
     "condition": "improvement_visualization_20_percent"},
    {"type": "zenith", "name": "Zenith", "category": "mastery", "shape": "shield",
     "description": "Puncak kemampuan dan kemandirian belajar.",
     "celebration_message": "Kamu berhasil menyelesaikan tugas sulit dengan tingkat keyakinan tertinggi! Pencapaian ini menunjukkan kompetensi dalam mengelola tantangan yang menantang sekaligus membangun kepercayaan diri atas kemampuanmu sendiri.",
     "condition": "hard_task_with_confidence_5"},
]


class Badge:
    @staticmethod
    def get_all_badges(user_id):
        """Get all badge definitions with user's unlock status."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        unlocked = list(mongo.db.badges.find({"user_id": user_id}))
        unlocked_map = {b["badge_type"]: b for b in unlocked}

        result = []
        for defn in BADGE_DEFINITIONS:
            badge_data = {**defn}
            if defn["type"] in unlocked_map:
                u = unlocked_map[defn["type"]]
                badge_data["unlocked"] = True
                badge_data["unlocked_at"] = u.get("unlocked_at")
                badge_data["displayed"] = u.get("displayed", False)
            else:
                badge_data["unlocked"] = False
                badge_data["unlocked_at"] = None
                badge_data["displayed"] = False
            result.append(badge_data)
        return result

    @staticmethod
    def get_stats(user_id):
        """Get badge unlock stats."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        unlocked_count = mongo.db.badges.count_documents({"user_id": user_id})
        return {"unlocked": unlocked_count, "total": len(BADGE_DEFINITIONS)}

    @staticmethod
    def unlock(user_id, badge_type):
        """Unlock a badge for a user. Returns (doc, already_had)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": badge_type})
        if existing:
            return existing, True

        doc = {
            "user_id": user_id,
            "badge_type": badge_type,
            "displayed": False,
            "unlocked_at": datetime.utcnow(),
        }
        result = mongo.db.badges.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc, False

    @staticmethod
    def mark_displayed(user_id, badge_type):
        """Mark a badge as displayed (celebration shown)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        result = mongo.db.badges.update_one(
            {"user_id": user_id, "badge_type": badge_type},
            {"$set": {"displayed": True}}
        )
        return result.modified_count > 0

    @staticmethod
    def count_unlocked(user_id):
        """Count how many badges a user has unlocked."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return mongo.db.badges.count_documents({"user_id": user_id})
