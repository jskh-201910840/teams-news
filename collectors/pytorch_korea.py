from __future__ import annotations

import feedparser
import requests

from collectors.base import DEFAULT_HEADERS, BaseCollector, NewsItem, parse_datetime
from utils.filters import summarize_text
from datetime import timedelta

from utils.timezone import KST, now_kst

# 읽을거리&정보공유 board (Discourse category slug: news, id: 14)
# Category RSS (/c/news/14.rss) is disallowed in robots.txt; use /latest.rss and filter.
PYTORCH_KOREA_BOARD_URL = "https://discuss.pytorch.kr/c/news/14"
PYTORCH_KOREA_RSS_URL = "https://discuss.pytorch.kr/latest.rss"
PYTORCH_KOREA_CATEGORY = "읽을거리&정보공유"


class PyTorchKoreaCollector(BaseCollector):
    source_name = "PyTorch Korea"

    def collect(self) -> list[NewsItem]:
        response = requests.get(
            PYTORCH_KOREA_RSS_URL,
            headers={
                **DEFAULT_HEADERS,
                "Accept": "application/rss+xml, application/xml, text/xml, */*",
            },
            timeout=30,
        )
        response.raise_for_status()
        feed = feedparser.parse(response.content)

        items: list[NewsItem] = []
        cutoff = now_kst() - timedelta(hours=24)
        category_rank = 0

        for entry in feed.entries:
            categories = [
                (tag.get("term") or "").strip()
                for tag in getattr(entry, "tags", None) or []
            ]
            if PYTORCH_KOREA_CATEGORY not in categories:
                continue

            published_at = parse_datetime(
                getattr(entry, "published", None) or getattr(entry, "updated", None)
            )
            if published_at is None:
                continue

            if published_at.tzinfo is None:
                published_at = published_at.replace(tzinfo=KST)

            if published_at < cutoff:
                continue

            title = (entry.get("title") or "").strip()
            link = (entry.get("link") or "").strip()
            if not title or not link:
                continue

            raw_summary = (
                entry.get("summary")
                or entry.get("description")
                or entry.get("content", [{}])[0].get("value", "")
            )
            summary = summarize_text(raw_summary) or title

            feed_rank = max(0, 100 - category_rank)
            category_rank += 1

            items.append(
                NewsItem(
                    title=title,
                    summary=summary,
                    url=link,
                    source=self.source_name,
                    published_at=published_at,
                    popularity=feed_rank,
                )
            )

        return items
