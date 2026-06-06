import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
ACCOUNT_ID = os.getenv("INSTAGRAM_ACCOUNT_ID")
API_BASE = "https://graph.facebook.com/v19.0"


class InstagramPublisher:
    def __init__(self, access_token: str, account_id: str):
        self.token = access_token
        self.account_id = account_id

    def _post(self, endpoint: str, data: dict) -> dict:
        data["access_token"] = self.token
        resp = requests.post(f"{API_BASE}/{endpoint}", data=data)
        resp.raise_for_status()
        return resp.json()

    def _wait_for_media(self, container_id: str, timeout: int = 120) -> bool:
        """Aguarda o container de vídeo/reel ser processado."""
        deadline = time.time() + timeout
        while time.time() < deadline:
            resp = requests.get(
                f"{API_BASE}/{container_id}",
                params={"fields": "status_code", "access_token": self.token},
            )
            status = resp.json().get("status_code")
            if status == "FINISHED":
                return True
            if status == "ERROR":
                raise RuntimeError(f"Erro ao processar mídia: {container_id}")
            time.sleep(5)
        raise TimeoutError("Timeout aguardando processamento da mídia.")

    # ------------------------------------------------------------------ #
    # FOTO (feed)
    # ------------------------------------------------------------------ #
    def publish_photo(self, image_url: str, caption: str = "") -> str:
        """Publica uma foto no feed. Retorna o ID do post."""
        container = self._post(
            f"{self.account_id}/media",
            {"image_url": image_url, "caption": caption},
        )
        return self._publish_container(container["id"])

    # ------------------------------------------------------------------ #
    # CARROSSEL
    # ------------------------------------------------------------------ #
    def publish_carousel(self, image_urls: list[str], caption: str = "") -> str:
        """Publica um carrossel de imagens. Retorna o ID do post."""
        children = []
        for url in image_urls:
            item = self._post(
                f"{self.account_id}/media",
                {"image_url": url, "is_carousel_item": True},
            )
            children.append(item["id"])

        container = self._post(
            f"{self.account_id}/media",
            {
                "media_type": "CAROUSEL",
                "children": ",".join(children),
                "caption": caption,
            },
        )
        return self._publish_container(container["id"])

    # ------------------------------------------------------------------ #
    # VÍDEO / REEL
    # ------------------------------------------------------------------ #
    def publish_reel(self, video_url: str, caption: str = "") -> str:
        """Publica um Reel. Retorna o ID do post."""
        container = self._post(
            f"{self.account_id}/media",
            {"media_type": "REELS", "video_url": video_url, "caption": caption},
        )
        self._wait_for_media(container["id"])
        return self._publish_container(container["id"])

    # ------------------------------------------------------------------ #
    # STORY — imagem
    # ------------------------------------------------------------------ #
    def publish_story_image(self, image_url: str) -> str:
        """Publica um story de imagem. Retorna o ID do story."""
        container = self._post(
            f"{self.account_id}/media",
            {"media_type": "STORIES", "image_url": image_url},
        )
        return self._publish_container(container["id"])

    # ------------------------------------------------------------------ #
    # STORY — vídeo
    # ------------------------------------------------------------------ #
    def publish_story_video(self, video_url: str) -> str:
        """Publica um story de vídeo. Retorna o ID do story."""
        container = self._post(
            f"{self.account_id}/media",
            {"media_type": "STORIES", "video_url": video_url},
        )
        self._wait_for_media(container["id"])
        return self._publish_container(container["id"])

    # ------------------------------------------------------------------ #
    # Interno: publica o container criado
    # ------------------------------------------------------------------ #
    def _publish_container(self, container_id: str) -> str:
        result = self._post(
            f"{self.account_id}/media_publish",
            {"creation_id": container_id},
        )
        return result["id"]


# ------------------------------------------------------------------ #
# Exemplo de uso
# ------------------------------------------------------------------ #
if __name__ == "__main__":
    ig = InstagramPublisher(ACCESS_TOKEN, ACCOUNT_ID)

    # Foto
    post_id = ig.publish_photo(
        image_url="https://example.com/foto.jpg",
        caption="Minha legenda aqui 🌿 #naplanta",
    )
    print(f"Foto publicada: {post_id}")

    # Carrossel
    post_id = ig.publish_carousel(
        image_urls=[
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg",
            "https://example.com/img3.jpg",
        ],
        caption="Veja nossa seleção 🌱",
    )
    print(f"Carrossel publicado: {post_id}")

    # Reel
    post_id = ig.publish_reel(
        video_url="https://example.com/video.mp4",
        caption="Novo reel! 🎥",
    )
    print(f"Reel publicado: {post_id}")

    # Story (imagem)
    story_id = ig.publish_story_image("https://example.com/story.jpg")
    print(f"Story publicado: {story_id}")
