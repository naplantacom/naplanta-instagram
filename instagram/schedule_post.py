"""
CLI para adicionar posts à fila.

Exemplos:
  python schedule_post.py photo "2026-06-07 10:00" "https://url.com/img.jpg" "Legenda aqui"
  python schedule_post.py carousel "2026-06-07 18:00" "url1,url2,url3" "Legenda"
  python schedule_post.py reel "2026-06-08 09:00" "https://url.com/video.mp4" "Legenda"
  python schedule_post.py story_image "2026-06-07 20:00" "https://url.com/story.jpg"
  python schedule_post.py story_video "2026-06-07 20:00" "https://url.com/story.mp4"
  python schedule_post.py list
  python schedule_post.py cancel <id>
"""
import json
import sys
from datetime import datetime
from pathlib import Path
from uuid import uuid4

QUEUE_FILE = Path(__file__).parent / "queue.json"
VALID_TYPES = {"photo", "carousel", "reel", "story_image", "story_video"}


def load_queue():
    if QUEUE_FILE.exists():
        return json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    return []


def save_queue(queue):
    QUEUE_FILE.write_text(json.dumps(queue, indent=2, ensure_ascii=False), encoding="utf-8")


def add(post_type, scheduled_at_str, media, caption=""):
    run_at = datetime.strptime(scheduled_at_str, "%Y-%m-%d %H:%M")
    post = {
        "id": str(uuid4()),
        "type": post_type,
        "scheduled_at": run_at.isoformat(),
        "status": "pending",
        "caption": caption,
    }
    if post_type == "carousel":
        post["image_urls"] = [u.strip() for u in media.split(",")]
    elif post_type in {"photo", "story_image"}:
        post["image_url"] = media
    else:
        post["video_url"] = media

    queue = load_queue()
    queue.append(post)
    save_queue(queue)
    print(f"Agendado [{post_type}] para {run_at} | id={post['id']}")


def list_posts():
    queue = load_queue()
    if not queue:
        print("Fila vazia.")
        return
    for p in queue:
        print(f"[{p['status']:10}] [{p['type']:12}] {p['scheduled_at']} | {p['id']}")


def cancel(post_id):
    queue = load_queue()
    for p in queue:
        if p["id"] == post_id:
            if p["status"] != "pending":
                print(f"Não pode cancelar — status atual: {p['status']}")
                return
            p["status"] = "cancelled"
            save_queue(queue)
            print(f"Cancelado: {post_id}")
            return
    print(f"ID não encontrado: {post_id}")


if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        sys.exit(0)

    cmd = args[0]

    if cmd == "list":
        list_posts()
    elif cmd == "cancel" and len(args) == 2:
        cancel(args[1])
    elif cmd in VALID_TYPES and len(args) >= 3:
        caption = args[3] if len(args) > 3 else ""
        add(cmd, args[1], args[2], caption)
    else:
        print(__doc__)
        sys.exit(1)
