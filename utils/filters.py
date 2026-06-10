from __future__ import annotations

import os
import re
from html import unescape

from bs4 import BeautifulSoup

from collectors.base import NewsItem

KEYWORDS: tuple[str, ...] = (
    "ai",
    "llm",
    "agent",
    "rag",
    "deep learning",
    "transformer",
    "오피소스",
    "open source",
    "opensource",
    "gpt",
    "claude",
    "gemini",
    "huggingface",
    "machine learning",
    "추론",
    "연구",
    "fine-tuning",
    "fine tuning",
    "finetuning",
    "multimodal",
    "diffusion",
    "embedding",
    "vector",
    "neural",
    "reinforcement learning",
    "rlhf",
    "mcp",
    "reasoning",
    "vision language",
    "vlm",
    "benchmark",
    "paper",
    "모델",
    "foundation model",
    "inference",
    "training",
    "dataset",
    "open-weight",
    "open weight",
)

HF_SOURCE = "Hugging Face Papers"
MIN_ITEMS = int(os.getenv("MIN_ITEMS", "5"))
MAX_ITEMS = int(os.getenv("MAX_ITEMS", "7"))


def strip_html(text: str) -> str:
    if not text:
        return ""
    if "<" in text and ">" in text:
        text = BeautifulSoup(text, "html.parser").get_text(" ", strip=True)
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def summarize_text(text: str, max_chars: int = 220) -> str:
    clean = strip_html(text)
    if not clean:
        return ""

    sentences = re.split(
        r"(?<=[.!?])\s+|(?<=[。．])\s+|(?<=[！？!?])\s+",
        clean,
    )
    summary_parts: list[str] = []
    total = 0

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if total + len(sentence) > max_chars and summary_parts:
            break
        summary_parts.append(sentence)
        total += len(sentence)
        if len(summary_parts) >= 3:
            break

    if not summary_parts:
        suffix = "…" if len(clean) > max_chars else ""
        return clean[:max_chars].rstrip() + suffix

    summary = " ".join(summary_parts)
    if len(summary) > max_chars:
        summary = summary[: max_chars - 1].rstrip() + "…"
    return summary


def _keyword_hits(text: str) -> list[str]:
    lowered = text.lower()
    hits: list[str] = []
    for keyword in KEYWORDS:
        if keyword.lower() in lowered:
            hits.append(keyword)
    return hits


def score_item(item: NewsItem) -> NewsItem:
    searchable = f"{item.title} {item.summary}"
    hits = _keyword_hits(searchable)

    if item.source == HF_SOURCE:
        item.matched_keywords = hits or ["AI research"]
        item.score = 10 + len(hits) * 2
        return item

    item.matched_keywords = hits
    item.score = len(hits) * 3
    if hits:
        item.score += 2
    return item


def passes_keyword_filter(item: NewsItem) -> bool:
    if item.source == HF_SOURCE:
        return True
    return bool(item.matched_keywords)


def deduplicate_items(items: list[NewsItem]) -> list[NewsItem]:
    seen_urls: set[str] = set()
    seen_titles: set[str] = set()
    unique: list[NewsItem] = []

    for item in sorted(items, key=lambda x: x.published_at, reverse=True):
        url_key = item.url.split("?")[0].rstrip("/").lower()
        title_key = re.sub(r"\s+", " ", item.title.lower()).strip()

        if url_key in seen_urls or title_key in seen_titles:
            continue

        seen_urls.add(url_key)
        seen_titles.add(title_key)
        unique.append(item)

    return unique


def select_top_items(items: list[NewsItem]) -> list[NewsItem]:
    scored = [score_item(item) for item in items]
    filtered = [item for item in scored if passes_keyword_filter(item)]
    filtered = deduplicate_items(filtered)

    ranked = sorted(
        filtered,
        key=lambda item: (item.score, item.published_at),
        reverse=True,
    )

    if len(ranked) >= MIN_ITEMS:
        return ranked[:MAX_ITEMS]

    fallback = deduplicate_items(scored)
    fallback = sorted(fallback, key=lambda item: item.published_at, reverse=True)
    merged: list[NewsItem] = []
    seen: set[str] = set()

    for item in ranked + fallback:
        key = item.url
        if key in seen:
            continue
        seen.add(key)
        merged.append(item)
        if len(merged) >= MAX_ITEMS:
            break

    return merged
