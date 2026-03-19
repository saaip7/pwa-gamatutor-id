import random
from datetime import datetime
import pytz

def generate_chatbot_response(context_analysis, movement_info):
    """
    Menghasilkan respons chatbot berdasarkan analisis konteks
    
    Args:
        context_analysis (dict): Hasil analisis konteks
        movement_info (dict): Informasi pergerakan card
        
    Returns:
        dict: Respons chatbot
    """
    try:
        response_type = context_analysis["response_type"]
        context = context_analysis["context"]
        card = movement_info["card"]
        user = movement_info["user"]
        learning_strategy = movement_info.get("learning_strategy")
        
        # Pilih template respons berdasarkan jenis
        response_template = get_response_template(response_type)
        
        # Personalisasi respons dengan konteks
        personalized_response = personalize_response(
            response_template, 
            context, 
            card, 
            user, 
            learning_strategy
        )
        
        # Generate suggestions
        suggestions = generate_suggestions(response_type, context, card)
        
        # Generate questions for reflection
        reflection_questions = generate_reflection_questions(response_type, context)
        
        return {
            "response_type": response_type,
            "message": personalized_response,
            "suggestions": suggestions,
            "reflection_questions": reflection_questions,
            "timestamp": datetime.now().isoformat(),
            "context_summary": generate_context_summary(context, card)
        }
    except Exception as e:
        print(f"Error in generate_chatbot_response: {e}")
        return {
            "response_type": "error",
            "message": "Maaf, saya sedang mengalami kesulitan. Silakan coba lagi nanti.",
            "suggestions": [],
            "reflection_questions": [],
            "timestamp": datetime.now().isoformat(),
            "context_summary": {}
        }

def get_response_template(response_type):
    """
    Mendapatkan template respons berdasarkan jenis respons
    
    Args:
        response_type (str): Jenis respons
        
    Returns:
        dict: Template respons
    """
    templates = {
        "start_task": {
            "greetings": [
                "Semangat mulai mengerjakan '{card_title}'! 🚀",
                "Waktunya memulai '{card_title}'! Ayo kita kerjakan! 💪",
                "Selamat memulai '{card_title}'! Saya di sini untuk membantu! 🌟"
            ],
            "strategy_intro": [
                "Berdasarkan strategi belajar '{strategy_name}': {strategy_description}",
                "Kamu memilih strategi '{strategy_name}'. {strategy_description}",
                "Dengan strategi '{strategy_name}', kamu bisa: {strategy_description}"
            ],
            "difficulty_tips": {
                "easy": [
                    "Karena tugas ini tingkat kesulitannya mudah, fokus untuk menyelesaikannya dengan baik.",
                    "Tugas ini tergolong mudah, pastikan kamu memahami konsep dasarnya dengan baik.",
                    "Untuk tugas mudah seperti ini, kamu bisa menyelesaikannya dengan cepat namun tetap berkualitas."
                ],
                "medium": [
                    "Tugas ini memiliki tingkat kesulitan sedang. Bagi waktu kamu dengan baik dan fokus pada setiap bagian.",
                    "Untuk tugas sedang seperti ini, pastikan kamu memahami setiap konsep sebelum melanjutkan.",
                    "Kerjakan setiap bagian secara bertahap dan jangan ragu untuk istirahat sejenak jika needed."
                ],
                "hard": [
                    "Karena tugas ini tingkat kesulitannya tinggi, bagi menjadi beberapa sesi singkat dengan istirahat yang cukup.",
                    "Tugas ini cukup menantang. Mulai dengan bagian yang paling mudah dulu untuk membangun kepercayaan diri.",
                    "Untuk tugas sulit, pastikan kamu memahami konsep dasarnya terlebih dahulu sebelum melanjutkan ke bagian yang lebih kompleks."
                ]
            },
            "time_estimation": [
                "Estimasi waktu untuk menyelesaikan tugas ini: {estimated_time}.",
                "Kamu mungkin membutuhkan sekitar {estimated_time} untuk menyelesaikan tugas ini.",
                "Berdasarkan tingkat kesulitannya, alokasikan sekitar {estimated_time} untuk tugas ini."
            ],
            "encouragement": [
                "Jangan lupa untuk menggunakan teknik Pomodoro: 25 menit fokus, 5 menit istirahat! 🍅",
                "Fokus pada satu hal dalam satu waktu. Kamu pasti bisa! 💯",
                "Ingat, konsistensi lebih penting dari intensitas. Ayo perlahan tapi pasti! 🌱"
            ]
        },
        "review_task": {
            "greetings": [
                "Bagus! Kamu telah menyelesaikan '{card_title}'! 🎉",
                "Hebat! '{card_title}' sudah selesai dikerjakan! 👏",
                "Selamat! Kamu telah menyelesaikan fase pengerjaan '{card_title}'! ✨"
            ],
            "time_summary": [
                "Waktu belajar kamu: {total_time}",
                "Kamu telah menghabiskan {total_time} untuk tugas ini.",
                "Total waktu belajar untuk tugas ini: {total_time}"
            ],
            "review_guidance": [
                "Sekarang saatnya review:\n1. Apa yang sudah kamu pelajari dari tugas ini?\n2. Bagian mana yang paling menantang?\n3. Apa yang bisa kamu tingkatkan?",
                "Mari kita review hasil kerja kamu:\n1. Apa poin-poin penting yang kamu pelajari?\n2. Kesulitan apa yang kamu hadapi?\n3. Bagaimana kamu mengatasinya?",
                "Waktunya mereview:\n1. Apa yang kamu kerjakan dalam tugas ini?\n2. Apa yang sudah kamu pahami dengan baik?\n3. Apa yang masih perlu diperjelas?"
            ],
            "reflection_prompt": [
                "Catatan kamu: '{notes}'",
                "Dari catatan kamu: '{notes}', apa yang bisa kita simpulkan?",
                "Kamu mencatat: '{notes}'. Bagaimana pengalaman kamu dengan tugas ini?"
            ],
            "next_steps": [
                "Setelah review, kamu bisa memindahkan card ke Reflection (Done) jika sudah yakin dengan hasilnya.",
                "Jika merasa ada yang perlu diperbaiki, kamu bisa kembali ke Monitoring (In Progress).",
                "Review ini penting untuk memastikan pemahaman kamu sebelum melangkah ke tugas berikutnya."
            ]
        },
        "complete_task": {
            "greetings": [
                "Selamat! '{card_title}' telah selesai! 🎊",
                "Luar biasa! Kamu telah menyelesaikan '{card_title}'! 🏆",
                "Akhirnya! '{card_title}' selesai! Kerja bagus! 🌟"
            ],
            "achievement_summary": [
                "Total waktu belajar: {total_time}\nJumlah pergerakan card: {total_movements}",
                "Statistik pencapaian:\n- Waktu belajar: {total_time}\n- Pergerakan card: {total_movements} kali",
                "Pencapaian kamu:\n⏱️ Waktu belajar: {total_time}\n🔄 Pergerakan card: {total_movements} kali"
            ],
            "reflection_questions": [
                "Refleksi akhir:\n1. Apa yang kamu pelajari dari proses ini?\n2. Bagaimana perasaan kamu setelah menyelesaikan tugas ini?\n3. Apa yang akan kamu lakukan berbeda untuk tugas berikutnya?",
                "Mari kita refleksikan:\n1. Pengetahuan baru apa yang kamu dapatkan?\n2. Skill apa yang kamu kembangkan?\n3. Bagaimana perasaan kamu sekarang?",
                "Waktunya refleksi:\n1. Apa nilai pembelajaran terbesar dari tugas ini?\n2. Bagaimana proses belajar kamu?\n3. Apa yang bisa kamu tingkatkan?"
            ],
            "celebration": [
                "Selamat atas pencapaian ini! Setiap tugas yang selesai adalah langkah maju dalam perjalanan belajar kamu. 🎓",
                "Kerja keras kamu membuahkan hasil! Teruskan semangat belajarnya! 🚀",
                "Pencapaian yang luar biasa! Kamu layak mendapatkan apresiasi untuk usaha kamu! 👏"
            ],
            "next_challenge": [
                "Siap untuk tantangan berikutnya? 💯",
                "Ayo kita lanjutkan ke tugas berikutnya! Kamu pasti bisa! 💪",
                "Tugas berikutnya sudah menanti! Dengan pengalaman ini, kamu akan lebih siap! 🌟"
            ]
        },
        "step_back_to_planning": {
            "understanding": [
                "Tidak masalah mengembalikan '{card_title}' ke Planning (To Do). 😊",
                "Mengembalikan '{card_title}' ke Planning (To Do) adalah keputusan yang bijak. 🤔",
                "Saya mengerti kamu memindahkan '{card_title}' kembali ke Planning (To Do). 👍"
            ],
            "analysis_questions": [
                "Mari kita pikirkan:\n1. Apa hambatan yang kamu hadapi?\n2. Apakah kamu perlu bantuan tambahan?\n3. Mungkin kita perlu menyesuaikan strategi belajar?",
                "Ayo kita evaluasi:\n1. Apa yang membuat kamu kesulitan?\n2. Apakah ada konsep yang belum dipahami?\n3. Bagaimana kita bisa mempersiapkan lebih baik?",
                "Mari kita rencanakan kembali:\n1. Apa kendala yang kamu temui?\n2. Apakah kamu butuh resources tambahan?\n3. Bagaimana strategi yang lebih efektif?"
            ],
            "encouragement": [
                "Ingat, ini adalah bagian dari proses belajar! Mengenali kapan perlu rencana ulang adalah skill penting. 🌱",
                "Kadang-kadang kita perlu kembali ke tahap perencanaan untuk memastikan segalanya berjalan dengan baik. 💡",
                "Tidak ada yang salah dengan memutar balik untuk mempersiapkan lebih baik. Ini menunjukkan kesadaran diri! 🧠"
            ],
            "suggestions": [
                "Mungkin coba pecah tugas menjadi bagian-bagian yang lebih kecil?",
                "Apakah ada resources tambahan yang bisa membantu kamu memahami materi ini?",
                "Coba diskusikan dengan teman atau guru jika ada bagian yang sulit dipahami."
            ]
        },
        "step_back_to_monitoring": {
            "understanding": [
                "Tidak masalah mengembalikan '{card_title}' ke Monitoring (In Progress). 😊",
                "Saya mengerti kamu memindahkan '{card_title}' kembali ke Monitoring (In Progress). 🤔",
                "Mengembalikan '{card_title}' ke Monitoring (In Progress) adalah langkah yang tepat. 👍"
            ],
            "analysis_questions": [
                "Mari kita pikirkan:\n1. Apa yang perlu diperbaiki dari hasil kerja kamu?\n2. Apakah ada bagian yang perlu dikerjakan ulang?\n3. Bagaimana kita bisa meningkatkan kualitas?",
                "Ayo kita evaluasi:\n1. Apa yang kurang dari hasil kerja kamu?\n2. Apakah ada kesalahan yang perlu diperbaiki?\n3. Bagaimana cara meningkatkan hasil?",
                "Mari kita lanjutkan pengerjaan:\n1. Apa yang perlu ditambahkan atau diubah?\n2. Apakah ada feedback yang perlu diterapkan?\n3. Bagaimana meningkatkan kualitas kerja?"
            ],
            "encouragement": [
                "Proses belajar memang seringkali iteratif. Setiap revisi membuat hasil lebih baik! 🔄",
                "Kembali ke tahap pengerjaan adalah bagian normal dari proses belajar yang berkualitas. 📚",
                "Setiap perbaikan adalah langkah menuju pemahaman yang lebih mendalam. 💡"
            ],
            "suggestions": [
                "Fokus pada bagian yang membutuhkan perbaikan berdasarkan hasil review.",
                "Coba pendekatan berbeda untuk bagian yang sulit.",
                "Jangan ragu untuk mencari referensi tambahan jika diperlukan."
            ]
        },
        "struggling_pattern": {
            "observation": [
                "Saya perhatikan kamu sering memindahkan '{card_title}' bolak-balik. 🤔",
                "Tampaknya '{card_title}' ini memberikan kamu beberapa tantangan. 🤔",
                "Saya lihat kamu sedang berusaha dengan '{card_title}' tapi mengalami beberapa kesulitan. 🤔"
            ],
            "analysis": [
                "Ini bisa menandakan beberapa hal:\n1. Mungkin tugas ini terlalu besar atau kompleks\n2. Mungkin ada konsep yang belum sepenuhnya dipahami\n3. Mungkin strategi belajar saat ini belum efektif",
                "Pola bolak-balik sering menunjukkan:\n1. Kesulitan dalam memahami atau mengerjakan tugas\n2. Kebutuhan untuk pendekatan berbeda\n3. Mungkin perlu bantuan tambahan",
                "Ketika card sering bergerak bolak-balik, biasanya:\n1. Ada hambatan dalam proses belajar\n2. Perlu penyesuaian strategi\n3. Mungkin perlu memecah tugas menjadi lebih kecil"
            ],
            "suggestions": [
                "Mari kita coba beberapa pendekatan:\n1. Pecah tugas menjadi bagian-bagian yang lebih kecil\n2. Coba strategi belajar yang berbeda\n3. Carilah resources tambahan jika diperlukan",
                "Beberapa ide yang bisa membantu:\n1. Fokus pada satu bagian kecil dulu\n2. Diskusikan dengan teman atau guru\n3. Coba metode pembelajaran yang berbeda",
                "Solusi yang bisa kita coba:\n1. Buat checklist kecil untuk setiap bagian\n2. Tetapkan tujuan yang lebih realistis\n3. Gunakan teknik belajar yang sesuai dengan style kamu"
            ],
            "encouragement": [
                "Jangan khawatir, ini adalah bagian normal dari proses belajar. Setiap orang memiliki tantangan uniknya! 🌱",
                "Kesulitan seperti ini adalah kesempatan untuk mengembangkan strategi belajar yang lebih efektif. 💡",
                "Saya yakin kamu bisa mengatasi tantangan ini! Mari kita cari cara yang paling cocok untuk kamu. 💪"
            ]
        },
        "stuck_pattern": {
            "observation": [
                "Saya perhatikan '{card_title}' sudah berada di {column_name} untuk beberapa waktu. 🤔",
                "Tampaknya '{card_title}' ini terjebak di {column_name} untuk sementara waktu. 🤔",
                "Saya lihat '{card_title}' belum bergerak dari {column_name} untuk beberapa hari. 🤔"
            ],
            "analysis": [
                "Ini bisa disebabkan oleh beberapa hal:\n1. Mungkin tugas ini terlalu menantang atau membosankan\n2. Mungkin ada prioritas lain yang lebih mendesak\n3. Mungkin kamu kehilangan motivasi atau fokus",
                "Ketika sebuah card terjebak lama, biasanya:\n1. Ada hambatan yang tidak terlihat\n2. Mungkin perlu pendekatan baru\n3. Bisa jadi tugas ini tidak lagi relevan",
                "Card yang tidak bergerak untuk waktu lama menunjukkan:\n1. Kemungkinan adanya blok mental\n2. Perlu evaluasi kembali pentingnya tugas\n3. Mungkin perlu bantuan eksternal"
            ],
            "suggestions": [
                "Mari kita evaluasi kembali '{card_title}':\n1. Apakah tugas ini masih relevan?\n2. Apakah bisa dipecah menjadi bagian yang lebih kecil?\n3. Apakah ada cara untuk membuatnya lebih menarik?",
                "Beberapa opsi untuk memecah kebuntuan:\n1. Tetapkan deadline yang lebih realistis\n2. Coba kerjakan di lingkungan yang berbeda\n3. Carilah akuntabilitas partner",
                "Ide untuk mengatasi kebuntuan:\n1. Mulai dengan bagian termudah dulu\n2. Gunakan teknik Pomodoro untuk memulai\n3. Beri reward kecil setelah menyelesaikan bagian"
            ],
            "encouragement": [
                "Kebuntuan seperti ini adalah hal yang umum dalam proses belajar. Yang penting adalah bagaimana kita mengatasinya! 🌱",
                "Terkadang kita semua mengalami blok. Ini adalah kesempatan untuk belajar strategi baru! 💡",
                "Jangan biarkan kebuntuan ini menghentikan kamu. Mari kita cari jalan keluar bersama! 💪"
            ]
        },
        "high_complexity": {
            "observation": [
                "Saya perhatikan '{card_title}' memiliki tingkat kesulitan dan prioritas yang tinggi. 🤔",
                "'{card_title}' ini tampaknya merupakan tugas yang kompleks dan penting. 🤔",
                "Tugas '{card_title}' ini memiliki kombinasi kesulitan dan prioritas yang menantang. 🤔"
            ],
            "strategy_suggestions": [
                "Untuk tugas kompleks seperti ini, saya sarankan:\n1. Pecah menjadi sub-tugas yang lebih kecil\n2. Buat timeline yang jelas untuk setiap bagian\n3. Fokus pada satu sub-tugas dalam satu waktu",
                "Strategi untuk tugas kompleks:\n1. Mulai dengan perencanaan detail\n2. Identifikasi resources yang dibutuhkan\n3. Tetapkan milestone untuk setiap tahap",
                "Menghadapi tugas kompleks:\n1. Buat peta konsep untuk memvisualisasikan struktur\n2. Prioritaskan bagian yang paling kritis\n3. Sisihkan waktu khusus untuk fokus mendalam"
            ],
            "time_management": [
                "Untuk tugas dengan kompleksitas tinggi:\n1. Alokasikan waktu yang lebih banyak dari estimasi awal\n2. Sisihkan waktu buffer untuk hal-hal tak terduga\n3. Gunakan teknik time-blocking untuk fokus",
                "Manajemen waktu untuk tugas kompleks:\n1. Bagi menjadi sesi-sesi singkat dengan istirahat cukup\n2. Hindari multitasking, fokus pada satu hal\n3. Gunakan teknik 2-minute rule untuk memulai",
                "Tips waktu untuk tugas sulit:\n1. Kerjakan di waktu produktif kamu\n2. Hilangkan distraksi selama sesi kerja\n3. Gunakan timer untuk mengukur fokus"
            ],
            "support_suggestions": [
                "Jangan ragu untuk mencari bantuan:\n1. Diskusikan dengan teman sekelas\n2. Tanyakan pada guru atau mentor\n3. Carilah resources pembelajaran tambahan",
                "Dukungan yang bisa membantu:\n1. Study group untuk diskusi\n2. Office hours dengan dosen\n3. Online forums atau communities",
                "Sumber daya tambahan:\n1. Video tutorial atau penjelasan alternatif\n2. Contoh kasus atau implementasi\n3. Practice exercises untuk memperkuat pemahaman"
            ],
            "encouragement": [
                "Tugas kompleks seperti ini adalah kesempatan untuk mengembangkan skill berpikir kritis dan problem-solving. 🌟",
                "Meskipun menantang, menyelesaikan tugas seperti ini akan memberikan kepuasan dan pembelajaran yang mendalam. 💪",
                "Percayalah pada kemampuan kamu! Setiap langkah kecil dalam tugas kompleks adalah kemajuan yang berarti. 🚀"
            ]
        },
        "general": {
            "greetings": [
                "Saya perhatikan kamu memindahkan '{card_title}' dari {from_column_name} ke {to_column_name}. 🤔",
                "Pergerakan card '{card_title}' terdeteksi! 🔄",
                "Ada pergerakan pada '{card_title}'! 👀"
            ],
            "observation": [
                "Setiap pergerakan card adalah bagian dari perjalanan belajar kamu. 🌱",
                "Proses belajar memang dinamis, teruskan eksplorasi kamu! 📚",
                "Saya di sini untuk mendukung setiap langkah dalam perjalanan belajar kamu. 💪"
            ],
            "questions": [
                "Bagaimana perasaan kamu dengan tugas ini sejauh ini?",
                "Apakah ada yang bisa saya bantu untuk memperlancar proses belajar kamu?",
                "Apa tantangan atau kesuksesan yang kamu alami dengan tugas ini?"
            ],
            "encouragement": [
                "Teruskan semangat belajarnya! Setiap langkah adalah kemajuan. 🌟",
                "Saya yakin kamu bisa menyelesaikan semua tantangan belajar kamu! 💪",
                "Ingat, proses belajar adalah perjalanan, bukan tujuan akhir. Nikmati setiap prosesnya! 🌱"
            ]
        }
    }
    
    return templates.get(response_type, templates["general"])

def personalize_response(template, context, card, user, learning_strategy):
    """
    Personalisasi respons dengan konteks
    
    Args:
        template (dict): Template respons
        context (dict): Konteks analisis
        card (dict): Informasi card
        user (dict): Informasi user
        learning_strategy (dict): Informasi strategi belajar
        
    Returns:
        str: Respons yang dipersonalisasi
    """
    try:
        # Ambil informasi yang dibutuhkan
        card_title = card.get("title", "tugas ini")
        card_notes = card.get("notes", "")
        card_difficulty = card.get("difficulty", "medium")
        from_column_name = context.get("column_analysis", {}).get("from_column_name", "kolom sebelumnya")
        to_column_name = context.get("column_analysis", {}).get("to_column_name", "kolom berikutnya")
        
        # Informasi dari analisis
        time_analysis = context.get("time_analysis", {})
        movement_pattern = context.get("movement_pattern", {})
        difficulty_priority_analysis = context.get("difficulty_priority_analysis", {})
        
        # Format waktu
        total_time = time_analysis.get("total_time_formatted", "belum ada data")
        total_movements = movement_pattern.get("total_movements", 0)
        estimated_time = difficulty_priority_analysis.get("estimated_time", "1-2 jam")
        
        # Informasi strategi belajar
        strategy_name = "tidak dipilih"
        strategy_description = "tidak ada deskripsi"
        if learning_strategy:
            strategy_name = learning_strategy.get("learning_strat_name", "tidak dipilih")
            strategy_description = learning_strategy.get("description", "tidak ada deskripsi")
        
        # Personalisasi nama user
        user_name = user.get("first_name", "kamu")
        
        # Bangun respons
        response_parts = []
        
        # Tambahkan greeting
        greetings = template.get("greetings", [])
        if greetings:
            greeting = random.choice(greetings)
            greeting = greeting.format(
                card_title=card_title,
                user_name=user_name,
                from_column_name=from_column_name,
                to_column_name=to_column_name
            )
            response_parts.append(greeting)
        
        # Tambahkan informasi strategi jika ada
        if "strategy_intro" in template and learning_strategy:
            strategy_intro = random.choice(template["strategy_intro"])
            strategy_intro = strategy_intro.format(
                strategy_name=strategy_name,
                strategy_description=strategy_description
            )
            response_parts.append(strategy_intro)
        
        # Tambahkan tips difficulty
        if "difficulty_tips" in template:
            difficulty_tips = template["difficulty_tips"].get(card_difficulty, [])
            if difficulty_tips:
                tip = random.choice(difficulty_tips)
                response_parts.append(tip)
        
        # Tambahkan estimasi waktu
        if "time_estimation" in template:
            time_estimation = random.choice(template["time_estimation"])
            time_estimation = time_estimation.format(estimated_time=estimated_time)
            response_parts.append(time_estimation)
        
        # Tambahkan ringkasan waktu
        if "time_summary" in template:
            time_summary = random.choice(template["time_summary"])
            time_summary = time_summary.format(total_time=total_time)
            response_parts.append(time_summary)
        
        # Tambahkan ringkasan pencapaian
        if "achievement_summary" in template:
            achievement_summary = random.choice(template["achievement_summary"])
            achievement_summary = achievement_summary.format(
                total_time=total_time,
                total_movements=total_movements
            )
            response_parts.append(achievement_summary)
        
        # Tambahkan panduan review
        if "review_guidance" in template:
            review_guidance = random.choice(template["review_guidance"])
            response_parts.append(review_guidance)
        
        # Tambahkan pertanyaan refleksi
        if "reflection_questions" in template:
            reflection_questions = random.choice(template["reflection_questions"])
            response_parts.append(reflection_questions)
        
        # Tambahkan prompt refleksi dari notes
        if "reflection_prompt" in template and card_notes:
            reflection_prompt = random.choice(template["reflection_prompt"])
            reflection_prompt = reflection_prompt.format(notes=card_notes)
            response_parts.append(reflection_prompt)
        
        # Tambahkan saran langkah selanjutnya
        if "next_steps" in template:
            next_steps = random.choice(template["next_steps"])
            response_parts.append(next_steps)
        
        # Tambahkan pertanyaan analisis
        if "analysis_questions" in template:
            analysis_questions = random.choice(template["analysis_questions"])
            response_parts.append(analysis_questions)
        
        # Tambahkan observasi
        if "observation" in template:
            observation = random.choice(template["observation"])
            observation = observation.format(
                card_title=card_title,
                column_name=to_column_name
            )
            response_parts.append(observation)
        
        # Tambahkan analisis
        if "analysis" in template:
            analysis = random.choice(template["analysis"])
            response_parts.append(analysis)
        
        # Tambahkan saran strategi
        if "strategy_suggestions" in template:
            strategy_suggestions = random.choice(template["strategy_suggestions"])
            response_parts.append(strategy_suggestions)
        
        # Tambahkan saran waktu
        if "time_management" in template:
            time_management = random.choice(template["time_management"])
            response_parts.append(time_management)
        
        # Tambahkan saran dukungan
        if "support_suggestions" in template:
            support_suggestions = random.choice(template["support_suggestions"])
            response_parts.append(support_suggestions)
        
        # Tambahkan saran umum
        if "suggestions" in template:
            suggestions = random.choice(template["suggestions"])
            response_parts.append(suggestions)
        
        # Tambahkan pertanyaan umum
        if "questions" in template:
            questions = random.choice(template["questions"])
            response_parts.append(questions)
        
        # Tambahkan semangat terakhir
        if "encouragement" in template:
            encouragement = random.choice(template["encouragement"])
            response_parts.append(encouragement)
        
        # Tambahkan selebrasi
        if "celebration" in template:
            celebration = random.choice(template["celebration"])
            response_parts.append(celebration)
        
        # Tambahkan tantangan berikutnya
        if "next_challenge" in template:
            next_challenge = random.choice(template["next_challenge"])
            response_parts.append(next_challenge)
        
        # Gabungkan semua bagian dengan newline
        return "\n\n".join(response_parts)
    except Exception as e:
        print(f"Error in personalize_response: {e}")
        return f"Saya perhatikan kamu memindahkan '{card.get('title', 'tugas ini')}'. Bagaimana perjalanan belajarmu?"

def generate_suggestions(response_type, context, card):
    """
    Menghasilkan saran berdasarkan jenis respons
    
    Args:
        response_type (str): Jenis respons
        context (dict): Konteks analisis
        card (dict): Informasi card
        
    Returns:
        list: Daftar saran
    """
    try:
        suggestions = []
        
        # Saran umum untuk semua jenis respons
        if response_type in ["start_task", "review_task", "complete_task"]:
            suggestions.append("Gunakan teknik Pomodoro: 25 menit fokus, 5 menit istirahat")
            suggestions.append("Minum air yang cukup dan jaga kesehatan")
        
        # Saran khusus berdasarkan jenis respons
        if response_type == "start_task":
            difficulty = card.get("difficulty", "medium")
            if difficulty == "hard":
                suggestions.append("Pecah tugas menjadi bagian-bagian yang lebih kecil")
                suggestions.append("Mulai dengan bagian yang paling mudah dulu")
            else:
                suggestions.append("Fokus pada satu task dalam satu waktu")
                suggestions.append("Hilangkan distraksi di sekitar kamu")
        
        elif response_type == "review_task":
            suggestions.append("Buat checklist untuk memastikan semua bagian sudah tercover")
            suggestions.append("Coba jelaskan konsep dengan kata-kata sendiri")
            suggestions.append("Carilah contoh kasus tambahan untuk memperdalam pemahaman")
        
        elif response_type == "complete_task":
            suggestions.append("Rayakan pencapaian kecilmu!")
            suggestions.append("Refleksikan apa yang sudah dipelajari")
            suggestions.append("Siapkan rencana untuk tugas berikutnya")
        
        elif response_type in ["step_back_to_planning", "step_back_to_monitoring"]:
            suggestions.append("Identifikasi hambatan utama yang dihadapi")
            suggestions.append("Coba pendekatan atau metode yang berbeda")
            suggestions.append("Diskusikan dengan teman atau mentor jika perlu")
        
        elif response_type == "struggling_pattern":
            suggestions.append("Ambil break sejenak untuk refresh pikiran")
            suggestions.append("Coba ubah lingkungan belajar")
            suggestions.append("Break down task menjadi micro-tasks")
        
        elif response_type == "stuck_pattern":
            suggestions.append("Evaluasi kembali relevansi dan prioritas task")
            suggestions.append("Set timer 5 menit dan kerjakan apa saja yang bisa")
            suggestions.append("Carilah akuntabilitas partner")
        
        elif response_type == "high_complexity":
            suggestions.append("Buat visual map atau diagram dari task")
            suggestions.append("Alokasikan waktu khusus untuk deep work")
            suggestions.append("Cari resources atau referensi tambahan")
        
        return suggestions
    except Exception as e:
        print(f"Error in generate_suggestions: {e}")
        return ["Coba fokus dan kerjakan secara bertahap"]

def generate_reflection_questions(response_type, context, card=None):
    """
    Menghasilkan pertanyaan refleksi berdasarkan jenis respons
    
    Args:
        response_type (str): Jenis respons
        context (dict): Konteks analisis
        card (dict): Informasi card
        
    Returns:
        list: Daftar pertanyaan refleksi
    """
    try:
        questions = []
        
        # Pertanyaan umum untuk semua jenis respons
        questions.append("Apa yang kamu pelajari dari proses ini?")
        questions.append("Bagian mana yang paling menantang dan mengapa?")
        questions.append("Apa yang akan kamu lakukan berbeda untuk tugas berikutnya?")
        
        # Pertanyaan khusus berdasarkan jenis respons
        if response_type == "start_task":
            questions.extend([
                "Apa tujuan pembelajaran kamu untuk tugas ini?",
                "Bagaimana kamu merencanakan waktu untuk menyelesaikannya?",
                "Apa resources yang kamu butuhkan untuk menyelesaikan tugas ini?"
            ])
        
        elif response_type == "review_task":
            questions.extend([
                "Apakah hasil kerja kamu sudah sesuai dengan ekspektasi?",
                "Bagian mana yang perlu diperbaiki dan mengapa?",
                "Apa insight baru yang kamu dapatkan dari mengerjakan tugas ini?"
            ])
        
        elif response_type == "complete_task":
            questions.extend([
                "Seberapa puaskah kamu dengan hasil akhir?",
                "Skill apa yang kamu kembangkan dalam proses ini?",
                "Bagaimana perasaan kamu setelah menyelesaikan tugas ini?"
            ])
        
        elif response_type in ["step_back_to_planning", "step_back_to_monitoring"]:
            questions.extend([
                "Apa hambatan utama yang kamu hadapi?",
                "Apa yang bisa kamu lakukan untuk mengatasi hambatan tersebut?",
                "Apakah kamu perlu bantuan tambahan dan dari siapa?"
            ])
        
        elif response_type == "struggling_pattern":
            questions.extend([
                "Apa penyebab utama kesulitan yang kamu alami?",
                "Apakah strategi belajar kamu saat ini efektif?",
                "Apa perubahan kecil yang bisa membantu kamu maju?"
            ])
        
        elif response_type == "stuck_pattern":
            questions.extend([
                "Apa yang menyebabkan kamu terjebak untuk waktu lama?",
                "Apakah tugas ini masih relevan dengan prioritas kamu?",
                "Apa yang bisa memotivasi kamu untuk kembali melanjutkan?"
            ])
        
        elif response_type == "high_complexity":
            questions.extend([
                "Bagaimana kamu memecah kompleksitas tugas ini?",
                "Apa strategi yang paling efektif untuk menyelesaikan tugas kompleks?",
                "Apa yang kamu pelajari tentang diri kamu dari menangani tugas kompleks?"
            ])
        
        return questions
    except Exception as e:
        print(f"Error in generate_reflection_questions: {e}")
        return ["Apa yang kamu pelajari dari proses ini?"]

def generate_context_summary(context, card):
    """
    Menghasilkan ringkasan konteks untuk frontend
    
    Args:
        context (dict): Konteks analisis
        card (dict): Informasi card
        
    Returns:
        dict: Ringkasan konteks
    """
    try:
        return {
            "card_title": card.get("title", ""),
            "card_difficulty": card.get("difficulty", ""),
            "card_priority": card.get("priority", ""),
            "movement_type": context.get("column_analysis", {}).get("movement_type", ""),
            "phase": context.get("column_analysis", {}).get("phase", ""),
            "is_milestone": context.get("column_analysis", {}).get("is_milestone", False),
            "study_pattern": context.get("time_analysis", {}).get("study_pattern", ""),
            "total_time_minutes": context.get("time_analysis", {}).get("total_time_minutes", 0),
            "movement_pattern": context.get("movement_pattern", {}).get("pattern", ""),
            "complexity": context.get("difficulty_priority_analysis", {}).get("complexity", "")
        }
    except Exception as e:
        print(f"Error in generate_context_summary: {e}")
        return {}