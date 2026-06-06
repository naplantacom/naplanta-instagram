"""
Ponto de entrada — mantém o scheduler vivo e demonstra o uso.
Execute: python main.py
"""
import time
from datetime import datetime, timedelta

from scheduler import InstagramScheduler

if __name__ == "__main__":
    ig = InstagramScheduler()
    ig.start()

    # --- Exemplos de agendamento ---

    # Foto daqui a 1 hora
    ig.schedule_photo(
        run_at=datetime.now() + timedelta(hours=1),
        image_url="https://example.com/foto.jpg",
        caption="Post agendado 🌿 #naplanta",
    )

    # Carrossel amanhã às 09:00
    amanha = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
    ig.schedule_carousel(
        run_at=amanha,
        image_urls=[
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg",
        ],
        caption="Novidades da semana 🌱",
    )

    # Reel sexta-feira às 18:00
    ig.schedule_reel(
        run_at=datetime(2026, 6, 6, 18, 0),
        video_url="https://example.com/video.mp4",
        caption="Veja nosso novo reel! 🎥",
    )

    # Listar pendentes
    print("\n--- Posts agendados ---")
    for p in ig.list_pending():
        print(f"  [{p['type']}] {p['scheduled_at']} | id={p['id']}")

    # Mantém o processo vivo
    print("\nScheduler rodando. Ctrl+C para sair.\n")
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        ig.stop()
