from __future__ import annotations

import logging
import os
import re
from functools import lru_cache

import requests

from collectors.base import DEFAULT_HEADERS
from utils.media import extract_og_image_from_html

logger = logging.getLogger(__name__)

HF_PAPER_ID_RE = re.compile(r"/papers/([^/?#]+)")

# Article og:image scraping is disabled by default (robots.txt / thumbnail policy).
ENABLE_IMAGE_FETCH = os.getenv("ENABLE_IMAGE_FETCH", "false").lower() in {
    "1",
    "true",
    "yes",
}
IMAGE_FETCH_TIMEOUT = float(os.getenv("IMAGE_FETCH_TIMEOUT", "5"))


@lru_cache(maxsize=64)
def fetch_og_image(url: str) -> str | None:
    """Fetch og:image from an article URL. Disabled unless ENABLE_IMAGE_FETCH=true."""
    if not ENABLE_IMAGE_FETCH or not url:
        return None

    try:
        response = requests.get(
            url,
            headers=DEFAULT_HEADERS,
            timeout=IMAGE_FETCH_TIMEOUT,
            allow_redirects=True,
        )
        response.raise_for_status()
        return extract_og_image_from_html(response.text)
    except Exception:
        logger.debug("Failed to fetch image for %s", url, exc_info=True)
        return None
