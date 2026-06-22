/** Minimal fields needed for topic/tag inference (avoids circular import with archive.ts) */
export interface NewsItemLike {
  id: string;
  url: string;
  sec: string;
  section: string;
  title: string;
  title_ko: string | null;
  summary: string;
  summary_ko: string | null;
  t: string;
  s: string;
  matched_keywords?: string[];
}

export interface TopicCategory {
  id: string;
  labelKo: string;
  /** Higher weight = stronger signal when multiple topics match */
  priority: number;
  patterns: RegExp[];
}

export interface TagPattern {
  tag: string;
  labelKo: string;
  patterns: RegExp[];
}

/** Broad topic buckets for related-news grouping */
export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: "version-control",
    labelKo: "버전 관리",
    priority: 10,
    patterns: [
      /\bgit\b/i,
      /github/i,
      /gitlab/i,
      /gitea/i,
      /version control/i,
      /pull request/i,
      /merge request/i,
      /commit\b/i,
      /branching/i,
      /버전.?관리/,
      /깃허[브b]/i,
      /소스.?관리/,
    ],
  },
  {
    id: "llm-model-release",
    labelKo: "모델 출시",
    priority: 10,
    patterns: [
      /claude\s*[\d.]/i,
      /gpt-?\s*[\d.]/i,
      /gemini\s*[\d.]/i,
      /llama\s*[\d.]/i,
      /deepseek/i,
      /mistral/i,
      /qwen/i,
      /model release/i,
      /new model/i,
      /foundation model/i,
      /모델 출시/,
      /새.?모델/,
      /파운데이션 모델/,
      /anthropic/i,
      /openai.*(launch|release|announce)/i,
    ],
  },
  {
    id: "ai-agent",
    labelKo: "AI 에이전트",
    priority: 9,
    patterns: [
      /\bagent/i,
      /agentic/i,
      /claude code/i,
      /cursor\b/i,
      /codex/i,
      /mcp\b/i,
      /tool use/i,
      /function calling/i,
      /에이전트/,
      /자율.?에이전트/,
      /coding agent/i,
    ],
  },
  {
    id: "gpu-hardware",
    labelKo: "GPU · 하드웨어",
    priority: 9,
    patterns: [
      /\bgpu\b/i,
      /\bcuda\b/i,
      /\bnvidia\b/i,
      /h100/i,
      /a100/i,
      /blackwell/i,
      /tensor core/i,
      /반도체/,
      /칩셋/,
      /accelerator/i,
      /tpu\b/i,
      /npu\b/i,
    ],
  },
  {
    id: "open-source",
    labelKo: "오픈소스",
    priority: 7,
    patterns: [
      /open.?source/i,
      /오픈.?소스/,
      /apache\s+\d/i,
      /mit license/i,
      /github\.com/i,
      /self-host/i,
    ],
  },
  {
    id: "startup-funding",
    labelKo: "스타트업 · 투자",
    priority: 8,
    patterns: [
      /funding/i,
      /series [abc]/i,
      /venture/i,
      /startup/i,
      /unicorn/i,
      /투자 유치/,
      /시리즈/,
      /스타트업/,
      /벤처/,
    ],
  },
  {
    id: "security",
    labelKo: "보안",
    priority: 9,
    patterns: [
      /security/i,
      /vulnerabilit/i,
      /cve-\d/i,
      /exploit/i,
      /ransomware/i,
      /zero.?day/i,
      /보안/,
      /해킹/,
      /취약점/,
      /사이버/,
    ],
  },
  {
    id: "robotics",
    labelKo: "로봇 · 로보틱스",
    priority: 9,
    patterns: [
      /robot/i,
      /robotics/i,
      /embodied/i,
      /humanoid/i,
      /manipulation/i,
      /로봇/,
      /로보틱스/,
    ],
  },
  {
    id: "korean-policy",
    labelKo: "한국 정책 · 산업",
    priority: 8,
    patterns: [
      /정부/,
      /과기부/,
      /산업부/,
      /규제/,
      /법안/,
      /국회/,
      /삼성/i,
      /sk하이닉스/i,
      /네이버/,
      /카카오/,
      /한국/,
    ],
  },
  {
    id: "pytorch-ml",
    labelKo: "PyTorch · ML",
    priority: 9,
    patterns: [
      /pytorch/i,
      /tensorflow/i,
      /jax\b/i,
      /training loop/i,
      /fine-?tun/i,
      /distillation/i,
      /파이토치/,
      /딥러닝/,
      /머신러닝/,
    ],
  },
  {
    id: "dev-tools",
    labelKo: "개발 도구",
    priority: 7,
    patterns: [
      /ide\b/i,
      /vscode/i,
      /cli\b/i,
      /sdk\b/i,
      /developer tool/i,
      /devtools/i,
      /linter/i,
      /formatter/i,
      /개발.?도구/,
      /프레임워크/,
    ],
  },
  {
    id: "cloud-infra",
    labelKo: "클라우드 · 인프라",
    priority: 8,
    patterns: [
      /kubernetes/i,
      /\bk8s\b/i,
      /docker/i,
      /aws\b/i,
      /azure/i,
      /gcp\b/i,
      /cloud/i,
      /serverless/i,
      /infra/i,
      /클라우드/,
      /컨테이너/,
    ],
  },
  {
    id: "research-paper",
    labelKo: "연구 논문",
    priority: 6,
    patterns: [
      /huggingface\.co\/papers/i,
      /arxiv/i,
      /benchmark/i,
      /dataset/i,
      /state-of-the-art/i,
      /sota\b/i,
      /논문/,
      /벤치마크/,
      /연구/,
    ],
  },
  {
    id: "rag-embedding",
    labelKo: "RAG · 검색",
    priority: 8,
    patterns: [
      /\brag\b/i,
      /retrieval/i,
      /embedding/i,
      /vector (db|database|store)/i,
      /semantic search/i,
      /milvus/i,
      /chromadb/i,
      /pinecone/i,
    ],
  },
  {
    id: "multimodal",
    labelKo: "멀티모달",
    priority: 8,
    patterns: [
      /multimodal/i,
      /vision-?language/i,
      /image generation/i,
      /text-?to-?image/i,
      /video generation/i,
      /diffusion/i,
      /멀티모달/,
      /영상 생성/,
      /이미지 생성/,
    ],
  },
  {
    id: "reasoning-rl",
    labelKo: "추론 · RL",
    priority: 8,
    patterns: [
      /reasoning/i,
      /chain.?of.?thought/i,
      /reinforcement learning/i,
      /\brlhf\b/i,
      /rl\b/i,
      /추론/,
      /강화.?학습/,
    ],
  },
];

/** Finer entity / product tags for overlap scoring */
export const TAG_PATTERNS: TagPattern[] = [
  { tag: "claude", labelKo: "Claude", patterns: [/claude/i, /anthropic/i] },
  { tag: "openai", labelKo: "OpenAI", patterns: [/openai/i, /gpt-?\d/i, /chatgpt/i] },
  { tag: "gemini", labelKo: "Gemini", patterns: [/gemini/i, /google ai/i] },
  { tag: "llama", labelKo: "Llama", patterns: [/llama/i, /meta ai/i] },
  { tag: "git", labelKo: "Git", patterns: [/\bgit\b/i, /github/i] },
  { tag: "cuda", labelKo: "CUDA", patterns: [/\bcuda\b/i, /nvidia/i] },
  { tag: "pytorch", labelKo: "PyTorch", patterns: [/pytorch/i, /파이토치/] },
  { tag: "samsung", labelKo: "삼성", patterns: [/삼성/i, /samsung/i] },
  { tag: "benchmark", labelKo: "벤치마크", patterns: [/benchmark/i, /leaderboard/i, /벤치마크/] },
  { tag: "llm", labelKo: "LLM", patterns: [/\bllm/i, /large language model/i] },
  { tag: "agent", labelKo: "Agent", patterns: [/\bagent/i, /에이전트/] },
  { tag: "rag", labelKo: "RAG", patterns: [/\brag\b/i] },
  { tag: "korean", labelKo: "국내", patterns: [/한국/, /국내/, /서울/] },
];

const topicLabelMap = new Map(TOPIC_CATEGORIES.map((t) => [t.id, t.labelKo]));

const topicCache = new Map<string, string[]>();
const tagCache = new Map<string, string[]>();

function itemText(item: NewsItemLike): string {
  return [item.title, item.title_ko, item.summary, item.summary_ko, item.t, item.s]
    .filter(Boolean)
    .join(" ");
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
  let hits = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) hits += 1;
  }
  return hits;
}

/** Score and rank topic categories; return top 1–3 ids */
export function inferTopics(item: NewsItemLike): string[] {
  const cached = topicCache.get(item.id);
  if (cached) return cached;

  const text = itemText(item);
  const scored = TOPIC_CATEGORIES.map((topic) => ({
    id: topic.id,
    score: countPatternMatches(text, topic.patterns) * topic.priority,
  }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  const topics = scored.slice(0, 3).map((t) => t.id);
  topicCache.set(item.id, topics);
  return topics;
}

/** Finer tags for secondary overlap scoring */
export function inferTags(item: NewsItemLike): string[] {
  const cached = tagCache.get(item.id);
  if (cached) return cached;

  const text = itemText(item);
  const fromPatterns = TAG_PATTERNS.filter((tp) =>
    tp.patterns.some((p) => p.test(text)),
  ).map((tp) => tp.tag);

  const fromKeywords = (item.matched_keywords ?? [])
    .map((kw) => kw.toLowerCase().trim())
    .filter((kw) => kw.length >= 2);

  const tags = [...new Set([...fromPatterns, ...fromKeywords])].slice(0, 8);
  tagCache.set(item.id, tags);
  return tags;
}

export function topicLabelKo(topicId: string): string {
  return topicLabelMap.get(topicId) ?? topicId;
}

export function topicsForItem(item: NewsItemLike): { id: string; labelKo: string }[] {
  return inferTopics(item).map((id) => ({ id, labelKo: topicLabelKo(id) }));
}

/** Best shared topic label between two items (for related card badge) */
export function sharedTopicReason(
  current: NewsItemLike,
  candidate: NewsItemLike,
): string | null {
  const currentTopics = inferTopics(current);
  const candidateTopics = inferTopics(candidate);

  for (const topicId of currentTopics) {
    if (candidateTopics.includes(topicId)) {
      return topicLabelKo(topicId);
    }
  }

  const currentTags = new Set(inferTags(current));
  for (const tag of inferTags(candidate)) {
    if (currentTags.has(tag)) {
      const pattern = TAG_PATTERNS.find((tp) => tp.tag === tag);
      return pattern?.labelKo ?? tag;
    }
  }

  if (current.sec === candidate.sec) {
    return candidate.section.replace(/^[^\s]+\s/, "") || candidate.section;
  }

  return null;
}

export function clearTopicCache(): void {
  topicCache.clear();
  tagCache.clear();
}
