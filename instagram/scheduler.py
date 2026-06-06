import json
import logging
import os
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from dotenv import load_dotenv

from instagram_publisher import InstagramPublisher

load_dotenv()

QUEUE_FILE = Path(__file__).parent / "queue.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


# ------------------------------------------------------------------ #
# Fila persistida em JSON
# ------------------------------------------------------------------ #

def _load_queue() -> list[dict]:
    if QUEUE_FILE.exists():
        return json.loads(QUEUE_FILE.read_text())
    return []


def _save_queue(queue: list[dict]):
    QUEUE_FILE.write_text(json.dumps(queue, indent=2, ensure_ascii=False))


def _update_status(post_id: str, status: str, error: str = ""):
    queue = _load_queue()
    for item in queue:
        if item["id"] == post_id:
            item["status"] = status
            if error:
                item["error"] = error
            break
    _save_queue(queue)


# ------------------------------------------------------------------ #
# Execução do post agendado
# ------------------------------------------------------------------ #

def _run_post(post: dict):
    ig = InstagramPublisher(
        os.getenv("INSTAGRAM_ACCESS_TOKEN"),
        os.getenv("INSTAGRAM_ACCOUNT_ID"),
    )
    kind = post["type"]
    log.info(f"Publicando [{kind}] id={post['id']}")

    try:
        if kind == "photo":
            result = ig.publish_photo(post["image_url"], post.get("caption", ""))
        elif kind == "carousel":
            result = ig.publish_carousel(post["image_urls"], post.get("caption", ""))
        elif kind == "reel":
            result = ig.publish_reel(post["video_url"], post.get("caption", ""))
        elif kind == "story_image":
            result = ig.publish_story_image(post["image_url"])
        elif kind == "story_video":
            result = ig.publish_story_video(post["video_url"])
        else:
            raise ValueError(f"Tipo desconhecido: {kind}")

        log.info(f"Publicado com sucesso: instagram_id={result}")
        _update_status(post["id"], "published")

    except Exception as e:
        log.error(f"Falha ao publicar {post['id']}: {e}")
        _update_status(post["id"], "error", str(e))


# ------------------------------------------------------------------ #
# API pública do scheduler
# ------------------------------------------------------------------ #

class InstagramScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler(timezone="America/Sao_Paulo")

    def start(self):
        self.scheduler.start()
        self._restore_pending()
        log.info("Scheduler iniciado.")

    def stop(self):
        self.scheduler.shutdown()
        log.info("Scheduler encerrado.")

    # Reagenda posts pendentes ao reiniciar o processo
    def _restore_pending(self):
        now = datetime.now()
        for item in _load_queue():
            if item["status"] != "pending":
                continue
            run_at = datetime.fromisoformat(item["scheduled_at"])
            if run_at <= now:
                # Atrasado — publica imediatamente
                log.warning(f"Post atrasado, publicando agora: {item['id']}")
                _run_post(item)
            else:
                self._add_job(item, run_at)

    def _add_job(self, post: dict, run_at: datetime):
        self.scheduler.add_job(
            _run_post,
            trigger=DateTrigger(run_date=run_at),
            args=[post],
            id=post["id"],
            replace_existing=True,
        )

    # ---- métodos para agendar cada tipo ---- #

    def schedule_photo(self, run_at: datetime, image_url: str, caption: str = "") -> str:
        return self._schedule(
            run_at,
            {"type": "photo", "image_url": image_url, "caption": caption},
        )

    def schedule_carousel(self, run_at: datetime, image_urls: list[str], caption: str = "") -> str:
        return self._schedule(
            run_at,
            {"type": "carousel", "image_urls": image_urls, "caption": caption},
        )

    def schedule_reel(self, run_at: datetime, video_url: str, caption: str = "") -> str:
        return self._schedule(
            run_at,
            {"type": "reel", "video_url": video_url, "caption": caption},
        )

    def schedule_story_image(self, run_at: datetime, image_url: str) -> str:
        return self._schedule(run_at, {"type": "story_image", "image_url": image_url})

    def schedule_story_video(self, run_at: datetime, video_url: str) -> str:
        return self._schedule(run_at, {"type": "story_video", "video_url": video_url})

    def _schedule(self, run_at: datetime, payload: dict) -> str:
        post_id = str(uuid4())
        post = {
            "id": post_id,
            "scheduled_at": run_at.isoformat(),
            "status": "pending",
            **payload,
        }
        queue = _load_queue()
        queue.append(post)
        _save_queue(queue)
        self._add_job(post, run_at)
        log.info(f"Agendado [{payload['type']}] para {run_at} | id={post_id}")
        return post_id

    # ---- gerenciar fila ---- #

    def list_pending(self) -> list[dict]:
        return [p for p in _load_queue() if p["status"] == "pending"]

    def cancel(self, post_id: str) -> bool:
        queue = _load_queue()
        for item in queue:
            if item["id"] == post_id and item["status"] == "pending":
                item["status"] = "cancelled"
                _save_queue(queue)
                try:
                    self.scheduler.remove_job(post_id)
                except Exception:
                    pass
                log.info(f"Post cancelado: {post_id}")
                return True
        return False

    def list_all(self) -> list[dict]:
        return _load_queue()
