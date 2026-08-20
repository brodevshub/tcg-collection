"""Descarga las imágenes de las cartas desde Cardmarket.

Lee src/data/cards.json, visita cada página de producto, extrae la meta
og:image y guarda la imagen en public/cards/<id>.jpg. Es resumible: las
imágenes ya descargadas se saltan, así que se puede relanzar tras un bloqueo.

Uso:
    pip install cloudscraper beautifulsoup4
    python3 scripts/download_images.py
"""

import json
import re
import sys
from pathlib import Path
from time import sleep

try:
    import cloudscraper
    from bs4 import BeautifulSoup
except ImportError:
    print("Faltan dependencias. Ejecuta: pip install cloudscraper beautifulsoup4")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
CARDS_JSON = ROOT / "src" / "data" / "cards.json"
OUT_DIR = ROOT / "public" / "cards"
DELAY = 2.5
MAX_RETRIES = 4

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}


def extract_image_url(html: str) -> str | None:
    soup = BeautifulSoup(html, "html.parser")
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        return og["content"]
    # Fallback: imagen principal del producto
    img = soup.select_one("#tabContent-info img, .image.card-image img")
    if img and img.get("src"):
        src = img["src"]
        return src if src.startswith("http") else f"https:{src}"
    return None


def fetch_with_retries(scraper, url: str):
    for attempt in range(1, MAX_RETRIES + 1):
        response = scraper.get(url, timeout=30)
        if response.status_code == 429:
            wait = (2**attempt) * 5
            print(f"  429 rate limit, espero {wait}s (intento {attempt}/{MAX_RETRIES})")
            sleep(wait)
            continue
        return response
    return response


def main() -> None:
    cards = json.loads(CARDS_JSON.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    scraper = cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "darwin", "mobile": False},
    )
    scraper.headers.update(HEADERS)

    # Cachea og:image por URL de producto: las variantes Reverse comparten página
    image_url_cache: dict[str, str] = {}
    done, failed, skipped = 0, [], 0

    for i, card in enumerate(cards, 1):
        out_path = OUT_DIR / f"{card['id']}.jpg"
        if out_path.exists():
            skipped += 1
            continue

        product_url = card["cardmarketUrl"]
        print(f"[{i}/{len(cards)}] {card['id']}")

        try:
            image_url = image_url_cache.get(product_url)
            if not image_url:
                response = fetch_with_retries(scraper, product_url)
                if response.status_code != 200:
                    print(f"  HTTP {response.status_code} en la página de producto")
                    failed.append(card["id"])
                    sleep(DELAY)
                    continue
                image_url = extract_image_url(response.text)
                if not image_url:
                    print("  sin og:image")
                    failed.append(card["id"])
                    sleep(DELAY)
                    continue
                image_url_cache[product_url] = image_url

            img_response = fetch_with_retries(scraper, image_url)
            if img_response.status_code != 200 or not img_response.content:
                print(f"  HTTP {img_response.status_code} en la imagen")
                failed.append(card["id"])
            else:
                out_path.write_bytes(img_response.content)
                done += 1
        except Exception as exc:  # noqa: BLE001
            print(f"  error: {exc}")
            failed.append(card["id"])

        sleep(DELAY)

    print(f"\nDescargadas: {done} · Ya existían: {skipped} · Fallidas: {len(failed)}")
    if failed:
        print("Fallidas:", ", ".join(failed))
        print("Relanza el script para reintentar solo las fallidas.")


if __name__ == "__main__":
    main()
