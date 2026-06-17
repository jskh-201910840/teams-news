from __future__ import annotations

import os

from utils.media import is_valid_https_image_url

DEFAULT_PIAI_THUMBNAIL_URL = (
    "https://raw.githubusercontent.com/jskh-201910840/teams-news/master/assets/piai-logo.png"
)
OFFICIAL_PIAI_LOGO_URL = (
    "https://piai.postech.ac.kr/webroot/images/korean/layout/logo-v3.png"
)


def get_piai_thumbnail_url() -> str | None:
    """Return HTTPS URL for the PIAI card thumbnail (Teams requires HTTPS)."""
    override = os.getenv("PIAI_THUMBNAIL_URL", "").strip()
    if override:
        return override if is_valid_https_image_url(override) else None

    if is_valid_https_image_url(DEFAULT_PIAI_THUMBNAIL_URL):
        return DEFAULT_PIAI_THUMBNAIL_URL

    return (
        OFFICIAL_PIAI_LOGO_URL
        if is_valid_https_image_url(OFFICIAL_PIAI_LOGO_URL)
        else None
    )
