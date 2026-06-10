# Teams AI / Tech News Bot

AI 연구원·개발자를 위한 **AI/테크 뉴스 자동 수집 봇**입니다.  
GeekNews, AI Times, Hugging Face Daily Papers에서 최근 24시간 이내 기사를 수집하고, 키워드 필터링 후 Microsoft Teams 채널에 **Adaptive Card**로 발행합니다.

## 저장소 구조

```
teams_news/
├── main.py                      # 진입점: 수집 → 필터 → Teams 전송
├── card_builder.py              # Adaptive Card JSON 생성
├── requirements.txt
├── .env.example
├── .github/workflows/cron.yml   # GitHub Actions 스케줄 (매일 09:00 KST)
├── collectors/
│   ├── base.py                  # NewsItem, BaseCollector
│   ├── geeknews.py              # GeekNews RSS
│   ├── aitimes.py               # AI Times RSS
│   └── huggingface.py           # HF Daily Papers API
└── utils/
    ├── filters.py               # 24h·키워드 필터, 요약, 상위 N개 선별
    └── timezone.py              # KST 타임존
```

## 데이터 소스

| 소스 | URL | 방식 |
|------|-----|------|
| GeekNews | `https://news.hada.io/rss/news` | RSS (403 시 `/rss` 폴백) |
| AI Times | `https://cdn.aitimes.com/rss/gn_rss_allArticle.xml` | RSS |
| Hugging Face Papers | `https://huggingface.co/api/daily_papers` | JSON API |

### 수집·필터 기준

- **시간**: 최근 24시간 이내 게시물 (HF Papers는 Daily API 특성상 48시간 완화)
- **키워드**: AI, LLM, Agent, RAG, Deep Learning, Transformer, 오픈소스 등
- **선별**: 키워드 매칭 점수 + 최신순으로 상위 **5~7건** (기본 7건)

## Microsoft Teams 웹훅 설정

### 1. Workflows에서 Incoming Webhook 생성

1. Teams에서 뉴스를 받을 **팀·채널**을 엽니다.
2. 채널 상단 **⋯ (더 보기)** → **Workflows** 를 선택합니다.
3. **Send webhook alerts to a channel** (또는 유사한 "채널에 웹훅으로 메시지 보내기") 템플릿을 선택합니다.
4. 워크플로 이름을 지정하고, 대상 **팀·채널**을 선택합니다.
5. 생성이 완료되면 **Webhook URL** 이 표시됩니다. 이 URL을 복사해 둡니다.

> **참고**: 구 Office 365 Connector는 단계적 폐지 중입니다. 신규 설정은 **Teams Workflows** 웹훅을 사용하세요.

### 2. GitHub Secret 등록

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Name: `TEAMS_WEBHOOK_URL`
4. Value: 1단계에서 복사한 웹훅 URL
5. **Add secret** 저장

### 3. GitHub Actions 스케줄

- **매일 09:00 KST** (UTC 00:00) 자동 실행
- **Actions** 탭 → **Daily AI Tech News Bot** → **Run workflow** 로 수동 실행 가능

## 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `TEAMS_WEBHOOK_URL` | ✅ | — | Teams Workflows 웹훅 URL |
| `DRY_RUN` | | `false` | `true`면 Teams 전송 없이 JSON 출력 |
| `MAX_ITEMS` | | `7` | 카드에 포함할 최대 기사 수 |
| `MIN_ITEMS` | | `5` | 키워드 필터 후 목표 최소 기사 수 |

## 로컬 실행

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows (macOS/Linux: cp .env.example .env)
```

`.env`에 `TEAMS_WEBHOOK_URL`을 설정한 뒤:

```bash
# 실제 Teams 전송
python main.py

# 수집·카드 생성만 확인 (전송 안 함)
python main.py --dry-run
```

## Adaptive Card 형식

- 헤더: `🤖 오늘의 AI/테크 연구 트렌드`
- 각 항목: **제목**, 2~3줄 **요약**, **출처**
- 하단: 항목별 **원문 보기** 버튼 (`Action.OpenUrl`)
- Adaptive Card **v1.4** (Teams Workflows 호환)

## 장애 격리

각 수집기는 독립적으로 실행됩니다. 한 소스(예: GeekNews)가 실패해도 나머지 소스의 뉴스는 정상 발송됩니다.

## 알려진 제약

- **GeekNews**: 루트 `/rss`는 403을 반환할 수 있어 `/rss/news`를 우선 사용합니다.
- **AI Times**: RSS 본문 인코딩이 깨져 보일 수 있으나 제목·링크·날짜는 정상 수집됩니다.
- **Hugging Face**: Daily Papers API는 당일 큐레이션 목록을 반환하며, arXiv 논문은 AI 연구 관련으로 자동 포함됩니다.

## 라이선스

MIT (필요 시 추가)
