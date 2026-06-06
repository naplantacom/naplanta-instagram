"""
Executado pelo cron do Hostgator a cada 5 minutos.
Lê queue.json, publica os posts com scheduled_at <= agora.
"""
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from instagram_publisher import InstagramPublisher

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

QUEUE_FILE = BASE_DIR / "queue.json"
LOG_FILE = BASE_DIR / "cron.log"

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


def load_queue() -> list[dict]:
    if not QUEUE_FILE.exists():
        return []
    return json.loads(QUEUE_FILE.read_text(encoding="utf-8"))


def save_queue(queue: list[dict]):
    QUEUE_FILE.write_text(
        json.dumps(queue, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def publish(ig: InstagramPublisher, post: dict) -> str:
    kind = post["type"]
    if kind == "photo":
        return ig.publish_photo(post["image_url"], post.get("caption", ""))
    if kind == "carousel":
        return ig.publish_carousel(post["image_urls"], post.get("caption", ""))
    if kind == "reel":
        return ig.publish_reel(post["video_url"], post.get("caption", ""))
    if kind == "story_image":
        return ig.publish_story_image(post["image_url"])
    if kind == "story_video":
        return ig.publish_story_video(post["video_url"])
    raise ValueError(f"Tipo desconhecido: {kind}")


def main():
    token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
    account_id = os.getenv("INSTAGRAM_ACCOUNT_ID")

    if not token or not account_id:
        log.error("Credenciais não encontradas no .env")
        sys.exit(1)

    ig = InstagramPublisher(token, account_id)
    now = datetime.now()
    queue = load_queue()
    changed = False

    for post in queue:
        if post["status"] != "pending":
            continue
        due = datetime.fromisoformat(post["scheduled_at"])
        if due > now:
            continue

        log.info(f"Publicando [{post['type']}] id={post['id']} agendado para {due}")
        try:
            result_id = publish(ig, post)
            post["status"] = "published"
            post["instagram_id"] = result_id
            log.info(f"Sucesso: instagram_id={result_id}")
        except Exception as e:
            post["status"] = "error"
            post["error"] = str(e)
            log.error(f"Erro: {e}")
        changed = True

    if changed:
        save_queue(queue)


if __name__ == "__main__":
    main()
