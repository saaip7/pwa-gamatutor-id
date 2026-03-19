def generate_chatbot_message(message, user_name="User"):
    """
    Generate a response to a general chat message
    
    Args:
        message (str): User message
        user_name (str): User's name
        
    Returns:
        str: Chatbot response
    """
    message = message.lower().strip()
    
    # Greeting responses
    if any(greeting in message for greeting in ["halo", "hai", "hello", "hi", "hey"]):
        return f"Halo {user_name}! Saya adalah asisten pembelajaran Anda. Ada yang bisa saya bantu hari ini?"
    
    # Help responses
    if any(help_word in message for help_word in ["bantuan", "help", "tolong", "bagaimana"]):
        return "Saya bisa membantu Anda dengan:\n- Memberikan tips belajar\n- Menjawab pertanyaan tentang pembelajaran\n- Menganalisis progres Anda\n- Memberikan sumber belajar rekomendasi\n\nApa yang ingin Anda ketahui lebih lanjut?"
    
    # Learning strategy responses
    if any(strategy in message for strategy in ["strategi", "metode", "cara", "belajar"]):
        return "Beberapa strategi belajar efektif yang bisa Anda coba:\n\n1. **Pomodoro Technique** - Belajar 25 menit, istirahat 5 menit\n2. **Active Recall** - Mencoba mengingat informasi tanpa melihat catatan\n3. **Spaced Repetition** - Mengulangi materi secara berkala\n4. **Mind Mapping** - Membuat diagram visual untuk menghubungkan konsep\n\nMau tahu lebih detail tentang strategi mana?"
    
    # Motivation responses
    if any(motivation in message for motivation in ["motivasi", "semangat", "malas", "lesu"]):
        return "Tetap semangat! Ingat bahwa setiap langkah kecil membawa Anda lebih dekat ke tujuan. Beberapa tips untuk meningkatkan motivasi:\n\n- Tetapkan tujuan yang realistis dan spesifik\n- Bagi tugas besar menjadi bagian-bagian kecil\n- Rayakan setiap pencapaian, meskipun kecil\n- Ingat tujuan akhir Anda\n\nAnda pasti bisa!"
    
    # Default response
    return "Terima kasih atas pesan Anda. Saya masih dalam pengembangan dan mungkin belum bisa menjawab semua pertanyaan. Silakan coba tanyakan tentang strategi belajar, motivasi, atau minta bantuan."